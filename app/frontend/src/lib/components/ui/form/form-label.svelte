<script lang="ts">
	import * as FormPrimitive from 'formsnap';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils.js';
	import BadgeInfo from '@lucide/svelte/icons/badge-info';
	import * as Popover from '../popover';
	import IconWithPopover from '$lib/components/app/IconWithPopover.svelte';

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
				{#if props.required}
					<span class="text-destructive">*</span>
				{/if}
			</Label>
			{#if description}
				<IconWithPopover
					icon={BadgeInfo}
					tooltip={description}
					side="left"
					className="h-4 w-4 text-foreground/50"
				/>
			{/if}
		</div>
	{/snippet}
</FormPrimitive.Label>
