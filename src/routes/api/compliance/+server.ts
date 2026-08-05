import type { RequestHandler } from './$types';
import * as complianceService from '$server/services/complianceService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async ({ url }) => {
  return withRouteErrorHandling('Compliance GET error:', async () => {
    const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
    const type = url.searchParams.get('type') ?? undefined;
    const result = await complianceService.getComplianceDocuments(vehicleId, type);
    return jsonResponse(result);
  });
};
