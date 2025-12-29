<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import * as Select from '$ui/select/index.js';
	import * as Tabs from '$ui/tabs';
	import { Checkbox } from '$ui/checkbox';
	import { configStore } from '$stores/config.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { themes } from '$lib/config/themes';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Currency from '@lucide/svelte/icons/currency';
	import Earth from '@lucide/svelte/icons/earth';
	import Languages from '@lucide/svelte/icons/languages';
	import Palette from '@lucide/svelte/icons/palette';
	import RulerDimensionLine from '@lucide/svelte/icons/ruler-dimension-line';
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
	import { Textarea } from '$lib/components/ui/textarea';
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import {
		settings_tab_personalization,
		settings_tab_interface,
		settings_tab_features,
		settings_label_date_format,
		settings_label_locale,
		settings_label_timezone,
		settings_label_currency,
		settings_label_unit_distance,
		settings_label_unit_volume,
		settings_label_theme,
		settings_label_custom_css,
		settings_update_button,
		settings_select_unit_system,
		settings_select_theme
	} from '$lib/paraglide/messages/_index.js';

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
		unitOfVolume: z.enum(['liter', 'gallon']),
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

				const updatedConfig = localConfig.map((item) => {
					if (item.key in f.data) {
						const value = f.data[item.key as keyof typeof f.data];
						// Skip theme as it's not in config table
						if (item.key === 'theme') return item;
						// Convert boolean values to strings for storage
						const stringValue = typeof value === 'boolean' ? String(value) : value;
						return { ...item, value: stringValue };
					}
					return item;
				});

				// Persist configuration before applying a locale change
				await saveConfig(updatedConfig);

				// If locale changed, update Paraglide (triggers reload by default)
				if (f.data.locale && f.data.locale !== getLocale()) {
					try {
						await setLocale(f.data.locale as any);
					} catch (_) {
						/* noop */
					}
				}

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

	const localeLabels: Record<string, string> = {
		en: 'English',
		hi: 'हिंदी',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch'
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
			// Add current theme to form data
			configData.theme = themeStore.theme;
			console.log('Setting form data:', configData);
			formData.set(configData);
		}
	});
</script>

<form id="settings-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<div class="space-y-6">
		<Tabs.Root value="personalization" class="flex w-full flex-col gap-4">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="personalization">{settings_tab_personalization()}</Tabs.Trigger>
				<Tabs.Trigger value="interface">{settings_tab_interface()}</Tabs.Trigger>
				<Tabs.Trigger value="features">{settings_tab_features()}</Tabs.Trigger>
			</Tabs.List>

			<!-- Personalization Tab -->
			<Tabs.Content value="personalization" class="grow space-y-6">
				<fieldset class="flex flex-col gap-4" disabled={processing}>
					<!-- Date Format -->
					<Form.Field {form} name="dateFormat" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Choose your preferred date format"
									>{settings_label_date_format()}</FormLabel
								>
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
								<FormLabel description="Choose the language for the interface"
									>{settings_label_locale()}</FormLabel
								>
								<Select.Root bind:value={$formData.locale} type="single">
									<Select.Trigger {...props} class="w-full">
										<div class="flex items-center justify-start">
											<Languages class="mr-2 h-4 w-4" />
											{localeOptions.find((opt) => opt.value === $formData.locale)?.label ||
												'Select language'}
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
					<!-- Unit of Distance -->
					<Form.Field {form} name="unitOfDistance" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Measurement of distance uint"
									>{settings_label_unit_distance()}</FormLabel
								>
								<Select.Root bind:value={$formData.unitOfDistance} type="single">
									<Select.Trigger {...props} class="w-full">
										<div class="flex items-center justify-start">
											<RulerDimensionLine class="mr-2 h-4 w-4" />
											{uodOptions.find((opt) => opt.value === $formData.unitOfDistance)?.label ||
												settings_select_unit_system()}
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
								<FormLabel description="Measurement of volume unit"
									>{settings_label_unit_volume()}</FormLabel
								>
								<Select.Root bind:value={$formData.unitOfVolume} type="single">
									<Select.Trigger {...props} class="w-full">
										<div class="flex items-center justify-start">
											<Currency class="mr-2 h-4 w-4" />
											{uovOptions.find((opt) => opt.value === $formData.unitOfVolume)?.label ||
												settings_select_unit_system()}
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
								<FormLabel description="Choose your timezone for date display"
									>{settings_label_timezone()}</FormLabel
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
								<FormLabel description="Choose your preferred currency"
									>{settings_label_currency()}</FormLabel
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
				</fieldset>
			</Tabs.Content>

			<!-- Interface Tab -->
			<Tabs.Content value="interface" class="space-y-6">
				<fieldset class="flex flex-col gap-6" disabled={processing}>
					<!-- Theme -->
					<Form.Field {form} name="theme" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="Choose your preferred theme"
									>{settings_label_theme()}</FormLabel
								>
								<Select.Root bind:value={$formData.theme} type="single">
									<Select.Trigger {...props} class="w-full">
										<div class="flex items-center justify-start">
											<Palette class="mr-2 h-4 w-4" />
											{themes[$formData.theme]?.label || settings_select_theme()}
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
					<!-- Custom CSS -->
					<Form.Field {form} name="customCss" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<FormLabel description="CSS Styles for customizing the interface"
									>{settings_label_custom_css()}</FormLabel
								>
								<Textarea
									{...props}
									placeholder="Add your custom CSS here..."
									class="mono h-72 resize-none"
									bind:value={$formData.customCss}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<!-- <div class="border-muted rounded-lg border border-dashed p-6 text-center">
						<p class="text-muted-foreground text-sm">
							No interface settings available yet. Check back soon for themes, layouts, and other UI
							customization options.
						</p>
					</div> -->
				</fieldset>
			</Tabs.Content>

			<!-- Features Tab -->
			<Tabs.Content value="features" class="space-y-6">
				<fieldset class="flex flex-col gap-4" disabled={processing}>
					<div class="space-y-4">
						<div class="text-muted-foreground text-sm">
							Enable or disable features to customize your experience
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
										<Form.Label for="featureFuelLog" class="font-medium">Fuel Log</Form.Label>
										<Form.Description class="text-xs">
											Track and manage fuel consumption and refueling history
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
											Maintenance
										</Form.Label>
										<Form.Description class="text-xs">
											Record and schedule vehicle maintenance activities
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
										<Form.Label for="featurePucc" class="font-medium">Pollution</Form.Label>
										<Form.Description class="text-xs">
											Manage Pollution Under Control Certificate records
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
										<Form.Label for="featureReminders" class="font-medium">Reminders</Form.Label>
										<Form.Description class="text-xs">
											Set and receive reminders for important vehicle events
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
										<Form.Label for="featureInsurance" class="font-medium">Insurance</Form.Label>
										<Form.Description class="text-xs">
											Manage vehicle insurance details and renewals
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
										<Form.Label for="featureOverview" class="font-medium">Overview</Form.Label>
										<Form.Description class="text-xs">
											Display overview dashboard with key vehicle metrics
										</Form.Description>
									</div>
								{/snippet}
							</Form.Control>
						</Form.Field>
					</div>
				</fieldset>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Submit Button -->
		<fieldset disabled={processing} class="flex justify-end gap-2">
			<SubmitButton {processing} class="w-full">{settings_update_button()}</SubmitButton>
		</fieldset>
	</div>
</form>
