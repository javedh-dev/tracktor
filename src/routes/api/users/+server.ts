import type { RequestHandler } from './$types';
import { requestAccess } from '$server/services/access';
import { listUsers, createManagedUser } from '$server/services/userService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = async (event) =>
  withRouteErrorHandling('Users GET error:', async () =>
    jsonResponse(await listUsers(requestAccess(event)))
  );

export const POST: RequestHandler = async (event) =>
  withRouteErrorHandling('Users POST error:', async () =>
    jsonResponse(await createManagedUser(requestAccess(event), await event.request.json()))
  );
