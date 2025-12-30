<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { Component } from 'svelte';
	import ColorPicker from 'svelte-awesome-color-picker';
	import * as Popover from '$ui/popover';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { formatDateForCalendar } from '$lib/helper/format.helper';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'> | 'calendar';

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined }) & {
				icon?: Component;
			}
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		icon: Icon,
		files = $bindable(),
		class: className,
		...restProps
	}: Props = $props();

	let open = $state(false);
</script>

<div id="input-wrapper" class="relative">
	{#if type === 'file'}
		<input
			bind:this={ref}
			id="file-input"
			data-slot="input"
			class={cn(
				'selection:bg-primary dark:bg-input/30 selection:text-primary-foreground border-input',
				'ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0',
				'rounded-md border bg-transparent px-3 pt-1.5 text-sm font-medium shadow-xs',
				'transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
				'aria-invalid:border-destructive',
				className,
				Icon ? 'pr-4 pl-8' : ''
			)}
			type="file"
			bind:files
			bind:value
			{...restProps}
		/>
	{:else if type === 'color'}
		<div
			id="color-input-wrapper"
			class={cn(
				'border-input bg-background selection:bg-primary dark:bg-input/30',
				'selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				'flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow]',
				'items-center justify-start outline-none disabled:cursor-not-allowed disabled:opacity-50',
				className,
				Icon ? 'pr-4 pl-8' : ''
			)}
		>
			<ColorPicker
				position="responsive"
				bind:hex={value}
				label={value?.toUpperCase()}
				isAlpha={false}
				--slider-width="18px"
				--input-size="18px"
			/>
		</div>
	{:else if type == 'calendar'}
		<Popover.Root bind:open>
			<Popover.Trigger
				id="calendar-input-trigger"
				class={cn(
					'border-input bg-background selection:bg-primary dark:bg-input/30',
					'selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground',
					'flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs',
					'transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
					'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
					'aria-invalid:border-destructive items-center',
					className,
					Icon ? 'pr-4 pl-8' : '',
					!value && 'text-muted-foreground'
				)}
			>
				{value || 'Pick a date'}
			</Popover.Trigger>
			<Popover.Content id="calendar-input-popover" class="w-auto p-0">
				<Calendar
					id="date-calendar"
					type="single"
					captionLayout="dropdown"
					onValueChange={(v) => {
						if (v) {
							console.log(v.toString());
							value = formatDateForCalendar(v);
							open = false;
						}
					}}
				/>
			</Popover.Content>
		</Popover.Root>
	{:else}
		<input
			bind:this={ref}
			id="text-input"
			data-slot="input"
			class={cn(
				'border-input bg-background selection:bg-primary dark:bg-input/30',
				'selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground',
				'flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs',
				'transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
				'aria-invalid:border-destructive',
				className,
				Icon ? 'pr-4 pl-8' : ''
			)}
			{type}
			bind:value
			{...restProps}
		/>
	{/if}

	{#if Icon}
		<Icon
			id="input-icon"
			class="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 opacity-50"
			aria-hidden="true"
		/>
	{/if}
</div>
