<script lang="ts">
	import * as Sheet from '$ui/sheet/index.js';
	import { sheetStore } from '$stores/sheet.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let FormComponent = $derived(sheetStore.formComponent);
	let formData = $derived(sheetStore.formData);
	let title = $derived(sheetStore.title);
	let description = $derived(sheetStore.description);
	let open = $derived(sheetStore.open);
</script>

<Sheet.Root {open} onOpenChange={(state) => !state && sheetStore.closeSheet()}>
	<!-- <Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>Open</Sheet.Trigger> -->
	<Sheet.Content id="app-sheet" side="right" class=" flex w-full flex-col px-2">
		<Sheet.Header id="app-sheet-header" class="shrink-0 px-6 pt-6 pb-0">
			<Sheet.Title id="app-sheet-title" class="text-primary text-2xl">{title}</Sheet.Title>
			<hr class="bg-primary/20 h-px" />
			<Sheet.Description id="app-sheet-description">
				{description}
			</Sheet.Description>
		</Sheet.Header>

		<div id="app-sheet-content" class="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 pb-6">
			{#if FormComponent}
				<FormComponent data={formData} />
			{:else}
				<div class="space-y-6 pt-4">
					<div class="space-y-2">
						<Skeleton class="h-4 w-20" />
						<Skeleton class="h-10 w-full" />
					</div>
					<div class="space-y-2">
						<Skeleton class="h-4 w-24" />
						<Skeleton class="h-10 w-full" />
					</div>
					<div class="space-y-2">
						<Skeleton class="h-4 w-16" />
						<Skeleton class="h-10 w-full" />
					</div>
					<div class="space-y-2">
						<Skeleton class="h-4 w-28" />
						<Skeleton class="h-24 w-full" />
					</div>
					<Skeleton class="h-10 w-full" />
				</div>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
