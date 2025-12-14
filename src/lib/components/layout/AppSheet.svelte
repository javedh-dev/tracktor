<script lang="ts">
	import * as Sheet from '$ui/sheet/index.js';
	import { sheetStore } from '$stores/sheet.svelte';

	let FormComponent = $derived(sheetStore.formComponent);
	let formData = $derived(sheetStore.formData);
	let title = $derived(sheetStore.title);
	let description = $derived(sheetStore.description);
	let open = $derived(sheetStore.open);
</script>

<Sheet.Root {open} onOpenChange={(state) => !state && sheetStore.closeSheet()}>
	<!-- <Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>Open</Sheet.Trigger> -->
	<Sheet.Content side="right" class="flex w-full flex-col px-2 lg:w-sm">
		<Sheet.Header class="shrink-0">
			<Sheet.Title class="text-2xl">{title}</Sheet.Title>
			<hr />
			<Sheet.Description>
				{description}
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 overflow-y-auto px-6 pb-6">
			{#if FormComponent}
				<FormComponent data={formData} />
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
