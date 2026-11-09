import type { RequestHandler } from './$types';
import { finishOidcRequest } from '$server/utils/oidc-routes';

export const GET: RequestHandler = finishOidcRequest;
