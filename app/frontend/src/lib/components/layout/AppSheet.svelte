<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';

	let { open, close, title, description = '', children = null } = $props();
</script>

<Sheet.Root
	{open}
	onOpenChangeComplete={(state) => {
		!state && close();
	}}
>
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
				{#if children}
					{@render children()}
				{/if}
			</div>
		</ScrollArea>
	</Sheet.Content>
</Sheet.Root>
