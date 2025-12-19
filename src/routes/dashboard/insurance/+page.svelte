<script lang="ts">
	import InsuranceTab from '$feature/insurance/InsuranceTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
</script>

<FeatureGate feature={Features.INSURANCE}>
	{#snippet children()}
		<div id="insurance-page-container" class="w-full">
			<InsuranceTab />
		</div>
	{/snippet}
	{#snippet fallback()}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<div class="text-center">
				<p class="text-muted-foreground text-lg font-medium">Insurance Feature Disabled</p>
				<p class="text-muted-foreground text-sm">
					Enable this feature in Settings to manage insurance details
				</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
