import { AppError } from '../exceptions/AppError';
import { Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';
import { createSuccessResponse, requireRecord } from './service-response.helper';

export const getAppConfigs = async (): Promise<ApiResponse> => {
  const configs = await db.query.configTable.findMany();

  return createSuccessResponse(configs);
};

export const getAppConfigByKey = async (key: string): Promise<ApiResponse> => {
  const config = requireRecord(
    await db.query.configTable.findFirst({
      where: (configs, { eq }) => eq(configs.key, key)
    }),
    `No config found for key : ${key}`
  );

  return createSuccessResponse(config);
};

export const updateAppConfig = async (
  configs: { key: string; value: string }[]
): Promise<ApiResponse> => {
  const updatedConfigs = await Promise.all(
    configs.map(async (config) => {
      const { key, value } = config;

      if (!key || value === undefined) {
        throw new AppError('Key and value are required for each configuration', Status.BAD_REQUEST);
      }

      const existingConfig = await db.query.configTable.findFirst({
        where: (configTable, { eq }) => eq(configTable.key, key)
      });

      if (!existingConfig) {
        return db.insert(schema.configTable).values({ key, value }).returning();
      }

      return db
        .update(schema.configTable)
        .set({ value })
        .where(eq(schema.configTable.key, key))
        .returning();
    })
  );

  return createSuccessResponse(updatedConfigs);
};
