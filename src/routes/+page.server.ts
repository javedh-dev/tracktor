import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateSession } from '$server/services/authService';
import { env } from '$lib/config/env.server';

export const load: PageServerLoad = async ({ cookies }) => {
  const isAuthDisabled = env.DISABLE_AUTH;

  if (isAuthDisabled) {
    throw redirect(307, '/dashboard');
  }

  const sessionToken = cookies.get('session');
  let user = null;
  if (sessionToken) {
    try {
      const sessionResult = await validateSession(sessionToken);
      user = sessionResult.user;
    } catch {
      // Ignore invalid session
    }
  }

  if (user) {
    throw redirect(307, '/dashboard');
  }

  throw redirect(307, '/login');
};
