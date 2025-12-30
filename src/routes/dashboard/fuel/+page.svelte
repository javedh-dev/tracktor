<script lang="ts">
	import FuelLogTab from '$feature/fuel/FuelLogTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
	import {
		feature_fuel_disabled_title,
		feature_fuel_disabled_hint
	} from '$lib/paraglide/messages/_index.js';
</script>

<FeatureGate feature={Features.FUEL_LOG}>
	{#snippet children()}
		<div id="fuel-page-container" class="w-full">
			<FuelLogTab />
		</div>
	{/snippet}
	{#snippet fallback()}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<div class="text-center">
				<p class="text-muted-foreground text-lg font-medium">{feature_fuel_disabled_title()}</p>
				<p class="text-muted-foreground text-sm">{feature_fuel_disabled_hint()}</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
