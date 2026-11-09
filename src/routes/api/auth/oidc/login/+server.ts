import type { RequestHandler } from './$types';
import { beginOidcRequest } from '$server/utils/oidc-routes';
import { withRouteErrorHandling } from '$server/utils/route-handler';

export const GET: RequestHandler = (event) =>
  withRouteErrorHandling('OIDC login failed', () => beginOidcRequest(event, false));
