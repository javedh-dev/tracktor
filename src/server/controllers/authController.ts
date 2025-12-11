import type { RequestEvent } from '@sveltejs/kit';
import * as pinService from '../services/authService';

export const verifyPin = async (event: RequestEvent) => {
	const { pin } = await event.request.json();
	const result = await pinService.verifyPin(pin);
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const getPinStatus = async (event: RequestEvent) => {
	const result = await pinService.getPinStatus();
	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
