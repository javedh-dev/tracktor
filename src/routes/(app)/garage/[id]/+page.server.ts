import { requestAccess } from '$server/services/access';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getVehicleSummary } from '$server/services/vehicleService';
import { AppError } from '$server/exceptions/AppError';

export const load: PageServerLoad = async (event) => {
  const { params } = event;
  try {
    const vehicle = await getVehicleSummary(requestAccess(event), params.id);
    return { vehicle };
  } catch (err) {
    if (err instanceof AppError) {
      throw error(err.status, err.message);
    }
    throw err;
  }
};
