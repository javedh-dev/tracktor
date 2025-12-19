<script lang="ts">
	import ReminderTab from '$feature/reminder/ReminderTab.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';
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
				<p class="text-muted-foreground text-lg font-medium">Reminders Feature Disabled</p>
				<p class="text-muted-foreground text-sm">
					Enable this feature in Settings to manage vehicle reminders
				</p>
			</div>
		</div>
	{/snippet}
</FeatureGate>
