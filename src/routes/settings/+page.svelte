<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import * as Card from '$ui/card';
	import SettingsSelectField from '$feature/settings/SettingsSelectField.svelte';
	import SettingsFeatureToggle from '$feature/settings/SettingsFeatureToggle.svelte';
	import SettingsSectionHeader from '$feature/settings/SettingsSectionHeader.svelte';
	import CronInput from '$feature/settings/CronInput.svelte';
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
	import Settings from '@lucide/svelte/icons/settings';
	import Gauge from '@lucide/svelte/icons/gauge';
	import ToggleLeft from '@lucide/svelte/icons/toggle-left';
	import Clock from '@lucide/svelte/icons/clock';
	import Bell from '@lucide/svelte/icons/bell';
	import NotificationProvidersSettings from '$feature/settings/NotificationProvidersSettings.svelte';

	let localConfig: Config[] = $state([]);
	let processing = $state(false);
	let activeSection = $state('personalization');

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
		featureOverview: z.boolean().default(true),
		cronJobsEnabled: z.boolean().default(true),
		cronRemindersEnabled: z.boolean().default(true),
		cronRemindersSchedule: z.string().default('0 * * * *'),
		cronInsuranceEnabled: z.boolean().default(true),
		cronInsuranceSchedule: z.string().default('0 8 * * *'),
		cronPuccEnabled: z.boolean().default(true),
		cronPuccSchedule: z.string().default('30 8 * * *'),
		cronCleanupEnabled: z.boolean().default(true),
		cronCleanupSchedule: z.string().default('0 2 * * *'),
		cronEmailDigestEnabled: z.boolean().default(true),
		cronEmailDigestSchedule: z.string().default('0 9 * * *'),
		cronEmailDigestOnStartup: z.boolean().default(true),
		notificationEmail: z.string().email('Invalid email address').optional().or(z.literal(''))
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

				// If any cron settings changed, reload cron jobs
				const cronKeys = Object.keys(f.data).filter((key) => key.startsWith('cron'));
				if (cronKeys.length > 0) {
					try {
						const reloadResponse = await fetch('/api/cron/reload', { method: 'POST' });
						if (reloadResponse.ok) {
							console.log('Cron jobs reloaded successfully');
						}
					} catch (error) {
						console.error('Failed to reload cron jobs:', error);
					}
				}

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
				vehicleStore.refreshVehicles();
				processing = false;
			}
		}
	});
	const { form: formData, enhance, errors } = form;

	// Map fields to their respective sections
	const fieldToSection: Record<string, string> = {
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
		featureOverview: 'features',
		cronJobsEnabled: 'automatedJobs',
		cronRemindersEnabled: 'automatedJobs',
		cronRemindersSchedule: 'automatedJobs',
		cronInsuranceEnabled: 'automatedJobs',
		cronInsuranceSchedule: 'automatedJobs',
		cronPuccEnabled: 'automatedJobs',
		cronPuccSchedule: 'automatedJobs',
		cronCleanupEnabled: 'automatedJobs',
		cronCleanupSchedule: 'automatedJobs'
	};

	// Navigate to the first section with errors
	$effect(() => {
		const errorFields = Object.keys($errors);
		if (errorFields.length > 0) {
			const firstErrorField = errorFields[0];
			if (firstErrorField && fieldToSection[firstErrorField]) {
				activeSection = fieldToSection[firstErrorField];
			}
		}
	});

	// Sidebar navigation items
	const sidebarItems = [
		{
			id: 'personalization',
			label: m.settings_tab_personalization(),
			icon: Settings
		},
		{
			id: 'units',
			label: m.settings_tab_units(),
			icon: Gauge
		},
		{
			id: 'features',
			label: m.settings_tab_features(),
			icon: ToggleLeft
		},
		{
			id: 'automatedJobs',
			label: 'Automated Jobs',
			icon: Clock
		},
		{
			id: 'notifications',
			label: 'Notifications',
			icon: Bell
		}
	];

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
		hu: 'Magyar',
		fi: 'Suomi'
	};
	const localeOptions = locales.map((code) => ({
		value: code,
		label: localeLabels[code] || code.toUpperCase()
	}));

	$effect(() => {
		if (localConfig.length > 0) {
			const configData: any = {};
			localConfig.forEach((item) => {
				// Handle boolean values for feature toggles and cron settings
				if (
					item.key.startsWith('feature') ||
					(item.key.startsWith('cron') && item.key.includes('Enabled'))
				) {
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

<div id="settings-page" class="mx-auto flex h-full w-full max-w-7xl flex-col p-4 lg:p-6">
	<!-- Page Header -->
	<div class="mb-6 space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">{m.settings_title()}</h1>
	</div>

	<!-- Settings Layout with Sidebar -->
	<div class="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
		<!-- Sidebar Navigation -->
		<aside class="w-full lg:w-64 lg:shrink-0">
			<Card.Root class="border-border h-full">
				<Card.Content class="p-2">
					<nav class="space-y-1">
						{#each sidebarItems as item (item.id)}
							{@const Icon = item.icon}
							<button
								type="button"
								onclick={() => (activeSection = item.id)}
								class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors {activeSection ===
								item.id
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								<Icon class="h-5 w-5" />
								{item.label}
							</button>
						{/each}
					</nav>
				</Card.Content>
			</Card.Root>
		</aside>

		<!-- Main Content Area -->
		<div class="min-h-0 flex-1 overflow-hidden">
			<Card.Root class="border-border flex h-full flex-col">
				<Card.Content class="flex min-h-0 flex-1 flex-col overflow-y-auto">
					<form id="settings-form" use:enhance onsubmit={(e) => e.preventDefault()}>
						<!-- Personalization Section -->
						{#if activeSection === 'personalization'}
							<div class="space-y-6">
								<SettingsSectionHeader
									title={m.settings_tab_personalization()}
									description="Customize your experience with themes, languages, and formats."
								/>

								<fieldset class="space-y-6" disabled={processing}>
									<!-- Appearance Settings -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Appearance</h3>
										<p class="text-muted-foreground text-xs">
											Customize the look and feel of your application
										</p>
										<div class="grid gap-4 md:grid-cols-2">
											<!-- Theme -->
											<SettingsSelectField
												{form}
												name="theme"
												label={m.settings_label_theme()}
												description={m.settings_desc_theme()}
												icon={Palette}
												bind:value={$formData.theme}
												options={Object.values(themes).map((theme) => ({
													value: theme.name,
													label: theme.label,
													colorPreview: theme.colors?.primary || '#000'
												}))}
												placeholder={m.settings_select_theme()}
												disabled={processing}
											/>

											<!-- Custom CSS -->
											<Form.Field {form} name="customCss" class="w-full md:col-span-2">
												<Form.Control>
													{#snippet children({ props })}
														<FormLabel description={m.settings_desc_custom_css()}
															>{m.settings_label_custom_css()}</FormLabel
														>
														<Textarea
															{...props}
															placeholder="Add your custom CSS here..."
															class="mono h-36 resize-none"
															bind:value={$formData.customCss}
														/>
													{/snippet}
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</div>
									</div>

									<!-- Localization Settings -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Localization</h3>
										<p class="text-muted-foreground text-xs">
											Set your preferred language and timezone
										</p>
										<div class="grid gap-4 md:grid-cols-2">
											<!-- Locale -->
											<SettingsSelectField
												{form}
												name="locale"
												label={m.settings_label_locale()}
												description={m.settings_desc_locale()}
												icon={Languages}
												bind:value={$formData.locale}
												options={localeOptions}
												placeholder={m.settings_select_language()}
												disabled={processing}
											/>

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
										</div>
									</div>

									<!-- Format Settings -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Formats</h3>
										<p class="text-muted-foreground text-xs">
											Configure how currency and dates are displayed
										</p>
										<div class="grid gap-4 md:grid-cols-2">
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
										</div>
									</div>
								</fieldset>
							</div>
						{/if}

						<!-- Units Section -->
						{#if activeSection === 'units'}
							<div class="space-y-6">
								<SettingsSectionHeader
									title={m.settings_tab_units()}
									description="Configure measurement units for distance, volume, and fuel types."
								/>

								<fieldset class="space-y-6" disabled={processing}>
									<!-- Distance and Mileage Settings -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Distance & Mileage</h3>
										<p class="text-muted-foreground text-xs">
											Choose your preferred units for distance and mileage calculations
										</p>
										<div class="grid gap-4 md:grid-cols-2">
											<!-- Unit of Distance -->
											<SettingsSelectField
												{form}
												name="unitOfDistance"
												label={m.settings_label_unit_distance()}
												description={m.settings_desc_unit_distance()}
												icon={RulerDimensionLine}
												bind:value={$formData.unitOfDistance}
												options={uodOptions}
												placeholder={m.settings_select_unit_system()}
												disabled={processing}
											/>

											<!-- Mileage Unit Format -->
											<SettingsSelectField
												{form}
												name="mileageUnitFormat"
												label={m.settings_label_mileage_format()}
												description={m.settings_desc_mileage_format()}
												icon={Rabbit}
												bind:value={$formData.mileageUnitFormat}
												options={mileageUnitFormatOptions}
												placeholder={m.settings_select_unit_system()}
												disabled={processing}
											/>
										</div>
									</div>

									<!-- Fuel Volume Settings -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Fuel Volume Units</h3>
										<p class="text-muted-foreground text-xs">
											Select units for different fuel types (petrol, diesel, LPG, CNG)
										</p>
										<div class="grid gap-4 md:grid-cols-3">
											<!-- Petrol/Diesel -->
											<SettingsSelectField
												{form}
												name="unitOfVolume"
												label="Petrol/Diesel"
												description={m.settings_desc_unit_volume()}
												icon={Fuel}
												bind:value={$formData.unitOfVolume}
												options={uovOptions}
												placeholder={m.settings_select_unit_system()}
												disabled={processing}
											/>

											<!-- LPG -->
											<SettingsSelectField
												{form}
												name="unitOfLpg"
												label="LPG"
												description={m.settings_desc_unit_volume()}
												icon={Fuel}
												bind:value={$formData.unitOfLpg}
												options={gasUnitOptions}
												placeholder={m.settings_select_unit_system()}
												disabled={processing}
											/>

											<!-- CNG -->
											<SettingsSelectField
												{form}
												name="unitOfCng"
												label="CNG"
												description={m.settings_desc_unit_volume()}
												icon={Fuel}
												bind:value={$formData.unitOfCng}
												options={gasUnitOptions}
												placeholder={m.settings_select_unit_system()}
												disabled={processing}
											/>
										</div>
									</div>

									<!-- Info Box -->
									<div class="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/30">
										<p class="font-medium">About Units:</p>
										<p class="text-muted-foreground mt-1">
											These settings affect how measurements are displayed throughout the
											application. All calculations will be converted automatically based on your
											selected units.
										</p>
									</div>
								</fieldset>
							</div>
						{/if}

						<!-- Features Section -->
						{#if activeSection === 'features'}
							<div class="space-y-6">
								<SettingsSectionHeader
									title={m.settings_tab_features()}
									description={m.settings_features_intro()}
								/>

								<fieldset class="space-y-6" disabled={processing}>
									<!-- Data Tracking Features -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Data Tracking</h3>
										<p class="text-muted-foreground text-xs">
											Enable or disable fuel and maintenance tracking features
										</p>
										<div class="grid gap-4 md:grid-cols-2">
											<!-- Fuel Log Feature -->
											<SettingsFeatureToggle
												{form}
												name="featureFuelLog"
												label={m.feature_label_fuel()}
												description={m.feature_desc_fuel()}
												bind:checked={$formData.featureFuelLog}
												disabled={processing}
											/>

											<!-- Maintenance Feature -->
											<SettingsFeatureToggle
												{form}
												name="featureMaintenance"
												label={m.feature_label_maintenance()}
												description={m.feature_desc_maintenance()}
												bind:checked={$formData.featureMaintenance}
												disabled={processing}
											/>
										</div>
									</div>

									<!-- Document Management Features -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Document Management</h3>
										<p class="text-muted-foreground text-xs">
											Manage pollution certificates and insurance policies
										</p>
										<div class="grid gap-4 md:grid-cols-2">
											<!-- PUCC Feature -->
											<SettingsFeatureToggle
												{form}
												name="featurePucc"
												label={m.feature_label_pollution()}
												description={m.feature_desc_pollution()}
												bind:checked={$formData.featurePucc}
												disabled={processing}
											/>

											<!-- Insurance Feature -->
											<SettingsFeatureToggle
												{form}
												name="featureInsurance"
												label={m.feature_label_insurance()}
												description={m.feature_desc_insurance()}
												bind:checked={$formData.featureInsurance}
												disabled={processing}
											/>
										</div>
									</div>

									<!-- Additional Features -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<h3 class="text-sm font-semibold">Additional Features</h3>
										<p class="text-muted-foreground text-xs">
											Configure reminders and overview dashboard features
										</p>
										<div class="grid gap-4 md:grid-cols-2">
											<!-- Reminders Feature -->
											<SettingsFeatureToggle
												{form}
												name="featureReminders"
												label={m.feature_label_reminders()}
												description={m.feature_desc_reminders()}
												bind:checked={$formData.featureReminders}
												disabled={processing}
											/>

											<!-- Overview Feature -->
											<SettingsFeatureToggle
												{form}
												name="featureOverview"
												label={m.feature_label_overview()}
												description={m.feature_desc_overview()}
												bind:checked={$formData.featureOverview}
												disabled={processing}
											/>
										</div>
									</div>

									<!-- Info Box -->
									<div class="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/30">
										<p class="font-medium">About Feature Toggles:</p>
										<p class="text-muted-foreground mt-1">
											Disabling a feature will hide it from the navigation menu and prevent access
											to its pages. All existing data will be preserved and can be accessed again
											when the feature is re-enabled.
										</p>
									</div>
								</fieldset>
							</div>
						{/if}

						<!-- Automated Jobs Section -->
						{#if activeSection === 'automatedJobs'}
							<div class="space-y-6">
								<SettingsSectionHeader
									title="Automated Jobs"
									description="Configure scheduled jobs for automated notifications and maintenance tasks."
								/>

								<!-- Global Enable/Disable -->
								<fieldset class="space-y-6" disabled={processing}>
									<div class="border-border bg-muted/50 rounded-lg border p-4">
										<SettingsFeatureToggle
											{form}
											name="cronJobsEnabled"
											label="Enable Automated Jobs"
											description="Master switch to enable or disable all automated background jobs"
											bind:checked={$formData.cronJobsEnabled}
											disabled={processing}
										/>
									</div>

									<!-- Reminder Processing Job -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<div class="flex items-center justify-between">
											<div>
												<h3 class="text-sm font-semibold">Reminder Processing</h3>
												<p class="text-muted-foreground text-xs">
													Automatically generate notifications from active reminders
												</p>
											</div>
											<SettingsFeatureToggle
												{form}
												name="cronRemindersEnabled"
												label=""
												description=""
												bind:checked={$formData.cronRemindersEnabled}
												disabled={processing || !$formData.cronJobsEnabled}
											/>
										</div>
										<Form.Field {form} name="cronRemindersSchedule" class="w-full">
											<Form.Control>
												{#snippet children()}
													<FormLabel>Schedule</FormLabel>
													<CronInput
														bind:value={$formData.cronRemindersSchedule}
														disabled={processing || !$formData.cronRemindersEnabled}
														placeholder="0 * * * *"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>

									<!-- Insurance Expiry Job -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<div class="flex items-center justify-between">
											<div>
												<h3 class="text-sm font-semibold">Insurance Expiry Notifications</h3>
												<p class="text-muted-foreground text-xs">
													Generate notifications for insurance policies expiring within 30 days
												</p>
											</div>
											<SettingsFeatureToggle
												{form}
												name="cronInsuranceEnabled"
												label=""
												description=""
												bind:checked={$formData.cronInsuranceEnabled}
												disabled={processing || !$formData.cronJobsEnabled}
											/>
										</div>
										<Form.Field {form} name="cronInsuranceSchedule" class="w-full">
											<Form.Control>
												{#snippet children()}
													<FormLabel>Schedule</FormLabel>
													<CronInput
														bind:value={$formData.cronInsuranceSchedule}
														disabled={processing || !$formData.cronInsuranceEnabled}
														placeholder="0 8 * * *"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>

									<!-- PUCC Expiry Job -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<div class="flex items-center justify-between">
											<div>
												<h3 class="text-sm font-semibold">PUCC Expiry Notifications</h3>
												<p class="text-muted-foreground text-xs">
													Generate notifications for pollution certificates expiring within 30 days
												</p>
											</div>
											<SettingsFeatureToggle
												{form}
												name="cronPuccEnabled"
												label=""
												description=""
												bind:checked={$formData.cronPuccEnabled}
												disabled={processing || !$formData.cronJobsEnabled}
											/>
										</div>
										<Form.Field {form} name="cronPuccSchedule" class="w-full">
											<Form.Control>
												{#snippet children()}
													<FormLabel>Schedule</FormLabel>
													<CronInput
														bind:value={$formData.cronPuccSchedule}
														disabled={processing || !$formData.cronPuccEnabled}
														placeholder="30 8 * * *"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>

									<!-- Cleanup Job -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<div class="flex items-center justify-between">
											<div>
												<h3 class="text-sm font-semibold">Notification Cleanup</h3>
												<p class="text-muted-foreground text-xs">
													Automatically delete read notifications older than 30 days
												</p>
											</div>
											<SettingsFeatureToggle
												{form}
												name="cronCleanupEnabled"
												label=""
												description=""
												bind:checked={$formData.cronCleanupEnabled}
												disabled={processing || !$formData.cronJobsEnabled}
											/>
										</div>
										<Form.Field {form} name="cronCleanupSchedule" class="w-full">
											<Form.Control>
												{#snippet children()}
													<FormLabel>Schedule</FormLabel>
													<CronInput
														bind:value={$formData.cronCleanupSchedule}
														disabled={processing || !$formData.cronCleanupEnabled}
														placeholder="0 2 * * *"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>

									<!-- Email Digest Job -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<div class="flex items-center justify-between">
											<div>
												<h3 class="text-sm font-semibold">Email Notification Digest</h3>
												<p class="text-muted-foreground text-xs">
													Send a cumulated email digest of all pending notifications
												</p>
											</div>
											<SettingsFeatureToggle
												{form}
												name="cronEmailDigestEnabled"
												label=""
												description=""
												bind:checked={$formData.cronEmailDigestEnabled}
												disabled={processing || !$formData.cronJobsEnabled}
											/>
										</div>
										<Form.Field {form} name="cronEmailDigestSchedule" class="w-full">
											<Form.Control>
												{#snippet children()}
													<FormLabel>Schedule</FormLabel>
													<CronInput
														bind:value={$formData.cronEmailDigestSchedule}
														disabled={processing || !$formData.cronEmailDigestEnabled}
														placeholder="0 9 * * *"
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>

										<!-- Run on Startup Toggle -->
										<div class="border-border border-t pt-4">
											<SettingsFeatureToggle
												{form}
												name="cronEmailDigestOnStartup"
												label="Run on Server Startup"
												description="Execute email digest once when the server starts to send any pending notifications immediately"
												bind:checked={$formData.cronEmailDigestOnStartup}
												disabled={processing || !$formData.cronEmailDigestEnabled}
											/>
										</div>
									</div>

									<!-- Info Box -->
									<div class="rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-950/30">
										<p class="font-medium">Cron Expression Format:</p>
										<p class="text-muted-foreground mt-1">
											<code class="bg-muted rounded px-1 py-0.5">* * * * *</code>
											= minute (0-59) | hour (0-23) | day (1-31) | month (1-12) | weekday (0-6)
										</p>
										<p class="text-muted-foreground mt-2">
											Examples:
											<br />
											<code class="bg-muted rounded px-1 py-0.5">0 * * * *</code> - Every hour
											<br />
											<code class="bg-muted rounded px-1 py-0.5">0 8 * * *</code> - Daily at 8:00 AM
											<br />
											<code class="bg-muted rounded px-1 py-0.5">*/30 * * * *</code> - Every 30 minutes
										</p>
									</div>
								</fieldset>
							</div>
						{/if}

						<!-- Notifications Section -->
						{#if activeSection === 'notifications'}
							<div class="space-y-6">
								<SettingsSectionHeader
									title="Notifications"
									description="Configure notification providers and email preferences for alerts and reminders."
								/>

								<fieldset class="space-y-6" disabled={processing}>
									<!-- Notification Email Configuration -->
									<div class="border-border space-y-4 rounded-lg border p-4">
										<div>
											<h3 class="text-sm font-semibold">Email Address for Notifications</h3>
											<p class="text-muted-foreground text-xs">
												Enter your email address to receive notification digests
											</p>
										</div>
										<Form.Field {form} name="notificationEmail" class="w-full">
											<Form.Control>
												{#snippet children()}
													<FormLabel>Email Address</FormLabel>
													<Input
														bind:value={$formData.notificationEmail}
														disabled={processing}
														type="email"
														placeholder="your@email.com"
													/>
												{/snippet}
											</Form.Control>
											<Form.Description>
												This email will receive cumulated notification digests based on the schedule
												configured in Automated Jobs.
											</Form.Description>
											<Form.FieldErrors />
										</Form.Field>
									</div>

									<!-- Notification Providers -->
									<NotificationProvidersSettings />
								</fieldset>
							</div>
						{/if}

						<!-- Submit Button (always visible at bottom) -->
						<div class="mt-6 flex justify-end border-t pt-6">
							<SubmitButton {processing} class="w-full sm:w-auto">
								{m.settings_update_button()}
							</SubmitButton>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
