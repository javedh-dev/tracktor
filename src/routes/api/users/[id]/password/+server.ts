import type { RequestHandler } from './$types';
import { requestAccess } from '$server/services/access';
import { resetLocalPassword } from '$server/services/userService';
import { jsonResponse, withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = async (event) =>
  withRouteErrorHandling('Users POST error:', async () =>
    jsonResponse(
      await resetLocalPassword(
        requestAccess(event),
        event.params.id,
        (await event.request.json()).password
      )
    )
  );
