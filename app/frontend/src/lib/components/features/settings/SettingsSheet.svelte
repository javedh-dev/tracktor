<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { config, configModelStore, type Config } from '$lib/stores/setting';
	import { vehiclesStore } from '$lib/stores/vehicle';
	import {
		Calendar,
		Currency,
		Earth,
		Globe2,
		Languages,
		PaintBucket,
		RulerDimensionLine
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';
	import Input from '$lib/components/ui/input/input.svelte';
	import { format as formatDateFns } from 'date-fns';
	import { data as currencies } from 'currency-codes';

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
		dateFormat: z.string().refine((fmt) => {
			return checkFormat(fmt).valid;
		}, 'Format not valid'),
		locale: z.string().min(2),
		timezone: z.string().min(3),
		currency: z.string().min(1, 'Currency is required'),
		unitOfDistance: z.enum(['kilometer', 'mile']),
		unitOfVolume: z.enum(['liter', 'gallon'])
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
				vehiclesStore.fetchVehicles(localStorage.getItem('userPin') || '');
			} else {
				toast.error('Please fix the errors in the form.');
				console.error(JSON.stringify(f.data, null, 2));
			}
		}
	});
	const { form: formData, enhance } = form;

	const checkFormat = (
		format: string
	): {
		ex?: string;
		valid: boolean;
	} => {
		try {
			return {
				ex: formatDateFns(new Date(), format),
				valid: true
			};
		} catch (e) {
			return { valid: false };
		}
	};

	const currencyOptions = currencies.map((currency) => {
		return {
			value: currency.code,
			label: `[${currency.code}] - ${currency.currency} `
		};
	});

	const uodOptions = [
		{ value: 'kilometer', label: 'Kilometer' },
		{ value: 'mile', label: 'Miles' }
	];

	const uovOptions = [
		{ value: 'liter', label: 'Litre' },
		{ value: 'gallon', label: 'Gallon' }
	];

	const timezoneOptions = [
		{ value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
		{ value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
		{ value: 'America/Chicago', label: 'Central Time (US & Canada)' },
		{ value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
		{ value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
		{ value: 'Europe/London', label: 'London (GMT/BST)' },
		{ value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
		{ value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
		{ value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
		{ value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
		{ value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
		{ value: 'Asia/Kolkata', label: 'India (IST)' },
		{ value: 'Asia/Dubai', label: 'Dubai (GST)' },
		{ value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
		{ value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
		{ value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' }
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
						<Input
							{...props}
							bind:value={$formData.dateFormat}
							icon={Calendar}
							type="text"
							class="mono"
						/>
						<Form.Description>
							Example - {checkFormat($formData.dateFormat).ex || 'Invalid Format...'}
						</Form.Description>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Locale
			<Form.Field {form} name="locale" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Locale for formatting">Locale</Form.Label>
						<Input
							{...props}
							bind:value={$formData.locale}
							icon={Languages}
							type="text"
							class="mono"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field> -->

			<!-- Timezone -->
			<Form.Field {form} name="timezone" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Choose your timezone for date display">Timezone</Form.Label>
						<Select.Root bind:value={$formData.timezone} type="single">
							<Select.Trigger {...props} class="w-full">
								<div class="flex items-center justify-start">
									<Earth class="mr-2 h-4 w-4" />
									{timezoneOptions.find((opt) => opt.value === $formData.timezone)?.label ||
										'Select timezone'}
								</div>
							</Select.Trigger>
							<Select.Content class="max-w-sm">
								{#each timezoneOptions as option}
									<Select.Item value={option.value} class="text-ellipsis">
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
								<div class="flex items-center justify-start">
									<Currency class="mr-2 h-4 w-4" />
									{currencyOptions.find((opt) => opt.value === $formData.currency)?.label ||
										'Select currency'}
								</div>
							</Select.Trigger>
							<Select.Content class="max-w-xs">
								{#each currencyOptions as option}
									<Select.Item value={option.value} class="text-ellipsis">
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Unit of Distance -->
			<Form.Field {form} name="unitOfDistance" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Measurement of distance uint">Unit of Distance</Form.Label>
						<Select.Root bind:value={$formData.unitOfDistance} type="single">
							<Select.Trigger {...props} class="w-full">
								<div class="flex items-center justify-start">
									<RulerDimensionLine class="mr-2 h-4 w-4" />
									{uodOptions.find((opt) => opt.value === $formData.unitOfDistance)?.label ||
										'Select unit system'}
								</div>
							</Select.Trigger>
							<Select.Content>
								{#each uodOptions as option}
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

			<!-- Unit of Volume -->
			<Form.Field {form} name="unitOfVolume" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Measurement of volume unit">Unit of Volume</Form.Label>
						<Select.Root bind:value={$formData.unitOfVolume} type="single">
							<Select.Trigger {...props} class="w-full">
								<div class="flex items-center justify-start">
									<PaintBucket class="mr-2 h-4 w-4" />
									{uovOptions.find((opt) => opt.value === $formData.unitOfVolume)?.label ||
										'Select unit system'}
								</div>
							</Select.Trigger>
							<Select.Content>
								{#each uovOptions as option}
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
