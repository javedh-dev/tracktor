import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as autocompleteService from '$server/services/autocompleteService';
import { AppError } from '$server/exceptions/AppError';

export const GET: RequestHandler = async (event) => {
	try {
		const field = event.url.searchParams.get('field');

		if (!field) {
			throw error(400, 'Field parameter is required');
		}

		let result;

		switch (field) {
			case 'serviceCenter':
				result = await autocompleteService.getUniqueServiceCenters();
				break;

			case 'insuranceProvider':
				result = await autocompleteService.getUniqueInsuranceProviders();
				break;

			case 'testingCenter':
				result = await autocompleteService.getUniqueTestingCenters();
				break;

			case 'vehicleMake':
				result = await autocompleteService.getUniqueVehicleMakes();
				break;

			case 'vehicleModel':
				result = await autocompleteService.getUniqueVehicleModels();
				break;

			default:
				throw error(400, `Unsupported field: ${field}`);
		}

		return json(result);
	} catch (err) {
		console.error('Autocomplete GET error:', err);

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
