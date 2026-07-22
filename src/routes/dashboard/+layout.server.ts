import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getAppConfigs } from '$server/services/configService';
import { getAllVehicles } from '$server/services/vehicleService';
import { validateSession } from '$server/services/authService';
import { env } from '$lib/config/env.server';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const isAuthDisabled = env.DISABLE_AUTH;
  let user = null;

  if (!isAuthDisabled) {
    const sessionToken = cookies.get('session');
    if (sessionToken) {
      try {
        const sessionResult = await validateSession(sessionToken);
        user = sessionResult.user;
      } catch {
        // Ignore invalid session
      }
    }

    if (!user) {
      throw redirect(307, '/login');
    }
  }

  // Fetch configs and vehicles
  const [configsResult, vehiclesResult] = await Promise.all([getAppConfigs(), getAllVehicles()]);

  const rawConfigs = configsResult.success ? configsResult.data : [];
  const configsMap: Record<string, boolean | string> = {};
  if (Array.isArray(rawConfigs)) {
    rawConfigs.forEach((item: { key: string; value?: string }) => {
      if (item.key.startsWith('feature')) {
        configsMap[item.key] = item.value === 'true';
      }
    });
  }

  return {
    user,
    rawConfigs,
    configs: configsMap,
    vehicles: vehiclesResult.success ? vehiclesResult.data : []
  };
};
