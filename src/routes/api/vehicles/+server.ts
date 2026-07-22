import type { RequestHandler } from './$types';
import * as vehicleService from '$server/services/vehicleService';
import { vehicleSchema } from '$lib/domain/vehicle';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicles GET error:', async () => {
    const result = await vehicleService.getAllVehicles();
    return jsonResponse(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicles POST error:', async () => {
    const parsed = await parseBody(event, vehicleSchema);
    const { id: _, ...body } = parsed;
    const result = await vehicleService.addVehicle(body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Vehicles PUT error:', async () => {
    const parsed = await parseBody(event, vehicleSchema);
    const result = await vehicleService.updateVehicle(parsed.id!, parsed);
    return jsonResponse(result);
  });
};
