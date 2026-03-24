<script lang="ts">
  import * as Dialog from '$ui/dialog/index.js';
  import { sheetStore } from '$stores/sheet.svelte';
  import XIcon from '@lucide/svelte/icons/x';
  import { Button, buttonVariants } from '$ui/button';
  import * as Tabs from '$ui/tabs';
  import { configStore } from '$stores/config.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { themes } from '$lib/config/themes';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import { toast } from 'svelte-sonner';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v4';
  import { data as currencies } from 'currency-codes';
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
  import { locales, getLocale, setLocale } from '$lib/paraglide/runtime.js';
  import Settings from '@lucide/svelte/icons/settings';
  import SettingsFeaturesTab from './SettingsFeaturesTab.svelte';
  import SettingsPersonalizationTab from './SettingsPersonalizationTab.svelte';
  import SettingsUnitsTab from './SettingsUnitsTab.svelte';

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
      .enum(['distance-per-fuel', 'fuel-per-distance', 'uk-mpg'])
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
    {
      value: 'distance-per-fuel',
      label: m.settings_mileage_format_distance_per_fuel()
    },
    {
      value: 'fuel-per-distance',
      label: m.settings_mileage_format_fuel_per_distance()
    },
    {
      value: 'uk-mpg',
      label: m.settings_mileage_format_uk_mpg()
    }
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

  const themeOptions = Object.values(themes).map((theme) => ({
    value: theme.name,
    label: theme.label,
    colorPreview: theme.colors?.primary || '#000'
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

<Dialog.Root onOpenChange={(state) => !state && sheetStore.closeSheet()}>
  <Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}
    ><Settings class="text-primary h-[1.2rem] w-[1.2rem]" /></Dialog.Trigger
  >
  <Dialog.Content showCloseButton={false} class="flex h-[70vh] w-full max-w-xl flex-col p-0">
    <!-- Modal Header -->
    <div class="flex shrink-0 items-center justify-between border-b px-6 pt-4 pb-2">
      <Dialog.Title class="text-primary text-xl">{m.settings_sheet_title()}</Dialog.Title>
      <Dialog.Close onclick={() => sheetStore.closeSheet()}>
        <Button variant="ghost" size="icon" class="h-6 w-6">
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </Dialog.Close>
    </div>

    <!-- Tabs on top, form below -->
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <Tabs.Root bind:value={activeTab} class="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
        <Tabs.List class="mx-4 grid w-auto grid-cols-3">
          <Tabs.Trigger value="personalization">{m.settings_tab_personalization()}</Tabs.Trigger>
          <Tabs.Trigger value="units">{m.settings_tab_units()}</Tabs.Trigger>
          <Tabs.Trigger value="features">{m.settings_tab_features()}</Tabs.Trigger>
        </Tabs.List>

        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <form
            id="settings-modal-form"
            use:enhance
            onsubmit={(e) => e.preventDefault()}
            class="flex flex-1 flex-col gap-6 p-6"
          >
            <div class="flex-1 space-y-4">
              <Tabs.Content value="personalization" class="space-y-6">
                <SettingsPersonalizationTab
                  {form}
                  {formData}
                  {processing}
                  {themeOptions}
                  {localeOptions}
                  {currencyOptions}
                  {getTimezoneOptions}
                  {isValidFormat}
                  messages={m}
                />
              </Tabs.Content>

              <Tabs.Content value="units" class="space-y-6">
                <SettingsUnitsTab
                  {form}
                  {formData}
                  {processing}
                  {uodOptions}
                  {uovOptions}
                  {gasUnitOptions}
                  {mileageUnitFormatOptions}
                  messages={m}
                />
              </Tabs.Content>

              <Tabs.Content value="features" class="space-y-6">
                <SettingsFeaturesTab {form} {formData} {processing} messages={m} />
              </Tabs.Content>
            </div>

            <!-- Submit Button -->
            <fieldset disabled={processing} class=" flex justify-center gap-2">
              <SubmitButton {processing} class="w-full">{m.settings_update_button()}</SubmitButton>
            </fieldset>
          </form>
        </div>
      </Tabs.Root>
    </div>
  </Dialog.Content>
</Dialog.Root>
