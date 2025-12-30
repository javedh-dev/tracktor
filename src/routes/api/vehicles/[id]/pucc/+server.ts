import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		const result = await pollutionCertificateService.getPollutionCertificates(id);
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

export const POST: RequestHandler = async (event) => {
	try {
		const { id } = event.params;

		if (!id) {
			throw error(400, 'Vehicle ID is required');
		}

		// Use body from locals if available (from middleware), otherwise parse it
		const body = event.locals.requestBody || (await event.request.json());

		// Basic validation for PUCC data
		if (!body.certificateNumber || !body.issueDate) {
			throw error(400, 'Certificate number and issue date are required');
		}

		// Validate dates
		const issueDate = new Date(body.issueDate);

		if (isNaN(issueDate.getTime())) {
			throw error(400, 'Invalid issue date format');
		}

		if (body.recurrenceType !== 'none') {
			delete body.expiryDate;
		} else {
			if (!body.expiryDate) {
				throw error(400, 'Expiry date is required when recurrence is fixed date');
			}
			const expiryDate = new Date(body.expiryDate);
			if (isNaN(expiryDate.getTime())) {
				throw error(400, 'Invalid expiry date format');
			}
			if (expiryDate <= issueDate) {
				throw error(400, 'Expiry date must be after issue date');
			}
		}

		// Set default recurrence values if not provided
		body.recurrenceType = body.recurrenceType || 'none';
		body.recurrenceInterval = body.recurrenceInterval || 1;

		const result = await pollutionCertificateService.addPollutionCertificate(id, body);
		return json(result, { status: 201 });
	} catch (err) {
		console.error('PUCC POST error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
