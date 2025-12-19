import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * Load function that checks if the Maintenance feature is enabled
 * Redirects to overview if disabled
 */
export const load: PageLoad = async ({ parent }) => {
	const { configs } = await parent();

	if (configs?.featureMaintenance === false) {
		throw redirect(307, '/dashboard/overview');
	}

	return {};
};
