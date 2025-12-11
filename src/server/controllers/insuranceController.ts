import type { RequestEvent } from '@sveltejs/kit';
import * as insuranceService from '../services/insuranceService';

export const addInsurance = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const body = await event.request.json();
	const result = await insuranceService.addInsurance(vehicleId as string, body);
	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getInsurances = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const insurances = await insuranceService.getInsurances(vehicleId as string);
	return new Response(JSON.stringify(insurances), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getInsuranceById = async (event: RequestEvent) => {
	const { id } = event.params;
	const insurance = await insuranceService.getInsuranceById(id as string);
	return new Response(JSON.stringify(insurance), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const updateInsurance = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const insuranceId = params.insuranceId || params.id;
	const body = await event.request.json();
	const result = await insuranceService.updateInsurance(
		vehicleId as string,
		insuranceId as string,
		body
	);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const deleteInsurance = async (event: RequestEvent) => {
	const { id } = event.params;
	const result = await insuranceService.deleteInsurance(id as string);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
