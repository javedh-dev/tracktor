import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getVehicleSummary } from '$server/services/vehicleService';
import { AppError } from '$server/exceptions/AppError';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const vehicle = await getVehicleSummary(params.id);
    return { vehicle };
  } catch (err) {
    if (err instanceof AppError && err.status === 404) {
      throw error(404, 'Vehicle not found');
    }
    throw err;
  }
};
