import type { RequestEvent } from '@sveltejs/kit';
import * as fuelLogService from '../services/fuelLogService';

export const addFuelLog = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const body = await event.request.json();
	const result = await fuelLogService.addFuelLog(vehicleId as string, body);
	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getFuelLogs = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const fuelLogs = await fuelLogService.getFuelLogs(vehicleId as string);
	return new Response(JSON.stringify(fuelLogs), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getFuelLogById = async (event: RequestEvent) => {
	const { id } = event.params;
	const fuelLog = await fuelLogService.getFuelLogById(id as string);
	return new Response(JSON.stringify(fuelLog), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const updateFuelLog = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const logId = params.logId || params.id;
	const body = await event.request.json();
	const result = await fuelLogService.updateFuelLog(vehicleId as string, logId as string, body);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const deleteFuelLog = async (event: RequestEvent) => {
	const { id } = event.params;
	const result = await fuelLogService.deleteFuelLog(id as string);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

// Add FuelLog by licensePlate
export const addFuelLogByLicensePlate = async (event: RequestEvent) => {
	const params = event.params as any;
	const licensePlate = params.licensePlate;
	const body = await event.request.json();
	const result = await fuelLogService.addFuelLogByLicensePlate(licensePlate as string, body);
	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
};

// Get FuelLogs by licensePlate
export const getFuelLogsByLicensePlate = async (event: RequestEvent) => {
	const params = event.params as any;
	const licensePlate = params.licensePlate;
	const fuelLogs = await fuelLogService.getFuelLogsByLicensePlate(licensePlate as string);
	return new Response(JSON.stringify(fuelLogs), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
