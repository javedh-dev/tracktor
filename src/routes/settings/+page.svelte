<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import SettingsSelectField from '$feature/settings/SettingsSelectField.svelte';
  import SettingsFeatureToggle from '$feature/settings/SettingsFeatureToggle.svelte';
  import SettingsSection from '$lib/components/feature/settings/SettingsSection.svelte';
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
  import LeftArrow from '@lucide/svelte/icons/move-left';
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
  import Button from '$lib/components/ui/button/button.svelte';
  import { goto } from '$app/navigation';
  import SettingFormSection from '$lib/components/feature/settings/SettingFormSection.svelte';

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

<div id="settings-page" class="mx-auto flex h-full w-full flex-col">
  <div id="dashboard-header" class="mb-2 flex items-center justify-start gap-2">
    <Button
      variant="outline"
      size="icon"
      onclick={() => {
        goto('/dashboard');
      }}
      class="cursor-pointer"
    >
      <LeftArrow />
    </Button>
    <h1 id="dashboard-title" class="text-primary text-2xl font-semibold lg:text-3xl">
      {m.settings_title()}
    </h1>
  </div>

  <!-- Settings Layout with Sidebar -->
  <div class="bg-card my-4 flex min-h-0 flex-1 flex-col gap-6 rounded-lg border p-6 lg:flex-row">
    <!-- Sidebar Navigation -->
    <aside class="border-accent w-full border-r-2 py-4 pe-2 lg:w-64 lg:shrink-0">
      <!-- <Card.Root class="h-auto">
        <Card.Content class="p-2"> -->
      <nav class="space-y-1">
        {#each sidebarItems as item (item.id)}
          {@const Icon = item.icon}
          <button
            type="button"
            onclick={() => (activeSection = item.id)}
            class="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors lg:h-12 {activeSection ===
            item.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
          >
            <Icon class="h-5 w-5" />
            {item.label}
          </button>
        {/each}
      </nav>
      <!-- </Card.Content>
      </Card.Root> -->
    </aside>

    <!-- Main Content Area -->
    <div id="settings-content" class="flex-1">
      <!-- <Card.Root class="flex h-auto flex-col">
        <Card.Content class="flex min-h-0 flex-1 flex-col overflow-y-auto"> -->
      <form id="settings-form" use:enhance onsubmit={(e) => e.preventDefault()}>
        <!-- Personalization Section -->
        {#if activeSection === 'personalization'}
          <SettingsSection
            title={m.settings_tab_personalization()}
            description="Customize your experience with themes, languages, and formats."
          >
            <fieldset class="space-y-6" disabled={processing}>
              <!-- Appearance Settings -->
              <SettingFormSection
                title="Appearance"
                subtitle="Customize the look and feel of your application"
              >
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
              </SettingFormSection>

              <!-- Localization Settings -->
              <SettingFormSection
                title="Localization"
                subtitle="Set your preferred language and timezone"
              >
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
              </SettingFormSection>

              <!-- Format Settings -->
              <SettingFormSection
                title="Formats"
                subtitle="Set your preferred currency and date format"
              >
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
              </SettingFormSection>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Units Section -->
        {#if activeSection === 'units'}
          <SettingsSection
            title={m.settings_tab_units()}
            description="Configure measurement units for distance, volume, and fuel types."
          >
            <fieldset class="space-y-6" disabled={processing}>
              <!-- Distance and Mileage Settings -->
              <SettingFormSection
                title="Distance & Mileage"
                subtitle="Choose your preferred units for distance and mileage calculations"
              >
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
              </SettingFormSection>

              <!-- Fuel Volume Settings -->
              <SettingFormSection
                title="Fuel Units"
                subtitle="SSelect units for different fuel types (petrol, diesel, LPG, CNG)"
              >
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
              </SettingFormSection>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Features Section -->
        {#if activeSection === 'features'}
          <SettingsSection
            title={m.settings_tab_features()}
            description={m.settings_features_intro()}
          >
            <fieldset class="space-y-6" disabled={processing}>
              <!-- Data Tracking Features -->
              <SettingFormSection
                title="Data Tracking"
                subtitle="Enable or disable fuel and maintenance tracking features"
              >
                <div class="grid gap-4 md:grid-cols-2">
                  <!-- Fuel Log Feature -->
                  <SettingsFeatureToggle
                    {form}
                    name="featureFuelLog"
                    label={m.feature_label_fuel()}
                    description={m.feature_desc_fuel()}
                    checked={$formData.featureFuelLog ?? true}
                    disabled={processing}
                  />

                  <!-- Maintenance Feature -->
                  <SettingsFeatureToggle
                    {form}
                    name="featureMaintenance"
                    label={m.feature_label_maintenance()}
                    description={m.feature_desc_maintenance()}
                    checked={$formData.featureMaintenance ?? true}
                    disabled={processing}
                  />
                </div>
              </SettingFormSection>

              <!-- Document Management Features -->
              <SettingFormSection
                title="Document Management"
                subtitle="Manage pollution certificates and insurance policies"
              >
                <div class="grid gap-4 md:grid-cols-2">
                  <!-- PUCC Feature -->
                  <SettingsFeatureToggle
                    {form}
                    name="featurePucc"
                    label={m.feature_label_pollution()}
                    description={m.feature_desc_pollution()}
                    checked={$formData.featurePucc ?? true}
                    disabled={processing}
                  />

                  <!-- Insurance Feature -->
                  <SettingsFeatureToggle
                    {form}
                    name="featureInsurance"
                    label={m.feature_label_insurance()}
                    description={m.feature_desc_insurance()}
                    checked={$formData.featureInsurance ?? true}
                    disabled={processing}
                  />
                </div>
              </SettingFormSection>

              <!-- Additional Features -->
              <SettingFormSection
                title="Additional Features"
                subtitle="Configure reminders and overview dashboard features"
              >
                <div class="grid gap-4 md:grid-cols-2">
                  <!-- Reminders Feature -->
                  <SettingsFeatureToggle
                    {form}
                    name="featureReminders"
                    label={m.feature_label_reminders()}
                    description={m.feature_desc_reminders()}
                    checked={$formData.featureReminders ?? true}
                    disabled={processing}
                  />

                  <!-- Overview Feature -->
                  <SettingsFeatureToggle
                    {form}
                    name="featureOverview"
                    label={m.feature_label_overview()}
                    description={m.feature_desc_overview()}
                    checked={$formData.featureOverview ?? true}
                    disabled={processing}
                  />
                </div>
              </SettingFormSection>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Automated Jobs Section -->
        {#if activeSection === 'automatedJobs'}
          <SettingsSection
            title="Automated Jobs"
            description="Configure scheduled jobs for automated notifications and maintenance tasks."
          >
            <!-- Global Enable/Disable -->
            <fieldset class="space-y-6" disabled={processing}>
              <!-- <SettingFormSection> -->
              <SettingsFeatureToggle
                {form}
                name="cronJobsEnabled"
                label="Enable Automated Jobs"
                description="Master switch to enable or disable all automated background jobs"
                checked={$formData.cronJobsEnabled ?? true}
                disabled={processing}
              />
              <!-- </SettingFormSection> -->

              <!-- Reminder Processing Job -->
              <SettingFormSection
                title="Reminder Processing"
                subtitle="Automatically generate notifications from active reminders"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm font-medium">Enable Reminder Processing</span>
                  </div>
                  <SettingsFeatureToggle
                    {form}
                    name="cronRemindersEnabled"
                    label=""
                    description=""
                    checked={$formData.cronRemindersEnabled ?? true}
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
              </SettingFormSection>

              <!-- Insurance Expiry Job -->
              <SettingFormSection
                title="Insurance Expiry Notifications"
                subtitle="Generate notifications for insurance policies expiring within 30 days"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm font-medium">Enable Insurance Notifications</span>
                  </div>
                  <SettingsFeatureToggle
                    {form}
                    name="cronInsuranceEnabled"
                    label=""
                    description=""
                    checked={$formData.cronInsuranceEnabled ?? true}
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
              </SettingFormSection>

              <!-- PUCC Expiry Job -->
              <SettingFormSection
                title="PUCC Expiry Notifications"
                subtitle="Generate notifications for pollution certificates expiring within 30 days"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm font-medium">Enable PUCC Notifications</span>
                  </div>
                  <SettingsFeatureToggle
                    {form}
                    name="cronPuccEnabled"
                    label=""
                    description=""
                    checked={$formData.cronPuccEnabled ?? true}
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
              </SettingFormSection>

              <!-- Cleanup Job -->
              <SettingFormSection
                title="Notification Cleanup"
                subtitle="Automatically delete read notifications older than 30 days"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm font-medium">Enable Cleanup</span>
                  </div>
                  <SettingsFeatureToggle
                    {form}
                    name="cronCleanupEnabled"
                    label=""
                    description=""
                    checked={$formData.cronCleanupEnabled ?? true}
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
              </SettingFormSection>

              <!-- Email Digest Job -->
              <SettingFormSection
                title="Email Notification Digest"
                subtitle="Send a cumulated email digest of all pending notifications"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm font-medium">Enable Email Digest</span>
                  </div>
                  <SettingsFeatureToggle
                    {form}
                    name="cronEmailDigestEnabled"
                    label=""
                    description=""
                    checked={$formData.cronEmailDigestEnabled ?? true}
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
                <div class="pt-2">
                  <SettingsFeatureToggle
                    {form}
                    name="cronEmailDigestOnStartup"
                    label="Run on Server Startup"
                    description="Execute email digest once when the server starts to send any pending notifications immediately"
                    checked={$formData.cronEmailDigestOnStartup ?? true}
                    disabled={processing || !$formData.cronEmailDigestEnabled}
                  />
                </div>
              </SettingFormSection>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Notifications Section -->
        {#if activeSection === 'notifications'}
          <SettingsSection
            title="Notifications"
            description="Configure notification providers and email preferences for alerts and reminders."
          >
            <fieldset class="space-y-6" disabled={processing}>
              <!-- Notification Providers -->
              <!-- <SettingFormSection
                title="Notification Providers"
                subtitle="Configure external notification services for alerts and reminders"
              > -->
              <NotificationProvidersSettings />
              <!-- </SettingFormSection> -->
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Submit Button (always visible at bottom) -->
        <div class="mt-6 flex justify-end pt-6">
          <SubmitButton {processing} class="w-full sm:w-auto">
            {m.settings_update_button()}
          </SubmitButton>
        </div>
      </form>
      <!-- </Card.Content>
      </Card.Root> -->
    </div>
  </div>
</div>
