import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { decrypt, encrypt } from '$server/services/crypto.service';
import { AppError, Status } from '$server/exceptions/AppError';
import { z } from 'zod';
import { vehicleSchema } from '$lib/domain/vehicle';
import { fuelSchema } from '$lib/domain/fuel';
import { maintenanceSchema } from '$lib/domain/maintenance';
import { complianceSchema } from '$lib/domain/compliance';
import { reminderSchema } from '$lib/domain/reminder';
import { notificationSchema } from '$lib/domain/notification';
import { notificationProviderTypeSchema } from '$lib/domain/notification-provider';

type DataImportPayload = {
  encrypted?: boolean;
  data?: unknown;
};

type ImportableDataSet = {
  vehicles?: (typeof schema.vehicleTable.$inferInsert)[];
  fuelLogs?: (typeof schema.fuelLogTable.$inferInsert)[];
  maintenanceLogs?: (typeof schema.maintenanceLogTable.$inferInsert)[];
  complianceDocuments?: (typeof schema.complianceDocumentTable.$inferInsert)[];
  reminders?: (typeof schema.reminderTable.$inferInsert)[];
  notifications?: (typeof schema.notificationTable.$inferInsert)[];
  notificationProviders?: (typeof schema.notificationProviderTable.$inferInsert)[];
  configs?: (typeof schema.configTable.$inferInsert)[];
};

// ==================== Import validation ====================
//
// `buildExportData` writes raw table rows (via `db.select()`), and `importDataSet` inserts
// them back as-is — so validation here reuses the *base* domain schemas (which accept ISO
// date strings and full rows including `id`), never the `*FormSchema(dateFormat)` variants,
// which validate locale-formatted dates typed into the UI and would wrongly reject a
// perfectly valid backup. This only rejects structurally invalid rows before they reach the
// database; it does not repair or backfill missing optional fields.

// `vehicleTable.customFields` is a raw JSON-encoded string column — the export/import layer
// never parses it (that only happens in `vehicleService`) — so override the domain schema's
// parsed `Record<string, string>` shape with the raw-string shape actually stored/inserted.
const importVehicleSchema = vehicleSchema.extend({
  customFields: z.string().nullable().optional()
});

// Notification provider `config` is the encrypted JSON envelope produced by
// `encryptWithSecret` — never decrypted for export/import — so this checks the stored shape
// (non-empty strings) rather than `notificationProviderConfigSchema`, which validates the
// *decrypted* config object and would fail on every row here.
const importNotificationProviderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: notificationProviderTypeSchema,
  config: z.string().min(1),
  channels: z.string().min(1),
  isEnabled: z.boolean()
});

function requireRowId(row: unknown, index: number, entity: string): void {
  const id = row && typeof row === 'object' ? (row as Record<string, unknown>).id : undefined;
  if (typeof id !== 'string' || id.length === 0) {
    throw new AppError(`"${entity}[${index}]" is missing a valid "id"`, Status.BAD_REQUEST);
  }
}

function validateImportRows(schema: z.ZodType, rows: unknown, entity: string): void {
  if (rows === undefined) return;

  if (!Array.isArray(rows)) {
    throw new AppError(`"${entity}" must be an array`, Status.BAD_REQUEST);
  }

  rows.forEach((row, index) => {
    requireRowId(row, index, entity);

    const result = schema.safeParse(row);
    if (!result.success) {
      const detail = result.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ');
      throw new AppError(`"${entity}[${index}]" failed validation: ${detail}`, Status.BAD_REQUEST);
    }
  });
}

/** Rejects a structurally invalid import payload before any table is touched. */
export function validateImportDataSet(dataToImport: ImportableDataSet): void {
  validateImportRows(importVehicleSchema, dataToImport.vehicles, 'vehicles');
  validateImportRows(fuelSchema, dataToImport.fuelLogs, 'fuelLogs');
  validateImportRows(maintenanceSchema, dataToImport.maintenanceLogs, 'maintenanceLogs');
  validateImportRows(complianceSchema, dataToImport.complianceDocuments, 'complianceDocuments');
  validateImportRows(reminderSchema, dataToImport.reminders, 'reminders');
  validateImportRows(notificationSchema, dataToImport.notifications, 'notifications');
  validateImportRows(
    importNotificationProviderSchema,
    dataToImport.notificationProviders,
    'notificationProviders'
  );
}

