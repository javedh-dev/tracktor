<script lang="ts">
	import { sheetStore } from '$stores/sheet.svelte';
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import * as Select from '$ui/select/index.js';
	import { Checkbox } from '$ui/checkbox';
	import * as Tabs from '$ui/tabs';
	import { configStore } from '$stores/config.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { themes } from '$lib/config/themes';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Currency from '@lucide/svelte/icons/currency';
	import Earth from '@lucide/svelte/icons/earth';
	import Fuel from '@lucide/svelte/icons/fuel';
	import Languages from '@lucide/svelte/icons/languages';
	import Palette from '@lucide/svelte/icons/palette';
	import RulerDimensionLine from '@lucide/svelte/icons/ruler-dimension-line';
	import Rabbit from '@lucide/svelte/icons/rabbit';
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
	import * as m from '$lib/paraglide/messages';
	import { saveConfig } from '$lib/services/config.service';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime.js';

	let localConfig: Config[] = $state([]);
	let processing = $state(false);
	let activeTab = $state('personalization');

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
		unitOfVolume: z.enum(['liter', 'gallon']),
		unitOfLpg: z.enum(['liter', 'gallon', 'kilogram', 'pound']).default('liter'),
		unitOfCng: z.enum(['liter', 'gallon', 'kilogram', 'pound']).default('kilogram'),
		mileageUnitFormat: z
			.enum(['distance-per-fuel', 'fuel-per-distance'])
			.default('distance-per-fuel'),
		theme: z.string().default('light'),
		customCss: z.string().optional(),
		featureFuelLog: z.boolean().default(true),
		featureMaintenance: z.boolean().default(true),
		featurePucc: z.boolean().default(true),
		featureReminders: z.boolean().default(true),
		featureInsurance: z.boolean().default(true),
		featureOverview: z.boolean().default(true)
	});

	const form = superForm(defaults(zod4(configSchema)), {
		validators: zod4(configSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;

				// Handle theme change
				if (f.data.theme) {
					themeStore.setTheme(f.data.theme as any);
				}

				const configMap = new Map<string, Config>();
				localConfig.forEach((item) => configMap.set(item.key, item));

				Object.entries(f.data).forEach(([key, value]) => {
					if (key === 'theme') return;
					const stringValue =
						typeof value === 'boolean' ? String(value) : ((value || '') as string);
					const existing = configMap.get(key);
					if (existing) {
						configMap.set(key, { ...existing, value: stringValue });
					} else {
						configMap.set(key, { key, value: stringValue });
					}
				});

				const updatedConfig = Array.from(configMap.values());

				// Persist configuration before applying a locale change
				await saveConfig(updatedConfig);

				// If locale changed, update Paraglide (triggers reload by default)
				if (f.data.locale && f.data.locale !== getLocale()) {
					try {
						await setLocale(f.data.locale as any);
					} catch {
						/* noop */
					}
				}

				toast.success(m.settings_updated_success());
				configStore.refreshConfigs();
				sheetStore.closeSheet(vehicleStore.refreshVehicles);
				processing = false;
			}
		}
	});
	const { form: formData, enhance, errors } = form;

	// Map fields to their respective tabs
	const fieldToTab: Record<string, string> = {
		dateFormat: 'personalization',
		locale: 'personalization',
		unitOfDistance: 'units',
		unitOfVolume: 'units',
		unitOfLpg: 'units',
		unitOfCng: 'units',
		mileageUnitFormat: 'units',
		timezone: 'personalization',
		currency: 'personalization',
		theme: 'personalization',
		customCss: 'personalization',
		featureFuelLog: 'features',
		featureMaintenance: 'features',
		featurePucc: 'features',
		featureReminders: 'features',
		featureInsurance: 'features',
		featureOverview: 'features'
	};

	// Navigate to the first tab with errors
	$effect(() => {
		const errorFields = Object.keys($errors);
		if (errorFields.length > 0) {
			const firstErrorField = errorFields[0];
			if (firstErrorField && fieldToTab[firstErrorField]) {
				activeTab = fieldToTab[firstErrorField];
			}
		}
	});

	const currencyOptions = currencies.map((currency) => {
		return {
			value: currency.code,
			label: `${getCurrencySymbol(currency.code)} - ${currency.currency} `
		};
	});

	const uodOptions = [
		{ value: 'kilometer', label: m.common_kilometer() },
		{ value: 'mile', label: m.common_mile() }
	];

	const uovOptions = [
		{ value: 'liter', label: m.common_litre() },
		{ value: 'gallon', label: m.common_gallon() }
	];

	const gasUnitOptions = [
		{ value: 'liter', label: m.common_litre() },
		{ value: 'gallon', label: m.common_gallon() },
		{ value: 'kilogram', label: 'Kilogram (kg)' },
		{ value: 'pound', label: 'Pound (lb)' }
	];

	const mileageUnitFormatOptions = [
		{ value: 'distance-per-fuel', label: m.settings_mileage_format_distance_per_fuel() },
		{ value: 'fuel-per-distance', label: m.settings_mileage_format_fuel_per_distance() }
	];

	const localeLabels: Record<string, string> = {
		en: 'English',
		ar: 'العربية',
		hi: 'हिंदी',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch',
		it: 'Italiano',
		hu: 'Magyar'
	};
	const localeOptions = locales.map((code) => ({
		value: code,
		label: localeLabels[code] || code.toUpperCase()
	}));

	$effect(() => {
		if (localConfig.length > 0) {
			const configData: any = {};
			localConfig.forEach((item) => {
				// Handle boolean values for feature toggles
				if (item.key.startsWith('feature')) {
					configData[item.key] = item.value === 'true';
				} else {
					configData[item.key] = item.value || '';
				}
			});
			const fallbackConfigs = configStore.configs as unknown as Record<string, unknown>;
			['unitOfLpg', 'unitOfCng', 'unitOfVolume', 'unitOfDistance', 'mileageUnitFormat'].forEach(
				(key) => {
					if (configData[key] === undefined) {
						configData[key] = fallbackConfigs[key] as string;
					}
				}
			);
			// Add current theme to form data
			configData.theme = themeStore.theme;
			formData.set(configData);
		}
	});
