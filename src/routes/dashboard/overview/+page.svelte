<script lang="ts">
	import OverviewTab from '$feature/overview/OverviewTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
</script>

<FeatureGate feature={Features.OVERVIEW}>
	{#snippet children()}
		<div id="overview-page-container" class="w-full">
			<OverviewTab />
		</div>
	{/snippet}
	{#snippet fallback()}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<div class="text-center">
				<p class="text-muted-foreground text-lg font-medium">Overview Feature Disabled</p>
				<p class="text-muted-foreground text-sm">
					Enable this feature in Settings to view the overview dashboard
				</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
