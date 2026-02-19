<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { Component } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	type Props = WithElementRef<
		HTMLInputAttributes & {
			icon?: Component;
			suggestions?: string[];
			loading?: boolean;
		}
	>;

	let {
		ref = $bindable(null),
		value = $bindable(''),
		icon: Icon,
		suggestions = [],
		loading = false,
		class: className,
		placeholder = m.autocomplete_placeholder(),
		...restProps
	}: Props = $props();

	let open = $state(false);
	let inputElement = $state<HTMLInputElement | null>(null);
	let searchValue = $state('');

	// Filter suggestions based on current input value
	const filteredSuggestions = $derived(
		suggestions.filter((s) => s.toLowerCase().includes((searchValue || '').toLowerCase()))
	);

	function handleFocus() {
		searchValue = value || '';
		open = true;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchValue = target.value;
		value = target.value;
		open = true;
	}

	function handleBlur() {
		// Delay closing to allow click on suggestions
		setTimeout(() => {
			open = false;
		}, 200);
	}

	function selectSuggestion(suggestion: string) {
		value = suggestion;
		searchValue = suggestion;
		open = false;
		inputElement?.focus();
	}

	// Sync input display with value when value changes externally
	$effect(() => {
		if (inputElement && value !== undefined && value !== searchValue) {
			searchValue = value;
		}
	});
</script>

<div id="autocomplete-input-wrapper" class="relative">
	<input
		bind:this={inputElement}
		bind:this={ref}
		id="autocomplete-input"
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
		type="text"
		value={searchValue}
		{placeholder}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		{...restProps}
	/>

	{#if Icon}
		<Icon
			id="autocomplete-icon"
			class="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 opacity-50"
			aria-hidden="true"
		/>
	{/if}

	{#if open}
		<div
			class="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
		>
			{#if loading}
				<div class="p-2 text-center text-sm">{m.autocomplete_loading()}</div>
			{:else if filteredSuggestions.length > 0}
				<div class="p-1">
					{#each filteredSuggestions as suggestion (suggestion)}
						<button
							type="button"
							class="hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none"
							onmousedown={(e) => {
								e.preventDefault();
								selectSuggestion(suggestion);
							}}
						>
							{suggestion}
						</button>
					{/each}
				</div>
			{:else}
				<div class="text-muted-foreground p-2 text-center text-sm">
					{m.autocomplete_no_results()}
				</div>
			{/if}
		</div>
	{/if}
</div>
