<script lang="ts">
	import PollutionTab from '$feature/pollution/PollutionTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
</script>

<FeatureGate feature={Features.PUCC}>
	{#snippet children()}
		<div id="pollution-page-container" class="w-full">
			<PollutionTab />
		</div>
	{/snippet}
	{#snippet fallback()}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<div class="text-center">
				<p class="text-muted-foreground text-lg font-medium">PUCC Feature Disabled</p>
				<p class="text-muted-foreground text-sm">
					Enable this feature in Settings to manage pollution certificates
				</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
