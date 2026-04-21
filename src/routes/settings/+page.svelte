<script lang="ts">
  import SettingsSection from '$lib/components/feature/settings/SettingsSection.svelte';
  import { configStore } from '$stores/config.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import LeftArrow from '@lucide/svelte/icons/move-left';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import { toast } from 'svelte-sonner';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { getTimezoneOptions, isValidFormat, isValidTimezone } from '$lib/helper/format.helper';
  import * as m from '$lib/paraglide/messages';
  import { saveConfig } from '$lib/services/config.service';
  import { rawConfigToFormData, formDataToConfigs } from '$helper/config.helper';
  import { createSettingsConfigSchema, createSettingsOptions } from '$helper/settings-form.helper';
  import type { SettingsFormShape } from '$lib/types/settings';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { locales, getLocale, setLocale } from '$lib/paraglide/runtime.js';
  import Settings from '@lucide/svelte/icons/settings';
  import Gauge from '@lucide/svelte/icons/gauge';
  import ToggleLeft from '@lucide/svelte/icons/toggle-left';
  import Bell from '@lucide/svelte/icons/bell';
  import NotificationProvidersSettings from '$feature/settings/NotificationProvidersSettings.svelte';
  import SettingsFeaturesTab from '$feature/settings/SettingsFeaturesTab.svelte';
  import SettingsPersonalizationTab from '$feature/settings/SettingsPersonalizationTab.svelte';
  import SettingsUnitsTab from '$feature/settings/SettingsUnitsTab.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { goto } from '$app/navigation';
  import SettingFormSection from '$lib/components/feature/settings/SettingFormSection.svelte';

  let processing = $state(false);
  let activeSection = $state('personalization');
  let notificationProcessingEnabled = $state(true);

  const configSchema = createSettingsConfigSchema(isValidFormat, isValidTimezone, {
    includeNotificationProcessingSchedule: true
  });

  const form = superForm(defaults(zod4(configSchema)), {
    validators: zod4(configSchema),
    SPA: true,
    resetForm: false,
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        // Handle theme change
        if (f.data.theme) {
          themeStore.setTheme(f.data.theme as any);
        }

        const updatedConfig = formDataToConfigs(f.data as SettingsFormShape, configStore.rawConfig);

        // Persist configuration before applying a locale change
        await saveConfig(updatedConfig);

        try {
          await fetch('/api/cron/reload', { method: 'POST' });
        } catch {
          /* noop */
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
      }
    }
  });
  const { form: formData, enhance, errors } = form;

  const notificationProcessingSchedule = $derived.by(() => {
    const value = ($formData as Record<string, unknown>).notificationProcessingSchedule;
    return typeof value === 'string' ? value : '0 9 * * *';
  });

  const updateNotificationProcessingSchedule = (value: string) => {
    formData.update(
      (current) =>
        ({
          ...current,
          notificationProcessingSchedule: value
        }) as SettingsFormShape
    );
  };

  const hasErrors = $derived.by(() =>
    Object.values($errors).some((errorArray) => Array.isArray(errorArray) && errorArray.length > 0)
  );

  const errorEntries = $derived.by(() =>
    Object.entries($errors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0
    )
  );

  const {
    themeOptions,
    currencyOptions,
    uodOptions,
    uovOptions,
    gasUnitOptions,
    mileageUnitFormatOptions,
    localeOptions
  } = createSettingsOptions(m, locales);

  const sidebarItems = $derived([
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
      id: 'notifications',
      label: m.settings_tab_notifications(),
      icon: Bell
    }
  ]);

  // Load configs on mount
  $effect(() => {
    configStore.refreshConfigs();
  });

  // Populate form when configs are loaded
  $effect(() => {
    if (configStore.rawConfig.length > 0) {
      const configData = rawConfigToFormData(
        configStore.rawConfig,
        configStore.configs
      ) as SettingsFormShape;
      // Add current theme to form data (theme is client-side only)
      configData.theme = themeStore.theme;
      notificationProcessingEnabled = configData.notificationProcessingEnabled !== false;
      formData.set(configData);
    }
  });

  $effect(() => {
    formData.update((current) => {
      if (current.notificationProcessingEnabled === notificationProcessingEnabled) {
        return current;
      }

      return {
        ...current,
        notificationProcessingEnabled
      };
    });
  });
