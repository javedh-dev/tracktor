import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { pollutionCertificateSchema } from '$lib/domain/pucc';
import { parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC GET error:', async () => {
    const { id } = event.params;
    const result = await pollutionCertificateService.getPollutionCertificates(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, pollutionCertificateSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await pollutionCertificateService.addPollutionCertificate(id, body);
    return json(result, { status: 201 });
  });
};
