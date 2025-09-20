<script lang="ts">
	import * as FormPrimitive from 'formsnap';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils.js';
	import { BadgeInfo } from '@lucide/svelte/icons';
	import * as Popover from '../popover';

	let {
		ref = $bindable(null),
		children,
		description,
		class: className,
		...restProps
	}: any = $props();
</script>

<FormPrimitive.Label {...restProps} bind:ref tabindex={-1}>
	{#snippet child({ props })}
		<div class="flex flex-row items-center justify-between gap-2">
			<Label
				{...props}
				data-slot="form-label"
				class={cn('data-[fs-error]:text-destructive', className)}
			>
				{@render children?.()}
			</Label>
			{#if description}
				<Popover.Root>
					<Popover.Trigger>
						<BadgeInfo class="text-foreground/50 cursor-pointer" size="15px" />
					</Popover.Trigger>
					<Popover.Content class="w-fit px-2 py-0.5 text-sm" side="left" align="end">
						{description}
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>
	{/snippet}
</FormPrimitive.Label>
