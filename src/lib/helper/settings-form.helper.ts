import { themes } from '$lib/config/themes';
import { data as currencies } from 'currency-codes';
import { getCurrencySymbol } from '$lib/helper/format.helper';
import { z } from 'zod/v4';

interface SettingsSchemaOptions {
  includeNotificationProcessingSchedule?: boolean;
}

export function createSettingsConfigSchema(
  isValidFormat: (value: string) => { valid: boolean },
  isValidTimezone: (value: string) => boolean,
  options: { includeNotificationProcessingSchedule: true }
): ReturnType<ReturnType<typeof z.object>['extend']>;

export function createSettingsConfigSchema(
  isValidFormat: (value: string) => { valid: boolean },
  isValidTimezone: (value: string) => boolean,
  options?: SettingsSchemaOptions
): ReturnType<typeof z.object>;

export function createSettingsConfigSchema(
  isValidFormat: (value: string) => { valid: boolean },
  isValidTimezone: (value: string) => boolean,
  options: SettingsSchemaOptions = {}
) {
  const baseSchema = z.object({
    dateFormat: z.string().refine((fmt) => isValidFormat(fmt).valid, 'Format not valid'),
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

  if (!options.includeNotificationProcessingSchedule) {
    return baseSchema;
  }

  return baseSchema.extend({
    notificationProcessingSchedule: z
      .string()
      .refine((expr) => expr.trim().split(/\s+/).length === 5, 'Invalid cron expression')
      .default('0 9 * * *')
  });
}

export function createSettingsOptions(
  m: typeof import('$lib/paraglide/messages'),
  locales: readonly string[]
) {
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

  return {
    themeOptions: Object.values(themes).map((theme) => ({
      value: theme.name,
      label: theme.label,
      colorPreview: theme.colors?.primary || '#000'
    })),
    currencyOptions: currencies.map((currency) => ({
      value: currency.code,
      label: `${getCurrencySymbol(currency.code)} - ${currency.currency} `
    })),
    uodOptions: [
      { value: 'kilometer', label: m.common_kilometer() },
      { value: 'mile', label: m.common_mile() }
    ],
    uovOptions: [
      { value: 'liter', label: m.common_litre() },
      { value: 'gallon', label: m.common_gallon() }
    ],
    gasUnitOptions: [
      { value: 'liter', label: m.common_litre() },
      { value: 'gallon', label: m.common_gallon() },
      { value: 'kilogram', label: 'Kilogram (kg)' },
      { value: 'pound', label: 'Pound (lb)' }
    ],
    mileageUnitFormatOptions: [
      {
        value: 'distance-per-fuel',
        label: m.settings_mileage_format_distance_per_fuel()
      },
      {
        value: 'fuel-per-distance',
        label: m.settings_mileage_format_fuel_per_distance()
      }
    ],
    localeOptions: locales.map((code) => ({
      value: code,
      label: localeLabels[code] || code.toUpperCase()
    }))
  };
}

export function createSettingsFieldSectionMap(
  includeNotifications = false
): Record<string, string> {
  const fieldMap: Record<string, string> = {
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

  if (includeNotifications) {
    fieldMap.notificationProcessingSchedule = 'notifications';
  }

  return fieldMap;
}
