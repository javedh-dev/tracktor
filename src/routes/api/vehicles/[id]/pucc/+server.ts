import type { RequestHandler } from './$types';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { pollutionCertificateSchema } from '$lib/domain/pucc';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, pollutionCertificateSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await pollutionCertificateService.addPollutionCertificate(id, body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
