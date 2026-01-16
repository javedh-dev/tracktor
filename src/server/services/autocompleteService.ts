import { db } from '../db/index';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema/index';
import type { ApiResponse } from '$lib/response';

/**
 * Get unique values for service centers from maintenance logs
 */
export const getUniqueServiceCenters = async (): Promise<ApiResponse> => {
	const result = await db
		.selectDistinct({ serviceCenter: schema.maintenanceLogTable.serviceCenter })
		.from(schema.maintenanceLogTable)
		.where(
			sql`${schema.maintenanceLogTable.serviceCenter} IS NOT NULL AND ${schema.maintenanceLogTable.serviceCenter} != ''`
		)
		.orderBy(schema.maintenanceLogTable.serviceCenter);

	const values = result.map((r) => r.serviceCenter).filter(Boolean);

	return {
		data: values,
		success: true
	};
};

/**
 * Get unique values for insurance providers
 */
export const getUniqueInsuranceProviders = async (): Promise<ApiResponse> => {
	const result = await db
		.selectDistinct({ provider: schema.insuranceTable.provider })
		.from(schema.insuranceTable)
		.where(
			sql`${schema.insuranceTable.provider} IS NOT NULL AND ${schema.insuranceTable.provider} != ''`
		)
		.orderBy(schema.insuranceTable.provider);

	const values = result.map((r) => r.provider).filter(Boolean);

	return {
		data: values,
		success: true
	};
};

/**
 * Get unique values for pollution certificate testing centers
 */
export const getUniqueTestingCenters = async (): Promise<ApiResponse> => {
	const result = await db
		.selectDistinct({ testingCenter: schema.pollutionCertificateTable.testingCenter })
		.from(schema.pollutionCertificateTable)
		.where(
			sql`${schema.pollutionCertificateTable.testingCenter} IS NOT NULL AND ${schema.pollutionCertificateTable.testingCenter} != ''`
		)
		.orderBy(schema.pollutionCertificateTable.testingCenter);

	const values = result.map((r) => r.testingCenter).filter(Boolean);

	return {
		data: values,
		success: true
	};
};

/**
 * Get unique vehicle makes
 */
export const getUniqueVehicleMakes = async (): Promise<ApiResponse> => {
	const result = await db
		.selectDistinct({ make: schema.vehicleTable.make })
		.from(schema.vehicleTable)
		.where(
			sql`${schema.vehicleTable.make} IS NOT NULL AND ${schema.vehicleTable.make} != ''`
		)
		.orderBy(schema.vehicleTable.make);

	const values = result.map((r) => r.make).filter(Boolean);

	return {
		data: values,
		success: true
	};
};

/**
 * Get unique vehicle models (optionally filtered by make)
 */
export const getUniqueVehicleModels = async (make?: string): Promise<ApiResponse> => {
	let query = db
		.selectDistinct({ model: schema.vehicleTable.model })
		.from(schema.vehicleTable);

	if (make) {
		query = query.where(
			sql`${schema.vehicleTable.make} = ${make} AND ${schema.vehicleTable.model} IS NOT NULL AND ${schema.vehicleTable.model} != ''`
		);
	} else {
		query = query.where(
			sql`${schema.vehicleTable.model} IS NOT NULL AND ${schema.vehicleTable.model} != ''`
		);
	}

	const result = await query.orderBy(schema.vehicleTable.model);

	const values = result.map((r) => r.model).filter(Boolean);

	return {
		data: values,
		success: true
	};
};
