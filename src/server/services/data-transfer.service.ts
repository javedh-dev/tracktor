import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { decrypt, encrypt } from '$server/services/crypto.service';

type DataImportPayload = {
  encrypted?: boolean;
  data?: unknown;
};

type ImportableDataSet = {
  users?: (typeof schema.usersTable.$inferInsert)[];
  vehicles?: (typeof schema.vehicleTable.$inferInsert)[];
  fuelLogs?: (typeof schema.fuelLogTable.$inferInsert)[];
  maintenanceLogs?: (typeof schema.maintenanceLogTable.$inferInsert)[];
  insurances?: (typeof schema.insuranceTable.$inferInsert)[];
  puccs?: (typeof schema.pollutionCertificateTable.$inferInsert)[];
  sessions?: (typeof schema.sessionsTable.$inferInsert)[];
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
      insurances: await db.select().from(schema.insuranceTable),
      puccs: await db.select().from(schema.pollutionCertificateTable),
      configs: await db.select().from(schema.configTable),
      users: await db.select().from(schema.usersTable),
      sessions: await db.select().from(schema.sessionsTable)
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
): Promise<
  { success: true; data: ImportableDataSet } | { success: false; message: string; status: number }
> {
  if (!importData || typeof importData !== 'object') {
    return {
      success: false,
      message: 'Invalid import data format',
      status: 400
    };
  }

  let dataToImport = importData.data;

  if (importData.encrypted) {
    if (!password) {
      return {
        success: false,
        message: 'Password required for encrypted data',
        status: 400
      };
    }

    if (typeof dataToImport !== 'string') {
      return {
        success: false,
        message: 'Invalid encrypted data format',
        status: 400
      };
    }

    try {
      const decryptedData = await decrypt(dataToImport, password);
      dataToImport = JSON.parse(decryptedData);
    } catch {
      return {
        success: false,
        message: 'Failed to decrypt data. Check your password.',
        status: 400
      };
    }
  }

  if (!dataToImport || typeof dataToImport !== 'object') {
    return {
      success: false,
      message: 'Invalid data structure',
      status: 400
    };
  }

  return {
    success: true,
    data: dataToImport as ImportableDataSet
  };
}

export async function importDataSet(dataToImport: ImportableDataSet): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(schema.sessionsTable);
    await tx.delete(schema.pollutionCertificateTable);
    await tx.delete(schema.insuranceTable);
    await tx.delete(schema.maintenanceLogTable);
    await tx.delete(schema.fuelLogTable);
    await tx.delete(schema.vehicleTable);
    await tx.delete(schema.usersTable);

    if (dataToImport.users?.length) {
      await tx.insert(schema.usersTable).values(dataToImport.users);
    }

    if (dataToImport.vehicles?.length) {
      await tx.insert(schema.vehicleTable).values(dataToImport.vehicles);
    }

    if (dataToImport.fuelLogs?.length) {
      await tx.insert(schema.fuelLogTable).values(dataToImport.fuelLogs);
    }

    if (dataToImport.maintenanceLogs?.length) {
      await tx.insert(schema.maintenanceLogTable).values(dataToImport.maintenanceLogs);
    }

    if (dataToImport.insurances?.length) {
      await tx.insert(schema.insuranceTable).values(dataToImport.insurances);
    }

    if (dataToImport.puccs?.length) {
      await tx.insert(schema.pollutionCertificateTable).values(dataToImport.puccs);
    }

    if (dataToImport.sessions?.length) {
      await tx.insert(schema.sessionsTable).values(dataToImport.sessions);
    }

    // Optionally import configs (commented out to preserve system configs)
    // if (dataToImport.configs?.length) {
    // 	await tx.delete(schema.configTable);
    // 	await tx.insert(schema.configTable).values(dataToImport.configs);
    // }
  });
}
