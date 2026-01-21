<script lang="ts">
	import {
		isFeatureEnabled,
		areAllFeaturesEnabled,
		isAnyFeatureEnabled
	} from '$lib/helper/feature.helper';
	import { configStore } from '$stores/config.svelte';

	interface Props {
		/**
		 * Single feature name to check (e.g., 'fuelLog')
		 */
		feature?: string;
		/**
		 * Multiple features - all must be enabled (AND logic)
		 */
		requireAll?: string[];
		/**
		 * Multiple features - at least one must be enabled (OR logic)
		 */
		requireAny?: string[];
		/**
		 * Show fallback content when feature is disabled
		 */
		fallback?: any;
		/**
		 * Children to render when feature is enabled
		 */
		children?: any;
	}

	let { feature, requireAll, requireAny, fallback, children }: Props = $props();

	let isEnabled = $derived.by(() => {
		// Force reactivity on config changes
		configStore.configs;

		if (feature) {
			return isFeatureEnabled(feature);
		}

		if (requireAll && requireAll.length > 0) {
			return areAllFeaturesEnabled(requireAll);
		}

		if (requireAny && requireAny.length > 0) {
			return isAnyFeatureEnabled(requireAny);
		}

		// If no feature props provided, always show
		return true;
	});
</script>

{#if isEnabled}
	{@render children?.()}
{:else if fallback}
	{@render fallback()}
{/if}
