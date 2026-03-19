import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as autocompleteService from '$server/services/autocompleteService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Autocomplete GET error:', async () => {
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
  });
};
