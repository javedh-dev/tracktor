<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { config, configModelStore, type Config } from '$lib/stores/config';
	import { Calendar, DollarSign, Ruler, Settings } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';

	let open = $state(false);
	let localConfig: Config[] = $state([]);

	configModelStore.subscribe((data) => {
		open = data.show;
	});

	config.subscribe((value) => {
		localConfig = JSON.parse(JSON.stringify(value));
	});

	// Create a dynamic schema based on config items
	const configSchema = z.object({
		dateFormat: z.string().min(1, 'Date format is required'),
		currency: z.string().min(1, 'Currency is required'),
		unitOfMeasure: z.string().min(1, 'Unit of measure is required')
	});

	const form = superForm(defaults(zod4(configSchema)), {
		validators: zod4(configSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				// Update localConfig with form data
				const updatedConfig = localConfig.map((item) => {
					if (item.key in f.data) {
						return { ...item, value: f.data[item.key as keyof typeof f.data] };
					}
					return item;
				});

				config.save(updatedConfig);
				toast.success('Configuration updated successfully!');
				configModelStore.hide();
			} else {
				toast.error('Please fix the errors in the form.');
				console.error(JSON.stringify(f.data, null, 2));
			}
		}
	});
	const { form: formData, enhance } = form;

	// Options for dropdowns
	const dateFormatOptions = [
		{ value: 'dd/MM/yyyy', label: 'dd/MM/yyyy (e.g., 31/12/2000)' },
		{ value: 'MM/dd/yyyy', label: 'MM/dd/yyyy (e.g., 12/25/2000)' },
		{ value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (e.g., 2000-12-31)' },
		{ value: 'dd MMM, yyyy', label: 'dd MMM, yyyy (e.g., 31 Dec, 2000)' }
	];

	const currencyOptions = [
		{ value: 'INR', label: 'INR (₹)' },
		{ value: 'USD', label: 'USD ($)' },
		{ value: 'EUR', label: 'EUR (€)' },
		{ value: 'GBP', label: 'GBP (£)' }
	];

	const uomOptions = [
		{ value: 'metric', label: 'Metric' },
		{ value: 'imperial', label: 'Imperial' }
	];

	$effect(() => {
		if (localConfig.length > 0) {
			const configData: any = {};
			localConfig.forEach((item) => {
				configData[item.key] = item.value || '';
			});
			formData.set(configData);
		}
	});
</script>

<AppSheet {open} close={() => configModelStore.hide()} title="Settings">
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-6">
			<!-- Date Format -->
			<Form.Field {form} name="dateFormat" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Choose your preferred date format">Date Format</Form.Label>
						<Select.Root bind:value={$formData.dateFormat} type="single">
							<Select.Trigger {...props} class="w-full">
								<Calendar class="mr-2 h-4 w-4" />
								{dateFormatOptions.find((opt) => opt.value === $formData.dateFormat)?.label ||
									'Select date format'}
							</Select.Trigger>
							<Select.Content>
								{#each dateFormatOptions as option}
									<Select.Item value={option.value}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Currency -->
			<Form.Field {form} name="currency" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Choose your preferred currency">Currency</Form.Label>
						<Select.Root bind:value={$formData.currency} type="single">
							<Select.Trigger {...props} class="w-full">
								<DollarSign class="mr-2 h-4 w-4" />
								{currencyOptions.find((opt) => opt.value === $formData.currency)?.label ||
									'Select currency'}
							</Select.Trigger>
							<Select.Content>
								{#each currencyOptions as option}
									<Select.Item value={option.value}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Unit of Measure -->
			<Form.Field {form} name="unitOfMeasure" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Choose your preferred unit system">Unit of Measure</Form.Label>
						<Select.Root bind:value={$formData.unitOfMeasure} type="single">
							<Select.Trigger {...props} class="w-full">
								<Ruler class="mr-2 h-4 w-4" />
								{uomOptions.find((opt) => opt.value === $formData.unitOfMeasure)?.label ||
									'Select unit system'}
							</Select.Trigger>
							<Select.Content>
								{#each uomOptions as option}
									<Select.Item value={option.value}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Button>Update Settings</Form.Button>
		</div>
	</form>
</AppSheet>
