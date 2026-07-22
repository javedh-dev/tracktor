import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as insuranceService from '$server/services/insuranceService';
import { insuranceSchema } from '$lib/domain/insurance';
import { parseBody, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance GET error:', async () => {
    const { insuranceId } = event.params;
    const result = await insuranceService.getInsuranceById(insuranceId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance PUT error:', async () => {
    const { id, insuranceId } = event.params;
    const parsed = await parseBody(event, insuranceSchema.partial(), { vehicleId: id });
    const body = {
      ...parsed,
      recurrenceType: parsed.recurrenceType ?? 'none',
      recurrenceInterval: parsed.recurrenceInterval ?? 1
    };
    const { id: _, vehicleId: __, ...payload } = body;
    const result = await insuranceService.updateInsurance(id, insuranceId, payload);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance DELETE error:', async () => {
    const { insuranceId } = event.params;
    const result = await insuranceService.deleteInsurance(insuranceId);
    return json(result);
  });
};
