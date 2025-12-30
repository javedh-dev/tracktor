<script lang="ts">
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Import from '@lucide/svelte/icons/import';
	import Button from '$ui/button/button.svelte';
	import LabelWithIcon from './LabelWithIcon.svelte';

	const {
		title,
		addAction = null,
		addActionDisabled = false,
		importAction = null,
		importActionDisabled = false,
		children
	} = $props();
</script>

<div
	id="tab-container"
	class="tab-container lg:bg-secondary rounded-md p-2 lg:p-4"
	role="tabpanel"
	aria-labelledby="dashboard-tab"
>
	<div id="tab-container-header" class="flex flex-row justify-between">
		<h2 id="tab-container-title" class="mb-6 font-bold underline underline-offset-8 lg:text-2xl">
			{title}
		</h2>
		<div class="flex flex-row items-center">
			{#if importAction}
				<Button
					id="tab-container-import-btn"
					variant="outline"
					size="icon-sm"
					class="mr-2 cursor-pointer"
					onclick={importAction}
					disabled={importActionDisabled}
				>
					<Import class="h-4 w-4" />
				</Button>
			{/if}
			{#if addAction}
				<Button
					id="tab-container-add-btn"
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
	</div>
	{@render children()}
</div>
