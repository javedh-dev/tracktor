<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import * as Select from '$ui/select/index.js';
	import type { Component } from 'svelte';

	interface Option {
		value: string;
		label: string;
		colorPreview?: string;
	}

	interface Props {
		form: any;
		name: string;
		label: string;
		description?: string;
		icon: Component;
		options: Array<Option>;
		placeholder?: string;
		value: string;
		disabled?: boolean;
	}

	let {
		form,
		name,
		label,
		description,
		icon: Icon,
		options,
		placeholder = 'Select an option',
		value = $bindable(),
		disabled = false
	}: Props = $props();
</script>

<Form.Field {form} {name} class="w-full">
	<Form.Control>
		{#snippet children({ props })}
			<FormLabel {description}>{label}</FormLabel>
			<Select.Root bind:value type="single" {disabled}>
				<Select.Trigger {...props} class="w-full">
					<div class="flex items-center justify-start">
						<Icon class="mr-2 h-4 w-4" />
						{options.find((opt) => opt.value === value)?.label || placeholder}
					</div>
				</Select.Trigger>
				<Select.Content>
					{#each options as option}
						<Select.Item value={option.value}>
							{#if option.colorPreview}
								<div class="flex items-center gap-2">
									<div
										class="border-foreground/20 h-3 w-3 rounded border"
										style="background-color: {option.colorPreview}"
									></div>
									{option.label}
								</div>
							{:else}
								{option.label}
							{/if}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>
