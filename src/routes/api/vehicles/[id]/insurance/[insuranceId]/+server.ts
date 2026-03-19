import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as insuranceService from '$server/services/insuranceService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance GET error:', async () => {
    const { insuranceId } = event.params;

    if (!insuranceId) {
      throw error(400, 'Insurance ID is required');
    }

    const result = await insuranceService.getInsuranceById(insuranceId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance PUT error:', async () => {
    const { id, insuranceId } = event.params;

    if (!id || !insuranceId) {
      throw error(400, 'Vehicle ID and insurance ID are required');
    }

    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Validation for insurance updates
    if (body.recurrenceType !== 'none') {
      // Ensure endDate is removed when no_end is selected
      delete body.endDate;
    } else if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw error(400, 'Invalid date format');
      }

      if (endDate <= startDate) {
        throw error(400, 'End date must be after start date');
      }
    }

    // Set default recurrence values if not provided in partial update
    if (body.recurrenceType === undefined) {
      body.recurrenceType = 'none';
    }
    if (body.recurrenceInterval === undefined) {
      body.recurrenceInterval = 1;
    }

    const result = await insuranceService.updateInsurance(id, insuranceId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance DELETE error:', async () => {
    const { insuranceId } = event.params;

    if (!insuranceId) {
      throw error(400, 'Insurance ID is required');
    }

    const result = await insuranceService.deleteInsurance(insuranceId);
    return json(result);
  });
};
