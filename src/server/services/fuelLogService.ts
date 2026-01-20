import { AppError, Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import type { ApiResponse } from '$lib/response';
import {
	validateVehicleExists,
	validateVehicleExistsByLicensePlate,
	performDelete
} from '../utils/serviceUtils';

export const addFuelLog = async (vehicleId: string, fuelLogData: any): Promise<ApiResponse> => {
	await validateVehicleExists(vehicleId);
	const fuelLog = await db
		.insert(schema.fuelLogTable)
		.values({
			...fuelLogData,
			id: undefined,
			vehicleId: vehicleId
		})
		.returning();
	return {
		data: fuelLog[0],
		success: true,
		message: 'Fuel log added successfully.'
	};
};

export const getFuelLogs = async (vehicleId: string): Promise<ApiResponse> => {
	// Fetch mileage unit format config
	const mileageFormatConfig = await db.query.configTable.findFirst({
		where: (config, { eq }) => eq(config.key, 'mileageUnitFormat')
	});
	const mileageFormat = mileageFormatConfig?.value || 'distance-per-fuel';

	const fuelLogs = await db.query.fuelLogTable.findMany({
		where: (log, { eq }) => eq(log.vehicleId, vehicleId),
		orderBy: (log, { asc }) => [asc(log.date), asc(log.odometer)]
	});

	// Calculate mileage
	const mileageData = fuelLogs.map((log, index, arr) => {
		// mileage can only be calculated for a full tank and a previous log is needed
		// also need valid odometer and fuel amount values
		if (
			index === 0 ||
			!log.filled ||
			log.missedLast ||
			log.odometer === null ||
			log.fuelAmount === null
		) {
			return { ...log, mileage: null };
		}

		// find the previous full tank log that serves as a starting point
		// a missed log acts as a barrier, preventing searching further back
		let startIndex = -1;
		for (let i = index - 1; i >= 0; i--) {
			if (arr[i]?.filled && arr[i]?.odometer !== null) {
				startIndex = i;
				break;
			}
			if (arr[i]?.missedLast) {
				break;
			}
		}

		// if there is no valid starting log, mileage can't be calculated
		if (startIndex === -1) {
			return { ...log, mileage: null };
		}

		const startLog = arr[startIndex]!;
		const distance = log.odometer - startLog.odometer!;

		// sum all fuel added after the starting log (accounts for partial fills)
		// skip logs with null fuel amounts
		let totalFuel = 0;
		for (let i = startIndex + 1; i <= index; i++) {
			const fuelAmount = arr[i]!.fuelAmount;
			if (fuelAmount !== null) {
				totalFuel += fuelAmount;
			}
		}

		// avoid division by zero and ensure distance is positive
		if (totalFuel === 0 || distance <= 0) {
			return { ...log, mileage: null };
		}

		// Calculate mileage based on format
		let mileage: number;
		if (mileageFormat === 'fuel-per-distance') {
			// Fuel per 100 distance units (e.g., L/100km, gal/100mi)
			mileage = (totalFuel / distance) * 100;
		} else {
			// Distance per fuel unit (e.g., km/L, mpg) - default
			mileage = distance / totalFuel;
		}

		return { ...log, mileage: parseFloat(mileage.toFixed(2)) };
	});
	return {
		data: mileageData,
		success: true
	};
};

export const getFuelLogById = async (id: string): Promise<ApiResponse> => {
	const fuelLog = await db.query.fuelLogTable.findFirst({
		where: (log, { eq }) => eq(log.id, id)
	});

	if (!fuelLog) {
		throw new AppError(`No Fuel Logs found for id : ${id}`, Status.NOT_FOUND);
	}
	return {
		data: fuelLog,
		success: true
	};
};

export const updateFuelLog = async (
	vehicleId: string,
	id: string,
	fuelLogData: any
): Promise<ApiResponse> => {
	// Validate that the fuel log exists and belongs to the specified vehicle
	const fuelLog = await db.query.fuelLogTable.findFirst({
		where: (log, { eq, and }) => and(eq(log.vehicleId, vehicleId), eq(log.id, id))
	});
	if (!fuelLog) {
		throw new AppError(`No Fuel Log found for id: ${id}`, Status.NOT_FOUND);
	}

	const updatedLog = await db
		.update(schema.fuelLogTable)
		.set({
			...fuelLogData
		})
		.where(eq(schema.fuelLogTable.id, id))
		.returning();
	return {
		data: updatedLog[0],
		success: true,
		message: 'Fuel log updated successfully.'
	};
};

export const deleteFuelLog = async (id: string): Promise<ApiResponse> => {
	return await performDelete(schema.fuelLogTable, id, 'Fuel log');
};

export const addFuelLogByLicensePlate = async (
	licensePlate: string,
	fuelLogData: any
): Promise<ApiResponse> => {
	await validateVehicleExistsByLicensePlate(licensePlate);
	const vehicle = await db.query.vehicleTable.findFirst({
		where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate)
	});
	return await addFuelLog(vehicle!.id, fuelLogData);
};

export const getFuelLogsByLicensePlate = async (licensePlate: string): Promise<ApiResponse> => {
	await validateVehicleExistsByLicensePlate(licensePlate);
	const vehicle = await db.query.vehicleTable.findFirst({
		where: (vehicle, { eq }) => eq(vehicle.licensePlate, licensePlate)
	});
	return await getFuelLogs(vehicle!.id);
};
