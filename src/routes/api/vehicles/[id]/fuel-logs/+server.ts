import type { RequestHandler } from './$types';
import * as fuelLogService from '$server/services/fuelLogService';
import { fuelSchema } from '$lib/domain/fuel';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Fuel logs POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, fuelSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await fuelLogService.addFuelLog(id, body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
