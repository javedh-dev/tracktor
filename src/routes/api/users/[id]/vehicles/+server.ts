import type { RequestHandler } from './$types';
import { requestAccess } from '$server/services/access';
import { replaceAssignments } from '$server/services/userService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const PUT: RequestHandler = async (event) =>
  withRouteErrorHandling('Users PUT error:', async () =>
    jsonResponse(
      await replaceAssignments(requestAccess(event), event.params.id, await event.request.json())
    )
  );
