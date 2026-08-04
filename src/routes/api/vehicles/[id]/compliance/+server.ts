import type { RequestHandler } from './$types';
import * as complianceService from '$server/services/complianceService';
import { complianceSchema } from '$lib/domain/compliance';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Compliance POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, complianceSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await complianceService.addComplianceDocument(id, body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
