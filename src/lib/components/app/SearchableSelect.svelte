<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick, type Component } from 'svelte';
	import * as Command from '$ui/command/index.js';
	import * as Popover from '$ui/popover/index.js';
	import { Button } from '$ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import * as m from '$lib/paraglide/messages';

	let {
		options,
		name,
		value = $bindable(),
		icon: Icon
	}: {
		options: { value: string; label: string }[];
		name: string;
		value: string;
		icon: Component;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(options.find((f) => f.value === value)?.label);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		id="searchable-select-trigger"
		bind:ref={triggerRef}
		class="mono flex w-full justify-between"
	>
		{#snippet child({ props })}
			<Button
				id="searchable-select-button"
				variant="outline"
				{...props}
				role="combobox"
				aria-expanded={open}
			>
				<div class="flex items-center gap-2 overflow-hidden font-normal">
					<Icon class="h-5 w-5 opacity-50" />
					<span class="">{selectedValue || value || m.common_select_placeholder({ name })}</span>
				</div>

				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content id="searchable-select-content" class="min-w-xs p-0">
		<Command.Root>
			<Command.Input
				id="searchable-select-input"
				placeholder={m.common_search_placeholder({ name })}
			/>
			<Command.List id="searchable-select-list">
				<Command.Empty>{m.common_no_match_found()}</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							id="searchable-select-option-{option.value}"
							class="searchable-select-option"
							value={option.label}
							onSelect={() => {
								value = option.value;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn('mr-2 size-4', value !== option.value && 'text-transparent')} />
							<span class="">{option.label}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
