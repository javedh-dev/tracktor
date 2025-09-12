<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';

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

<Tooltip.Provider>
	<Tooltip.Root delayDuration={100}>
		<Tooltip.Trigger>
			<Icon class={cn('h-6 w-6', className)} />
		</Tooltip.Trigger>
		<Tooltip.Content {side} class="bg-accent/75 text-foreground" arrowClasses="hidden">
			{tooltip}
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
