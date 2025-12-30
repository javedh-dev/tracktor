import type { LayoutLoad } from './$types';

/**
 * Load configs for all dashboard child routes
 */
export const load: LayoutLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/config');
		const result = await response.json();

		if (result.data && Array.isArray(result.data)) {
			const configsMap: Record<string, boolean | string> = {};
			result.data.forEach((item: { key: string; value?: string }) => {
				if (item.key.startsWith('feature')) {
					configsMap[item.key] = item.value === 'true';
				}
			});

			return {
				configs: configsMap
			};
		}
	} catch (error) {
		console.error('Failed to load configs:', error);
	}

	// Return default configs if fetch fails
	return {
		configs: {
			featureFuelLog: true,
			featureMaintenance: true,
			featurePucc: true,
			featureReminders: true,
			featureInsurance: true,
			featureOverview: true
		}
	};
};
