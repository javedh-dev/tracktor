<script lang="ts">
	import PollutionTab from '$feature/pollution/PollutionTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
	import {
		feature_pucc_disabled_title,
		feature_pucc_disabled_hint
	} from '$lib/paraglide/messages/_index.js';
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
				<p class="text-muted-foreground text-lg font-medium">{feature_pucc_disabled_title()}</p>
				<p class="text-muted-foreground text-sm">{feature_pucc_disabled_hint()}</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
