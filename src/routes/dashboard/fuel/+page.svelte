<script lang="ts">
	import FuelLogTab from '$feature/fuel/FuelLogTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
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
				<p class="text-muted-foreground text-lg font-medium">Fuel Log Feature Disabled</p>
				<p class="text-muted-foreground text-sm">
					Enable this feature in Settings to track fuel consumption
				</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
