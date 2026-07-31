import type { RequestHandler } from './$types';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async ({ url }) => {
  return withRouteErrorHandling('PUCC GET error:', async () => {
    const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
    const result = await pollutionCertificateService.getPollutionCertificates(vehicleId);
    return jsonResponse(result);
  });
};
