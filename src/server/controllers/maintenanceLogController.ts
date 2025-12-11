import type { RequestEvent } from '@sveltejs/kit';
import * as maintenanceLogService from '../services/maintenanceLogService';

export const addMaintenanceLog = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const body = await event.request.json();
	const result = await maintenanceLogService.addMaintenanceLog(vehicleId as string, body);
	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getMaintenanceLogs = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const maintenanceLogs = await maintenanceLogService.getMaintenanceLogs(vehicleId as string);
	return new Response(JSON.stringify(maintenanceLogs), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getMaintenanceLogById = async (event: RequestEvent) => {
	const { id } = event.params;
	const maintenanceLog = await maintenanceLogService.getMaintenanceLogById(id as string);
	return new Response(JSON.stringify(maintenanceLog), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const updateMaintenanceLog = async (event: RequestEvent) => {
	const { id } = event.params;
	const body = await event.request.json();
	const result = await maintenanceLogService.updateMaintenanceLog(id as string, body);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const deleteMaintenanceLog = async (event: RequestEvent) => {
	const { id } = event.params;
	const result = await maintenanceLogService.deleteMaintenanceLog(id as string);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