</script>

<div id="settings-page" class="flex h-full w-full flex-col">
  <div id="dashboard-header" class="mb-2 flex w-full items-center justify-start gap-2">
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
  <div
    class="bg-card my-4 flex min-h-0 flex-1 flex-col gap-6 rounded-lg px-6 py-2 sm:flex-row sm:border sm:py-6"
  >
    <!-- Sidebar Navigation -->
    <aside
      class="border-accent w-full border-b-2 py-2 pe-2 sm:w-48 sm:border-r-2 sm:border-b-0 md:w-56 lg:shrink-0"
    >
      <!-- <Card.Root class="h-auto">
        <Card.Content class="p-2"> -->
      <nav class="flex flex-row gap-4 space-y-1 sm:flex-col sm:gap-0">
        {#each sidebarItems as item (item.id)}
          {@const Icon = item.icon}
          <button
            type="button"
            onclick={() => (activeSection = item.id)}
            class="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors sm:w-full sm:p-4 lg:h-12 {activeSection ===
            item.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
          >
            <Icon class="h-5 w-5" />
            <span class="hidden sm:block">{item.label}</span>
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
            description={m.settings_personalization_desc()}
          >
            <fieldset class="space-y-6" disabled={processing}>
              <SettingFormSection
                title={m.settings_section_general()}
                subtitle={m.settings_section_general_desc()}
              >
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
              </SettingFormSection>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Units Section -->
        {#if activeSection === 'units'}
          <SettingsSection title={m.settings_tab_units()} description={m.settings_units_desc()}>
            <fieldset class="space-y-6" disabled={processing}>
              <SettingFormSection
                title={m.settings_section_units()}
                subtitle={m.settings_section_units_desc()}
              >
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
              <SettingFormSection
                title={m.settings_section_feature_flags()}
                subtitle={m.settings_section_feature_flags_desc()}
              >
                <SettingsFeaturesTab {form} {formData} {processing} messages={m} />
              </SettingFormSection>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Notifications Section -->
        {#if activeSection === 'notifications'}
          <SettingsSection
            title={m.settings_tab_notifications()}
            description={m.settings_notifications_desc()}
          >
            <fieldset class="space-y-6" disabled={processing}>
              <NotificationProvidersSettings
                bind:notificationProcessingEnabled
                processingSchedule={notificationProcessingSchedule}
                onProcessingScheduleChange={updateNotificationProcessingSchedule}
                disabled={processing}
              />

              <div class="flex justify-end">
                <SubmitButton {processing} class="w-full sm:w-auto">
                  {m.settings_update_button()}
                </SubmitButton>
              </div>
            </fieldset>
          </SettingsSection>
        {/if}

        <!-- Submit Button (always visible at bottom) -->
        <div class="mt-6 flex flex-col gap-4 pt-6">
          <!-- Error Summary -->
          {#if hasErrors}
            <div class="bg-destructive/10 border-destructive/50 rounded-lg border p-4">
              <h3 class="text-destructive mb-2 text-sm font-semibold">
                {m.settings_error_fix_errors()}
              </h3>
              <ul class="text-destructive list-inside list-disc space-y-1 text-sm">
                {#each errorEntries as [field, errorArray]}
                  <li>
                    <span class="font-medium capitalize"
                      >{field.replace(/([A-Z])/g, ' $1').trim()}:</span
                    >
                    {errorArray.join(', ')}
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if activeSection !== 'notifications'}
            <div class="flex justify-end">
              <SubmitButton {processing} class="w-full sm:w-auto">
                {m.settings_update_button()}
              </SubmitButton>
            </div>
          {/if}
        </div>
      </form>
      <!-- </Card.Content>
      </Card.Root> -->
    </div>
  </div>
</div>
