import type { RequestHandler } from './$types';
import * as complianceService from '$server/services/complianceService';
import { complianceSchema } from '$lib/domain/compliance';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Compliance GET error:', async () => {
    const { complianceId } = event.params;
    const result = await complianceService.getComplianceDocumentById(complianceId);
    return jsonResponse(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Compliance PUT error:', async () => {
    const { id, complianceId } = event.params;
    const parsed = await parseBody(event, complianceSchema.partial(), { vehicleId: id });
    const body = {
      ...parsed,
      recurrenceType: parsed.recurrenceType ?? 'none',
      recurrenceInterval: parsed.recurrenceInterval ?? 1
    };
    const { id: _, vehicleId: __, ...payload } = body;
    const result = await complianceService.updateComplianceDocument(id, complianceId, payload);
    return jsonResponse(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Compliance DELETE error:', async () => {
    const { id, complianceId } = event.params;
    const result = await complianceService.deleteComplianceDocument(id, complianceId);
    return jsonResponse(result);
  });
};