</script>

<div class="flex min-h-0 w-full flex-1 overflow-hidden">
	<Tabs.Root bind:value={activeTab} class="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
		<Tabs.List class="grid w-auto grid-cols-3">
			<Tabs.Trigger value="personalization">{m.settings_tab_personalization()}</Tabs.Trigger>
			<Tabs.Trigger value="units">{m.settings_tab_units()}</Tabs.Trigger>
			<Tabs.Trigger value="features">{m.settings_tab_features()}</Tabs.Trigger>
		</Tabs.List>

		<form
			id="settings-modal-form"
			use:enhance
			onsubmit={(e) => e.preventDefault()}
			class="flex flex-1 flex-col gap-6 py-6"
		>
			<div class="flex-1 space-y-4">
				<Tabs.Content value="personalization" class="space-y-6">
					<fieldset class="flex flex-col gap-4" disabled={processing}>
						<!-- Theme -->
						<Form.Field {form} name="theme" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<FormLabel description={m.settings_desc_theme()}
										>{m.settings_label_theme()}</FormLabel
									>
									<Select.Root bind:value={$formData.theme} type="single">
										<Select.Trigger {...props} class="w-full">
											<div class="flex items-center justify-start">
												<Palette class="mr-2 h-4 w-4" />
												{themes[$formData.theme]?.label || m.settings_select_theme()}
											</div>
										</Select.Trigger>
										<Select.Content>
											{#each Object.values(themes) as theme (theme.name)}
												<Select.Item value={theme.name}>
													<div class="flex items-center gap-2">
														<div
															class="border-foreground/20 h-3 w-3 rounded border"
															style="background-color: {theme.colors?.primary || '#000'}"
														></div>
														{theme.label}
													</div>
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<!-- Locale -->
						<Form.Field {form} name="locale" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<FormLabel description={m.settings_desc_locale()}
										>{m.settings_label_locale()}</FormLabel
									>
									<Select.Root bind:value={$formData.locale} type="single">
										<Select.Trigger {...props} class="w-full">
											<div class="flex items-center justify-start">
												<Languages class="mr-2 h-4 w-4" />
												{localeOptions.find((opt) => opt.value === $formData.locale)?.label ||
													m.settings_select_language()}
											</div>
										</Select.Trigger>
										<Select.Content>
											{#each localeOptions as option}
												<Select.Item value={option.value}>{option.label}</Select.Item>
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
									<FormLabel description={m.settings_desc_timezone()}
										>{m.settings_label_timezone()}</FormLabel
									>
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
									<FormLabel description={m.settings_desc_currency()}
										>{m.settings_label_currency()}</FormLabel
									>
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
						<!-- Date Format -->
						<Form.Field {form} name="dateFormat" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<FormLabel description={m.settings_desc_date_format()}
										>{m.settings_label_date_format()}</FormLabel
									>
									<Input
										{...props}
										bind:value={$formData.dateFormat}
										icon={Calendar}
										type="text"
										class="mono"
									/>
									<Form.Description>
										{m.common_example_prefix()}
										{isValidFormat($formData.dateFormat).ex || m.common_invalid_format()}
									</Form.Description>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<!-- Custom CSS -->
						<Form.Field {form} name="customCss" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<FormLabel description={m.settings_desc_custom_css()}
										>{m.settings_label_custom_css()}</FormLabel
									>
									<Textarea
										{...props}
										placeholder="Add your custom CSS here..."
										class="mono h-40 resize-none"
										bind:value={$formData.customCss}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</fieldset>
				</Tabs.Content>

				<Tabs.Content value="units" class="space-y-6">
					<fieldset class="flex flex-col gap-4" disabled={processing}>
						<!-- Unit of Distance -->
						<Form.Field {form} name="unitOfDistance" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<FormLabel description={m.settings_desc_unit_distance()}
										>{m.settings_label_unit_distance()}</FormLabel
									>
									<Select.Root bind:value={$formData.unitOfDistance} type="single">
										<Select.Trigger {...props} class="w-full">
											<div class="flex items-center justify-start">
												<RulerDimensionLine class="mr-2 h-4 w-4" />
												{uodOptions.find((opt) => opt.value === $formData.unitOfDistance)?.label ||
													m.settings_select_unit_system()}
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
						<!-- Mileage Unit Format -->
						<Form.Field {form} name="mileageUnitFormat" class="w-full">
							<Form.Control>
								{#snippet children({ props })}
									<FormLabel description={m.settings_desc_mileage_format()}
										>{m.settings_label_mileage_format()}</FormLabel
									>
									<Select.Root bind:value={$formData.mileageUnitFormat} type="single">
										<Select.Trigger {...props} class="w-full">
											<div class="flex items-center justify-start">
												<Rabbit class="mr-2 h-4 w-4" />
												{mileageUnitFormatOptions.find(
													(opt) => opt.value === $formData.mileageUnitFormat
												)?.label || m.settings_select_unit_system()}
											</div>
										</Select.Trigger>
										<Select.Content>
											{#each mileageUnitFormatOptions as option}
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
						<div class="space-y-3">
							<div class="space-y-1">
								<p class="text-sm font-medium">Fuel types</p>
								<p class="text-muted-foreground text-xs">Choose the measurement for each fuel.</p>
							</div>
							<div class="flex flex-col gap-4">
								<!-- Petrol/Diesel -->
								<Form.Field {form} name="unitOfVolume" class="w-full">
									<Form.Control>
										{#snippet children({ props })}
											<FormLabel description={m.settings_desc_unit_volume()}
												>Petrol/Diesel</FormLabel
											>
											<Select.Root bind:value={$formData.unitOfVolume} type="single">
												<Select.Trigger {...props} class="w-full">
													<div class="flex items-center justify-start">
														<Currency class="mr-2 h-4 w-4" />
														{uovOptions.find((opt) => opt.value === $formData.unitOfVolume)
															?.label || m.settings_select_unit_system()}
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
								<!-- LPG -->
								<Form.Field {form} name="unitOfLpg" class="w-full">
									<Form.Control>
										{#snippet children({ props })}
											<FormLabel description={m.settings_desc_unit_volume()}>LPG</FormLabel>
											<Select.Root bind:value={$formData.unitOfLpg} type="single">
												<Select.Trigger {...props} class="w-full">
													<div class="flex items-center justify-start">
														<Fuel class="mr-2 h-4 w-4" />
														{gasUnitOptions.find((opt) => opt.value === $formData.unitOfLpg)
															?.label || m.settings_select_unit_system()}
													</div>
												</Select.Trigger>
												<Select.Content>
													{#each gasUnitOptions as option}
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
								<!-- CNG -->
								<Form.Field {form} name="unitOfCng" class="w-full">
									<Form.Control>
										{#snippet children({ props })}
											<FormLabel description={m.settings_desc_unit_volume()}>CNG</FormLabel>
											<Select.Root bind:value={$formData.unitOfCng} type="single">
												<Select.Trigger {...props} class="w-full">
													<div class="flex items-center justify-start">
														<Fuel class="mr-2 h-4 w-4" />
														{gasUnitOptions.find((opt) => opt.value === $formData.unitOfCng)
															?.label || m.settings_select_unit_system()}
													</div>
												</Select.Trigger>
												<Select.Content>
													{#each gasUnitOptions as option}
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
							</div>
						</div>
					</fieldset>
				</Tabs.Content>

				<Tabs.Content value="features" class="space-y-6">
					<fieldset class="flex flex-col gap-4" disabled={processing}>
						<div class="space-y-4">
							<div class="text-muted-foreground text-sm">
								{m.settings_features_intro()}
							</div>

							<!-- Fuel Log Feature -->
							<Form.Field {form} name="featureFuelLog" class="flex items-center space-x-3">
								<Form.Control>
									{#snippet children({ props })}
										<Checkbox
											{...props}
											bind:checked={$formData.featureFuelLog}
											id="featureFuelLog"
										/>
										<div class="flex flex-col gap-1">
											<Form.Label for="featureFuelLog" class="font-medium"
												>{m.feature_label_fuel()}</Form.Label
											>
											<Form.Description class="text-xs">
												{m.feature_desc_fuel()}
											</Form.Description>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<!-- Maintenance Feature -->
							<Form.Field {form} name="featureMaintenance" class="flex items-center space-x-3">
								<Form.Control>
									{#snippet children({ props })}
										<Checkbox
											{...props}
											bind:checked={$formData.featureMaintenance}
											id="featureMaintenance"
										/>
										<div class="flex flex-col gap-1">
											<Form.Label for="featureMaintenance" class="font-medium">
												{m.feature_label_maintenance()}
											</Form.Label>
											<Form.Description class="text-xs">
												{m.feature_desc_maintenance()}
											</Form.Description>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<!-- PUCC Feature -->
							<Form.Field {form} name="featurePucc" class="flex items-center space-x-3">
								<Form.Control>
									{#snippet children({ props })}
										<Checkbox {...props} bind:checked={$formData.featurePucc} id="featurePucc" />
										<div class="flex flex-col gap-1">
											<Form.Label for="featurePucc" class="font-medium"
												>{m.feature_label_pollution()}</Form.Label
											>
											<Form.Description class="text-xs">
												{m.feature_desc_pollution()}
											</Form.Description>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<!-- Reminders Feature -->
							<Form.Field {form} name="featureReminders" class="flex items-center space-x-3">
								<Form.Control>
									{#snippet children({ props })}
										<Checkbox
											{...props}
											bind:checked={$formData.featureReminders}
											id="featureReminders"
										/>
										<div class="flex flex-col gap-1">
											<Form.Label for="featureReminders" class="font-medium"
												>{m.feature_label_reminders()}</Form.Label
											>
											<Form.Description class="text-xs">
												{m.feature_desc_reminders()}
											</Form.Description>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<!-- Insurance Feature -->
							<Form.Field {form} name="featureInsurance" class="flex items-center space-x-3">
								<Form.Control>
									{#snippet children({ props })}
										<Checkbox
											{...props}
											bind:checked={$formData.featureInsurance}
											id="featureInsurance"
										/>
										<div class="flex flex-col gap-1">
											<Form.Label for="featureInsurance" class="font-medium"
												>{m.feature_label_insurance()}</Form.Label
											>
											<Form.Description class="text-xs">
												{m.feature_desc_insurance()}
											</Form.Description>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<!-- Overview Feature -->
							<Form.Field {form} name="featureOverview" class="flex items-center space-x-3">
								<Form.Control>
									{#snippet children({ props })}
										<Checkbox
											{...props}
											bind:checked={$formData.featureOverview}
											id="featureOverview"
										/>
										<div class="flex flex-col gap-1">
											<Form.Label for="featureOverview" class="font-medium"
												>{m.feature_label_overview()}</Form.Label
											>
											<Form.Description class="text-xs">
												{m.feature_desc_overview()}
											</Form.Description>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>
						</div>
					</fieldset>
				</Tabs.Content>
			</div>

			<!-- Submit Button -->
			<fieldset disabled={processing} class=" flex justify-center gap-2">
				<SubmitButton {processing} class="w-full">{m.settings_update_button()}</SubmitButton>
			</fieldset>
		</form>
	</Tabs.Root>
</div>
