import type { RequestEvent } from '@sveltejs/kit';
import * as vehicleService from '../services/vehicleService';

export const addVehicle = async (event: RequestEvent) => {
	const body = await event.request.json();
	const result = await vehicleService.addVehicle(body);
	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getAllVehicles = async (event: RequestEvent) => {
	const vehicles = await vehicleService.getAllVehicles();
	return new Response(JSON.stringify(vehicles), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getVehicleById = async (event: RequestEvent) => {
	const { id } = event.params;
	const vehicle = await vehicleService.getVehicleById(id as string);
	return new Response(JSON.stringify(vehicle), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const updateVehicle = async (event: RequestEvent) => {
	const body = await event.request.json();
	const { id } = body;
	const result = await vehicleService.updateVehicle(id, body);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const deleteVehicle = async (event: RequestEvent) => {
	const { id } = event.params;
	const result = await vehicleService.deleteVehicle(id as string);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
