<script lang="ts">
  import SettingsSection from '$feature/settings/SettingsSection.svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import { configStore } from '$stores/config.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import { toast } from 'svelte-sonner';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { getTimezoneOptions, isValidFormat, isValidTimezone } from '$lib/helper/format.helper';
  import * as m from '$lib/paraglide/messages';
  import { saveConfig } from '$lib/services/config.service';
  import { rawConfigToFormData, formDataToConfigs } from '$helper/config.helper';
  import {
    createSettingsConfigSchema,
    createSettingsOptions,
    type SettingsConfig
  } from '$helper/settings-form.helper';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { locales, getLocale, setLocale } from '$lib/paraglide/runtime.js';
  import Palette from '@lucide/svelte/icons/palette';
  import Earth from '@lucide/svelte/icons/earth';
  import Code from '@lucide/svelte/icons/code';
  import Gauge from '@lucide/svelte/icons/gauge';
  import ToggleLeft from '@lucide/svelte/icons/toggle-left';
  import Bell from '@lucide/svelte/icons/bell';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Lock from '@lucide/svelte/icons/lock';
  import { ACCENT } from '$helper/accent-color.helper';
  import NotificationProvidersSettings from '$feature/settings/NotificationProvidersSettings.svelte';
  import SettingsFeaturesTab from '$feature/settings/SettingsFeaturesTab.svelte';
  import SettingsAppearanceFields from '$feature/settings/SettingsAppearanceFields.svelte';
  import SettingsLocalizationFields from '$feature/settings/SettingsLocalizationFields.svelte';
  import SettingsAdvancedFields from '$feature/settings/SettingsAdvancedFields.svelte';
  import SettingsUnitsTab from '$feature/settings/SettingsUnitsTab.svelte';

  let processing = $state(false);
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
        if (f.data.darkVariant) {
          themeStore.setDarkVariant(f.data.darkVariant as any);
        }

        const updatedConfig = formDataToConfigs(f.data as SettingsConfig, configStore.rawConfig);

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
        }) as SettingsConfig
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
    darkVariantOptions,
    currencyOptions,
    uodOptions,
    uovOptions,
    gasUnitOptions,
    mileageUnitFormatOptions,
    weekStartDayOptions,
    localeOptions
  } = createSettingsOptions(m, locales);

  const sidebarItems = $derived([
    {
      id: 'personalization',
      label: m.settings_tab_personalization(),
      description: m.settings_nav_desc_personalization(),
      icon: Palette,
      iconClass: ACCENT.plum.chip
    },
    {
      id: 'localization',
      label: m.settings_tab_localization(),
      description: m.settings_nav_desc_localization(),
      icon: Earth,
      iconClass: ACCENT.denim.chip
    },
    {
      id: 'advanced',
      label: m.settings_tab_advanced(),
      description: m.settings_nav_desc_advanced(),
      icon: Code,
      iconClass: ACCENT.fog.chip
    },
    {
      id: 'notifications',
      label: m.settings_tab_notifications(),
      description: m.settings_nav_desc_notifications(),
      icon: Bell,
      iconClass: ACCENT.ochre.chip
    },
    {
      id: 'units',
      label: m.settings_tab_units(),
      description: m.settings_nav_desc_units(),
      icon: Gauge,
      iconClass: ACCENT.moss.chip
    },
    {
      id: 'features',
      label: m.settings_tab_features(),
      description: m.settings_nav_desc_features(),
      icon: ToggleLeft,
      iconClass: ACCENT.teal.chip
    }
  ]);

  let activeSection = $state('personalization');
  let contentEl: HTMLElement | undefined = $state();

  // ponytail: "topmost visible section" heuristic via IntersectionObserver band near the
  // sticky topbar; good enough for a handful of sections, revisit if content height varies wildly.
  $effect(() => {
    if (!contentEl) return;
    const sections = Array.from(contentEl.querySelectorAll<HTMLElement>('[data-settings-section]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          activeSection = visible[0].target.getAttribute('data-settings-section') ?? activeSection;
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  });

  const scrollToSection = (id: string) => {
    activeSection = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applyLoadedConfig = () => {
    if (configStore.rawConfig.length === 0) return;
    const configData = rawConfigToFormData(
      configStore.rawConfig,
      configStore.configs
    ) as SettingsConfig;
    // Add current theme to form data (theme is client-side only)
    configData.theme = themeStore.theme;
    configData.darkVariant = themeStore.darkVariant;
    notificationProcessingEnabled = configData.notificationProcessingEnabled !== false;
    formData.set(configData);
  };

  const resetToDefaults = () => {
    const defaultData = defaults(zod4(configSchema)).data as SettingsConfig;
    notificationProcessingEnabled = defaultData.notificationProcessingEnabled !== false;
    formData.set(defaultData);
  };

  // Load configs on mount
  $effect(() => {
    configStore.refreshConfigs();
  });

  // Populate form when configs are loaded
  $effect(() => {
    if (configStore.rawConfig.length > 0) {
      applyLoadedConfig();
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

<div id="settings-page" class="space-y-6">
  <PageHeader title={m.settings_title()} description={m.settings_page_description()} />

  <!-- Settings Layout with Sidebar -->
  <div class="flex flex-col gap-6 sm:flex-row">
    <!-- Sidebar Navigation -->
    <aside class="w-full shrink-0 sm:w-64">
      <nav
        class="bg-card sticky top-20 flex flex-row gap-2 overflow-x-auto rounded-xl border p-2 sm:top-6 sm:flex-col sm:gap-1 sm:overflow-visible"
      >
        {#each sidebarItems as item (item.id)}
          {@const Icon = item.icon}
          <button
            type="button"
            onclick={() => scrollToSection(item.id)}
            class="flex shrink-0 items-center gap-3 rounded-lg p-2.5 text-left transition-colors {activeSection ===
            item.id
              ? 'bg-muted ring-border ring-1'
              : 'hover:bg-muted/60'}"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg {item.iconClass}"
            >
              <Icon class="size-4" />
            </span>
            <span class="hidden min-w-0 flex-col sm:flex">
              <span class="truncate text-sm font-medium">{item.label}</span>
              <span class="text-muted-foreground truncate text-xs">{item.description}</span>
            </span>
          </button>
        {/each}
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div id="settings-content" class="min-w-0 flex-1">
      <form id="settings-form" use:enhance onsubmit={(e) => e.preventDefault()}>
        <div bind:this={contentEl} class="space-y-6">
          <SettingsSection
            id="personalization"
            icon={Palette}
            iconClass={ACCENT.plum.chip}
            title={m.settings_tab_personalization()}
            description={m.settings_personalization_desc()}
          >
            <SettingsAppearanceFields
              {form}
              {formData}
              {processing}
              {themeOptions}
              {darkVariantOptions}
              messages={m}
            />
          </SettingsSection>

          <SettingsSection
            id="localization"
            icon={Earth}
            iconClass={ACCENT.denim.chip}
            title={m.settings_tab_localization()}
            description={m.settings_localization_desc()}
          >
            <SettingsLocalizationFields
              {form}
              {formData}
              {processing}
              {localeOptions}
              {currencyOptions}
              {weekStartDayOptions}
              {getTimezoneOptions}
              {isValidFormat}
              messages={m}
            />
          </SettingsSection>

          <SettingsSection
            id="advanced"
            icon={Code}
            iconClass={ACCENT.fog.chip}
            title={m.settings_tab_advanced()}
            description={m.settings_advanced_desc()}
          >
            <SettingsAdvancedFields {form} {formData} {processing} messages={m} />
          </SettingsSection>

          <SettingsSection
            id="notifications"
            icon={Bell}
            iconClass={ACCENT.ochre.chip}
            title={m.settings_tab_notifications()}
            description={m.settings_notifications_desc()}
          >
            <NotificationProvidersSettings
              bind:notificationProcessingEnabled
              processingSchedule={notificationProcessingSchedule}
              onProcessingScheduleChange={updateNotificationProcessingSchedule}
              disabled={processing}
            />
          </SettingsSection>

          <SettingsSection
            id="units"
            icon={Gauge}
            iconClass={ACCENT.moss.chip}
            title={m.settings_tab_units()}
            description={m.settings_units_desc()}
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
          </SettingsSection>

          <SettingsSection
            id="features"
            icon={ToggleLeft}
            iconClass={ACCENT.teal.chip}
            title={m.settings_tab_features()}
            description={m.settings_features_intro()}
          >
            <SettingsFeaturesTab {form} {formData} {processing} messages={m} />
          </SettingsSection>

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
        </div>

        <!-- Sticky Save Bar -->
        <div class="bg-card sticky bottom-0 z-10 mt-6 rounded-xl border p-4 shadow-lg">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onclick={resetToDefaults}
              disabled={processing}
              class="justify-start"
            >
              <LabelWithIcon icon={RotateCcw} label={m.settings_reset_defaults()} />
            </Button>
            <div class="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onclick={applyLoadedConfig}
                disabled={processing}
                class="flex-1 sm:flex-none"
              >
                {m.settings_cancel_button()}
              </Button>
              <SubmitButton {processing} class="flex-1 sm:flex-none">
                {m.settings_update_button()}
              </SubmitButton>
            </div>
          </div>
          <p class="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
            <Lock class="size-3" />
            {m.settings_secure_note()}
          </p>
        </div>
      </form>
    </div>
  </div>
</div>
