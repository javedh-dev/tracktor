<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';

	let FormComponent = $derived(sheetStore.formComponent);
	let formData = $derived(sheetStore.formData);
	let title = $derived(sheetStore.title);
	let description = $derived(sheetStore.description);
	let open = $derived(sheetStore.open);
</script>

<Sheet.Root {open} onOpenChange={(state) => !state && sheetStore.closeSheet()}>
	<!-- <Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>Open</Sheet.Trigger> -->
	<Sheet.Content side="right" class="w-full px-2 lg:w-sm">
		<Sheet.Header>
			<Sheet.Title class="text-2xl">{title}</Sheet.Title>
			<hr />
			<Sheet.Description>
				{description}
			</Sheet.Description>
		</Sheet.Header>

		<ScrollArea class="h-auto w-full overflow-y-auto whitespace-nowrap " orientation="vertical">
			<div class="px-6 pb-6">
				{#if FormComponent}
					<FormComponent data={formData} />
				{/if}
			</div>
		</ScrollArea>
	</Sheet.Content>
</Sheet.Root>
