<script lang="ts">
	import ReminderTab from '$feature/reminder/ReminderTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
	import {
		feature_reminders_disabled_title,
		feature_reminders_disabled_hint
	} from '$lib/paraglide/messages/_index.js';
</script>

<FeatureGate feature={Features.REMINDERS}>
	{#snippet children()}
		<div id="reminders-page-container" class="w-full">
			<ReminderTab />
		</div>
	{/snippet}
	{#snippet fallback()}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<div class="text-center">
				<p class="text-muted-foreground text-lg font-medium">
					{feature_reminders_disabled_title()}
				</p>
				<p class="text-muted-foreground text-sm">{feature_reminders_disabled_hint()}</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