export async function buildExportData(shouldEncrypt: unknown, password?: string) {
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    encrypted: shouldEncrypt,
    data: {
      vehicles: await db.select().from(schema.vehicleTable),
      fuelLogs: await db.select().from(schema.fuelLogTable),
      maintenanceLogs: await db.select().from(schema.maintenanceLogTable),
      complianceDocuments: await db.select().from(schema.complianceDocumentTable),
      reminders: await db.select().from(schema.reminderTable),
      notifications: await db.select().from(schema.notificationTable),
      notificationProviders: await db.select().from(schema.notificationProviderTable),
      configs: await db.select().from(schema.configTable)
    }
  };

  type ExportData = typeof exportData;
  type EncryptedExportData = Omit<ExportData, 'data'> & {
    data: string;
  };

  let finalData: ExportData | EncryptedExportData = exportData;

  if (shouldEncrypt && password) {
    const encryptedData = await encrypt(JSON.stringify(exportData.data), password);
    finalData = {
      ...exportData,
      data: encryptedData
    };
  }

  return finalData;
}

export async function resolveImportData(
  importData: DataImportPayload,
  password?: string
): Promise<ImportableDataSet> {
  if (!importData || typeof importData !== 'object') {
    throw new AppError('Invalid import data format', Status.BAD_REQUEST);
  }

  let dataToImport = importData.data;

  if (importData.encrypted) {
    if (!password) {
      throw new AppError('Password required for encrypted data', Status.BAD_REQUEST);
    }

    if (typeof dataToImport !== 'string') {
      throw new AppError('Invalid encrypted data format', Status.BAD_REQUEST);
    }

    try {
      const decryptedData = await decrypt(dataToImport, password);
      dataToImport = JSON.parse(decryptedData);
    } catch {
      throw new AppError('Failed to decrypt data. Check your password.', Status.BAD_REQUEST);
    }
  }

  if (!dataToImport || typeof dataToImport !== 'object') {
    throw new AppError('Invalid data structure', Status.BAD_REQUEST);
  }

  return dataToImport as ImportableDataSet;
}

export async function importDataSet(dataToImport: ImportableDataSet): Promise<void> {
  validateImportDataSet(dataToImport);

  await db.transaction(async (tx) => {
    // Delete in FK-safe order (children first)
    await tx.delete(schema.notificationTable);
    await tx.delete(schema.reminderTable);
    await tx.delete(schema.complianceDocumentTable);
    await tx.delete(schema.maintenanceLogTable);
    await tx.delete(schema.fuelLogTable);
    await tx.delete(schema.vehicleTable);
    await tx.delete(schema.notificationProviderTable);

    if (dataToImport.vehicles?.length) {
      await tx.insert(schema.vehicleTable).values(dataToImport.vehicles);
    }

    if (dataToImport.fuelLogs?.length) {
      await tx.insert(schema.fuelLogTable).values(dataToImport.fuelLogs);
    }

    if (dataToImport.maintenanceLogs?.length) {
      await tx.insert(schema.maintenanceLogTable).values(dataToImport.maintenanceLogs);
    }

    if (dataToImport.complianceDocuments?.length) {
      await tx.insert(schema.complianceDocumentTable).values(dataToImport.complianceDocuments);
    }

    if (dataToImport.reminders?.length) {
      await tx.insert(schema.reminderTable).values(dataToImport.reminders);
    }

    if (dataToImport.notifications?.length) {
      await tx.insert(schema.notificationTable).values(dataToImport.notifications);
    }

    if (dataToImport.notificationProviders?.length) {
      await tx.insert(schema.notificationProviderTable).values(dataToImport.notificationProviders);
    }

    // Configs are intentionally not imported to preserve system configuration
  });
}
