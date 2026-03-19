import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as insuranceService from '$server/services/insuranceService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance GET error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    const result = await insuranceService.getInsurances(id);
    return json(result);
  });
};

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Insurance POST error:', async () => {
    const { id } = event.params;

    if (!id) {
      throw error(400, 'Vehicle ID is required');
    }

    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Basic validation for insurance data
    if (!body.provider || !body.policyNumber || !body.startDate) {
      throw error(400, 'Provider, policy number, and start date are required');
    }

    // Validate dates
    const startDate = new Date(body.startDate);

    if (isNaN(startDate.getTime())) {
      throw error(400, 'Invalid start date format');
    }

    // If recurrence is not 'none', ensure endDate is empty and strip it
    if (body.recurrenceType !== 'none') {
      delete body.endDate;
    } else {
      if (!body.endDate) {
        throw error(400, 'End date is required when recurrence is fixed date');
      }
      const endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        throw error(400, 'Invalid end date format');
      }
      if (endDate <= startDate) {
        throw error(400, 'End date must be after start date');
      }
    }

    // Set default recurrence values if not provided
    body.recurrenceType = body.recurrenceType || 'no_end';
    body.recurrenceInterval = body.recurrenceInterval || 1;

    const result = await insuranceService.addInsurance(id, body);
    return json(result, { status: 201 });
  });
};
