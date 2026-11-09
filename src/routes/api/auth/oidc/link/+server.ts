import type { RequestHandler } from './$types';
import { beginOidcRequest } from '$server/utils/oidc-routes';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const POST: RequestHandler = (event) =>
  withRouteErrorHandling('OIDC linking failed', () => beginOidcRequest(event, true));
