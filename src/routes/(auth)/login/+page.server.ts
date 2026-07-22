import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUsersCount, validateSession } from '$server/services/authService';
import { env } from '$lib/config/env.server';

export const load: PageServerLoad = async ({ cookies }) => {
  const isAuthDisabled = env.DISABLE_AUTH;

  if (isAuthDisabled) {
    throw redirect(307, '/dashboard');
  }

  // Check if any users exist in the system
  const usersStatus = await getUsersCount();
  if (!usersStatus.hasUsers) {
    throw redirect(307, '/register');
  }

  // Validate current session
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

  return {};
};
