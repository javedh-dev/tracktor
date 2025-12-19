import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * Redirect to the first enabled feature page
 */
export const load: PageLoad = async ({ parent }) => {
	const { configs } = await parent();

	// Priority order for redirecting to enabled features
	const featureRoutes = [
		{ key: 'featureOverview', path: '/dashboard/overview' },
		{ key: 'featureFuelLog', path: '/dashboard/fuel' },
		{ key: 'featureMaintenance', path: '/dashboard/maintenance' },
		{ key: 'featureInsurance', path: '/dashboard/insurance' },
		{ key: 'featurePucc', path: '/dashboard/pollution' },
		{ key: 'featureReminders', path: '/dashboard/reminders' }
	];

	// Find the first enabled feature
	for (const feature of featureRoutes) {
		if (configs?.[feature.key] !== false) {
			throw redirect(307, feature.path);
		}
	}

	// Fallback to overview if all features are somehow disabled
	throw redirect(307, '/dashboard/overview');
};
