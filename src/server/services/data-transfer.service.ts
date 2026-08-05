import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { decrypt, encrypt } from '$server/services/crypto.service';
import { AppError, Status } from '$server/exceptions/AppError';

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
