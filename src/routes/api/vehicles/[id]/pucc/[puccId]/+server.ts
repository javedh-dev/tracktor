import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as pollutionCertificateService from '$server/services/pollutionCertificateService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC GET error:', async () => {
    const { puccId } = event.params;

    if (!puccId) {
      throw error(400, 'PUCC ID is required');
    }

    const result = await pollutionCertificateService.getPollutionCertificateById(puccId);
    return json(result);
  });
};

export const PUT: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC PUT error:', async () => {
    const { id, puccId } = event.params;

    if (!id || !puccId) {
      throw error(400, 'Vehicle ID and PUCC ID are required');
    }

    // Use body from locals if available (from middleware), otherwise parse it
    const body = event.locals.requestBody || (await event.request.json());

    // Validation for PUCC updates
    if (body.recurrenceType !== 'none') {
      delete body.expiryDate;
    } else if (body.issueDate && body.expiryDate) {
      const issueDate = new Date(body.issueDate);
      const expiryDate = new Date(body.expiryDate);

      if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
        throw error(400, 'Invalid date format');
      }

      if (expiryDate <= issueDate) {
        throw error(400, 'Expiry date must be after issue date');
      }
    }

    // Set default recurrence values if not provided in partial update
    if (body.recurrenceType === undefined) {
      body.recurrenceType = 'none';
    }
    if (body.recurrenceInterval === undefined) {
      body.recurrenceInterval = 1;
    }

    const result = await pollutionCertificateService.updatePollutionCertificate(id, puccId, body);
    return json(result);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return withRouteErrorHandling('PUCC DELETE error:', async () => {
    const { puccId } = event.params;

    if (!puccId) {
      throw error(400, 'PUCC ID is required');
    }

    const result = await pollutionCertificateService.deletePollutionCertificate(puccId);
    return json(result);
  });
};
