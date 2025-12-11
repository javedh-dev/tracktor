import type { RequestEvent } from '@sveltejs/kit';
import * as pollutionCertificateService from '../services/pollutionCertificateService';

export const addPucc = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const body = await event.request.json();
	const result = await pollutionCertificateService.addPollutionCertificate(
		vehicleId as string,
		body
	);
	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { 'Content-Type': 'application/json' }
	});
};

// Alias for backward compatibility
export const addPollutionCertificate = addPucc;

export const getPuccs = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const pollutionCertificates = await pollutionCertificateService.getPollutionCertificates(
		vehicleId as string
	);
	return new Response(JSON.stringify(pollutionCertificates), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

// Alias for backward compatibility
export const getPollutionCertificates = getPuccs;

export const getPuccById = async (event: RequestEvent) => {
	const { id } = event.params;
	const pollutionCertificate = await pollutionCertificateService.getPollutionCertificateById(
		id as string
	);
	return new Response(JSON.stringify(pollutionCertificate), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const updatePucc = async (event: RequestEvent) => {
	const params = event.params as any;
	const vehicleId = params.vehicleId || params.id;
	const puccId = params.puccId || params.id;
	const body = await event.request.json();
	const result = await pollutionCertificateService.updatePollutionCertificate(
		vehicleId as string,
		puccId as string,
		body
	);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

// Alias for backward compatibility
export const updatePollutionCertificate = updatePucc;

export const deletePucc = async (event: RequestEvent) => {
	const { id } = event.params;
	const result = await pollutionCertificateService.deletePollutionCertificate(id as string);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

// Alias for backward compatibility
export const deletePollutionCertificate = deletePucc;
