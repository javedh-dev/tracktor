import type { RequestHandler } from './$types';
import * as insuranceService from '$server/services/insuranceService';
import { insuranceSchema } from '$lib/domain/insurance';
import { jsonResponse, parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance GET error:', async () => {
    const { id } = event.params;
    const result = await insuranceService.getInsurances(id);
    return jsonResponse(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance POST error:', async () => {
    const { id } = event.params;
    const parsed = await parseBody(event, insuranceSchema, { vehicleId: id });
    const { id: _, vehicleId: __, ...body } = parsed;
    const result = await insuranceService.addInsurance(id, body);
    return jsonResponse(result, undefined, { status: 201 });
  });
};
