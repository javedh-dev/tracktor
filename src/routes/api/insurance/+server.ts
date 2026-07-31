import type { RequestHandler } from './$types';
import * as insuranceService from '$server/services/insuranceService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async ({ url }) => {
  return withRouteErrorHandling('Insurance GET error:', async () => {
    const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
    const result = await insuranceService.getInsurances(vehicleId);
    return jsonResponse(result);
  });
};
