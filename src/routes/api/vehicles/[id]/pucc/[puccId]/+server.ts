import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { puccId } = event.params;

		if (!puccId) {
			throw error(400, 'PUCC ID is required');
		}

		const result = await pollutionCertificateService.getPollutionCertificateById(puccId);
		return json(result);
	} catch (err) {
		console.error('PUCC GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const { id, puccId } = event.params;

		if (!id || !puccId) {
			throw error(400, 'Vehicle ID and PUCC ID are required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || await event.request.json();

		// Validation for PUCC updates
		if (body.issueDate && body.expiryDate) {
			const issueDate = new Date(body.issueDate);
			const expiryDate = new Date(body.expiryDate);

			if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
				throw error(400, 'Invalid date format');
			}

			if (expiryDate <= issueDate) {
				throw error(400, 'Expiry date must be after issue date');
			}
		}

		const result = await pollutionCertificateService.updatePollutionCertificate(id, puccId, body);
		return json(result);
	} catch (err) {
		console.error('PUCC PUT error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const { puccId } = event.params;

		if (!puccId) {
			throw error(400, 'PUCC ID is required');
		}

		const result = await pollutionCertificateService.deletePollutionCertificate(puccId);
		return json(result);
	} catch (err) {
		console.error('PUCC DELETE error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};