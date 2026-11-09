import type { RequestHandler } from './$types';
import { requestAccess } from '$server/services/access';
import { updateManagedUser } from '$server/services/userService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const PATCH: RequestHandler = async (event) =>
  withRouteErrorHandling('Users PATCH error:', async () =>
    jsonResponse(
      await updateManagedUser(requestAccess(event), event.params.id, await event.request.json())
    )
  );
