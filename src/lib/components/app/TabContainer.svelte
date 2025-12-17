<script lang="ts">
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Button from '$ui/button/button.svelte';
	import LabelWithIcon from './LabelWithIcon.svelte';

	const { title, subtitle = '', addAction = null, addActionDisabled = false, children } = $props();
</script>

<div class="bg-secondary rounded-md p-2 lg:p-8" role="tabpanel" aria-labelledby="dashboard-tab">
	<div class="flex flex-row justify-between">
		<h2 class="mb-6 font-bold underline underline-offset-8 lg:text-2xl">
			{title}
		</h2>
		<p class="text-muted-foreground text-sm">{subtitle}</p>
		{#if addAction}
			<Button
				variant="outline"
				size="sm"
				disabled={addActionDisabled}
				class="cursor-pointer"
				onclick={addAction}
			>
				<LabelWithIcon icon={CirclePlus} label="Add New" />
			</Button>
		{/if}
	</div>
	{@render children()}
</div>
