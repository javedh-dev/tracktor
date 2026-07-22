import type { RequestHandler } from './$types';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { pollutionCertificateSchema } from '$lib/domain/pucc';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC GET error:', async () => {
    const { puccId } = event.params;
    const result = await pollutionCertificateService.getPollutionCertificateById(puccId);
    return jsonResponse(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC PUT error:', async () => {
    const { id, puccId } = event.params;
    const parsed = await parseBody(event, pollutionCertificateSchema.partial(), { vehicleId: id });
    const body = {
      ...parsed,
      recurrenceType: parsed.recurrenceType ?? 'none',
      recurrenceInterval: parsed.recurrenceInterval ?? 1
    };
    const { id: _, vehicleId: __, ...payload } = body;
    const result = await pollutionCertificateService.updatePollutionCertificate(
      id,
      puccId,
      payload
    );
    return jsonResponse(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC DELETE error:', async () => {
    const { puccId } = event.params;
    const result = await pollutionCertificateService.deletePollutionCertificate(puccId);
    return jsonResponse(result);
  });
};
