<script lang="ts">
	import MaintenenceLogTab from '$feature/maintenance/MaintenenceLogTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
</script>

<FeatureGate feature={Features.MAINTENANCE}>
	{#snippet children()}
		<div id="maintenance-page-container" class="w-full">
			<MaintenenceLogTab />
		</div>
	{/snippet}
	{#snippet fallback()}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<div class="text-center">
				<p class="text-muted-foreground text-lg font-medium">Maintenance Feature Disabled</p>
				<p class="text-muted-foreground text-sm">
					Enable this feature in Settings to manage maintenance records
				</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
