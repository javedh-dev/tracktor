import { AppError } from '../exceptions/AppError';
import { Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq, inArray } from 'drizzle-orm';
import { requireRecord } from './service-response.helper';

export const getAppConfigs = async () => {
  return db.select().from(schema.configTable);
};

export const getAppConfigByKey = async (key: string) => {
  return requireRecord(
    await db
      .select()
      .from(schema.configTable)
      .where(eq(schema.configTable.key, key))
      .limit(1)
      .then((rows) => rows[0]),
    `No config found for key : ${key}`
  );
};

export const getConfigsByKeys = async (keys: string[]) => {
  if (keys.length === 0) return [];
  return db.select().from(schema.configTable).where(inArray(schema.configTable.key, keys));
};

export const updateAppConfig = async (configs: { key: string; value: string }[]) => {
  return db.transaction(async (tx) => {
    const results = await Promise.all(
      configs.map(async (config) => {
        const { key, value } = config;

        if (!key || value === undefined) {
          throw new AppError(
            'Key and value are required for each configuration',
            Status.BAD_REQUEST
          );
        }

        const existingConfig = await tx
          .select()
          .from(schema.configTable)
          .where(eq(schema.configTable.key, key))
          .limit(1)
          .then((rows) => rows[0]);

        if (!existingConfig) {
          const [inserted] = await tx.insert(schema.configTable).values({ key, value }).returning();
          return inserted;
        }

        const [updated] = await tx
          .update(schema.configTable)
          .set({ value })
          .where(eq(schema.configTable.key, key))
          .returning();
        return updated;
      })
    );

    return results;
  });
};
