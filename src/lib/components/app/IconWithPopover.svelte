<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';
	import * as Popover from '../ui/popover';

	let open = $state(false);

	let {
		icon: Icon,
		className,
		tooltip,
		side = 'top'
	}: {
		icon: Component;
		className: string;
		tooltip: String;
		side: 'top' | 'left' | 'right' | 'bottom';
	} = $props();
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		onmouseenter={() => (open = true)}
		onmouseleave={() => (open = false)}
		onclick={() => {
			open = !open;
		}}
	>
		<Icon class={cn('h-6 w-6', className)} />
	</Popover.Trigger>
	<Popover.Content class="w-fit px-2 py-0.5 text-sm" {side} align="end">
		{tooltip}
	</Popover.Content>
</Popover.Root>
