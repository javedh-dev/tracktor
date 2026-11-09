import { requestAccess } from '$server/services/access';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getClientConfigs } from '$server/services/configService';
import { getAllVehicles } from '$server/services/vehicleService';
import { env } from '$lib/config/env.server';

export const load: LayoutServerLoad = async (event) => {
  const user = event.locals.user;
  if (!env.DISABLE_AUTH && !user) throw redirect(307, `${env.BASE_URL}/login`);
  // Fetch configs and vehicles
  const [configs, vehicles] = await Promise.all([
    getClientConfigs(requestAccess(event)),
    getAllVehicles(requestAccess(event))
  ]);

  const rawConfigs = (configs || []).map((c) => ({
    ...c,
    description: c.description ?? undefined
  }));
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
    vehicles: vehicles || []
  };
};
