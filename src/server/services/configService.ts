import { AppError } from '../exceptions/AppError';
import { Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';

export const getAppConfigs = async (): Promise<ApiResponse> => {
	let configs = await db.query.configTable.findMany();
	if (!configs) {
		configs = [];
	}
	return {
		data: configs,
		success: true
	};
};

export const getAppConfigByKey = async (key: string): Promise<ApiResponse> => {
	let config = await db.query.configTable.findFirst({
		where: (configs, { eq }) => eq(configs.key, key)
	});
	if (!config) {
		throw new AppError(`No config found for key : ${key}`, Status.NOT_FOUND);
	}
	return {
		data: config,
		success: true
	};
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
			const existingConfig = await getAppConfigByKey(key);
			let updatedConfig;
			if (!existingConfig) {
				updatedConfig = await db.insert(schema.configTable).values({ key, value }).returning();
			} else {
				updatedConfig = await db
					.update(schema.configTable)
					.set({ value: value })
					.where(eq(schema.configTable.key, key))
					.returning();
			}
			return updatedConfig;
		})
	);
	return {
		data: updatedConfigs,
		success: true
	};
};
