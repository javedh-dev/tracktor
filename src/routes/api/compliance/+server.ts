import { requestAccess } from '$server/services/access';
import type { RequestHandler } from './$types';
import * as complianceService from '$server/services/complianceService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  const { url } = event;
  return withRouteErrorHandling('Compliance GET error:', async () => {
    const vehicleId = url.searchParams.get('vehicleId') ?? undefined;
    const type = url.searchParams.get('type') ?? undefined;
    const result = await complianceService.getComplianceDocuments(
      requestAccess(event),
      vehicleId,
      type
    );
    return jsonResponse(result);
  });
};
