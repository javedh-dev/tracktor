<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import * as Select from '$ui/select/index.js';
	import * as Tabs from '$ui/tabs';
	import { configStore } from '$stores/config.svelte';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Currency from '@lucide/svelte/icons/currency';
	import Earth from '@lucide/svelte/icons/earth';
	import Languages from '@lucide/svelte/icons/languages';
	import PaintBucket from '@lucide/svelte/icons/paint-bucket';
	import RulerDimensionLine from '@lucide/svelte/icons/ruler-dimension-line';
	import Image from '@lucide/svelte/icons/image';
	import SubmitButton from '$appui/SubmitButton.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';
	import Input from '$appui/input.svelte';
	import { data as currencies } from 'currency-codes';
	import SearchableSelect from '$appui/SearchableSelect.svelte';
	import {
		getCurrencySymbol,
		getTimezoneOptions,
		isValidFormat,
		isValidTimezone
	} from '$lib/helper/format.helper';
	import type { Config } from '$lib/domain/config';
	import { saveConfig } from '$lib/services/config.service';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { sheetStore } from '$stores/sheet.svelte';

	let localConfig: Config[] = $state([]);
	let processing = $state(false);

	$effect(() => {
		localConfig = JSON.parse(JSON.stringify(configStore.rawConfig));
	});

	// Create a dynamic schema based on config items
	const configSchema = z.object({
		dateFormat: z.string().refine((fmt) => {
			return isValidFormat(fmt).valid;
		}, 'Format not valid'),
		locale: z.string().min(2),
		timezone: z.string().min(3).refine(isValidTimezone, 'Invalid timzone value.'),
		currency: z.string().min(1, 'Currency is required'),
		unitOfDistance: z.enum(['kilometer', 'mile']),
		unitOfVolume: z.enum(['liter', 'gallon'])
	});

	const form = superForm(defaults(zod4(configSchema)), {
		validators: zod4(configSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				const updatedConfig = localConfig.map((item) => {
					if (item.key in f.data) {
						return { ...item, value: f.data[item.key as keyof typeof f.data] };
					}
					return item;
				});

				saveConfig(updatedConfig);
				toast.success('Configuration updated successfully!');
				configStore.refreshConfigs();
				sheetStore.closeSheet(vehicleStore.refreshVehicles);
				processing = false;
			}
		}
	});
	const { form: formData, enhance } = form;

	const currencyOptions = currencies.map((currency) => {
		return {
			value: currency.code,
			label: `${getCurrencySymbol(currency.code)} - ${currency.currency} `
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

<form use:enhance onsubmit={(e) => e.preventDefault()}>
	<div class="space-y-6">
		<Tabs.Root value="interface" class="flex w-full flex-col">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="interface">Interface</Tabs.Trigger>
				<Tabs.Trigger value="personalization">Personalization</Tabs.Trigger>
				<Tabs.Trigger value="features">Features</Tabs.Trigger>
			</Tabs.List>

			<!-- Interface Tab -->
			<Tabs.Content value="interface" class="space-y-6">
				<fieldset class="flex flex-col gap-6" disabled={processing}>
					<div class="border-muted rounded-lg border border-dashed p-6 text-center">
						<p class="text-muted-foreground text-sm">
							No interface settings available yet. Check back soon for themes, layouts, and other UI
							customization options.
						</p>
					</div>
				</fieldset>
			</Tabs.Content>

			<!-- Personalization Tab -->
			<Tabs.Content value="personalization" class="grow space-y-6">
				<fieldset class="flex flex-col gap-4" disabled={processing}>
					<!-- Date Format -->
					<Form.Field {form} name="dateFormat" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Choose your preferred date format">Date Format</FormLabel>
								<Input
									{...props}
									bind:value={$formData.dateFormat}
									icon={Calendar}
									type="text"
									class="mono"
								/>
								<Form.Description>
									Example - {isValidFormat($formData.dateFormat).ex || 'Invalid Format...'}
								</Form.Description>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Locale -->
					<Form.Field {form} name="locale" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Locale for formatting">Locale</FormLabel>
								<Input
									{...props}
									bind:value={$formData.locale}
									icon={Languages}
									type="text"
									class="mono"
									disabled
								/>
								<Form.Description>This will be enabled with i18 support</Form.Description>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Unit of Distance -->
					<Form.Field {form} name="unitOfDistance" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Measurement of distance uint">Unit of Distance</FormLabel>
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
								<FormLabel description="Measurement of volume unit">Unit of Volume</FormLabel>
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
					<!-- Timezone -->
					<Form.Field {form} name="timezone" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Choose your timezone for date display">Timezone</FormLabel>
								<SearchableSelect
									bind:value={$formData.timezone}
									options={getTimezoneOptions()}
									icon={Earth}
									{...props}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- Currency -->
					<Form.Field {form} name="currency" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Choose your preferred currency">Currency</FormLabel>
								<SearchableSelect
									bind:value={$formData.currency}
									icon={Currency}
									options={currencyOptions}
									{...props}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</fieldset>
			</Tabs.Content>

			<!-- Features Tab -->
			<Tabs.Content value="features" class="space-y-6">
				<fieldset class="flex flex-col gap-6" disabled={processing}>
					<div class="border-muted rounded-lg border border-dashed p-6 text-center">
						<p class="text-muted-foreground text-sm">
							No features available yet. Check back soon for feature toggles and experimental
							options.
						</p>
					</div>
				</fieldset>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Submit Button -->
		<fieldset disabled={processing} class="flex justify-end gap-2">
			<SubmitButton {processing} class="w-full">Update Settings</SubmitButton>
		</fieldset>
	</div>
</form>
