import type { LayoutServerLoad } from './$types';
import { appVersion } from '$server/config/appVersion';

export const load: LayoutServerLoad = async () => ({
  appVersion
});
