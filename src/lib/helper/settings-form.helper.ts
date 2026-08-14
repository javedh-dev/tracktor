/* eslint-disable no-redeclare */
import { themes } from '$lib/config/themes';
import { data as currencies } from 'currency-codes';
import { getCurrencySymbol } from '$lib/helper/format.helper';
import { z } from 'zod/v4';

const settingsConfigSchema = z.object({
  dateFormat: z.string(),
  locale: z.string().min(2),
  timezone: z.string().min(3),
  currency: z.string().min(1, 'Currency is required'),
  unitOfDistance: z.enum(['kilometer', 'mile']),
  unitOfVolume: z.enum(['liter', 'gallon']),
  unitOfLpg: z.enum(['liter', 'gallon', 'kilogram', 'pound']).default('liter'),
  unitOfCng: z.enum(['liter', 'gallon', 'kilogram', 'pound']).default('kilogram'),
  mileageUnitFormat: z
    .enum(['distance-per-fuel', 'fuel-per-distance', 'uk-mpg'])
    .default('distance-per-fuel'),
  theme: z.string().default('light'),
  darkVariant: z.string().default('default'),
  customCss: z.string().optional(),
  featureFuelLog: z.boolean().default(true),
  featureMaintenance: z.boolean().default(true),
  featureCompliance: z.boolean().default(true),
  featureReminders: z.boolean().default(true),
  featureOverview: z.boolean().default(true),
  notificationProcessingEnabled: z.boolean().default(true),
  notificationProcessingSchedule: z.string().default('0 9 * * *')
});

export type SettingsConfig = z.infer<typeof settingsConfigSchema>;

export function createSettingsConfigSchema(
  isValidFormat: (value: string) => { valid: boolean },
  isValidTimezone: (value: string) => boolean,
  options: { includeNotificationProcessingSchedule: true }
): ReturnType<ReturnType<typeof z.object>['extend']>;

export function createSettingsConfigSchema(
  isValidFormat: (value: string) => { valid: boolean },
  isValidTimezone: (value: string) => boolean,
  options?: { includeNotificationProcessingSchedule?: boolean }
): ReturnType<typeof z.object>;

export function createSettingsConfigSchema(
  isValidFormat: (value: string) => { valid: boolean },
  isValidTimezone: (value: string) => boolean,
  options: { includeNotificationProcessingSchedule?: boolean } = {}
) {
  const schema = settingsConfigSchema
    .extend({
      dateFormat: z.string().refine((fmt) => isValidFormat(fmt).valid, 'Format not valid'),
      timezone: z.string().min(3).refine(isValidTimezone, 'Invalid timzone value.')
    })
    .refine((obj) => {
      if (obj.mileageUnitFormat !== 'uk-mpg') return true;
      return obj.unitOfDistance === 'mile' && obj.unitOfVolume === 'liter';
    }, 'UK MPG calculation requires unit of distance to be miles and unit of volume to be litres.');

  if (options.includeNotificationProcessingSchedule) {
    return schema;
  }
  return schema.omit({ notificationProcessingSchedule: true });
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
    fi: 'Suomi',
    ro: 'Română',
    ru: 'Русский'
  };

  return {
    themeOptions: Object.values(themes).map((theme) => ({
      value: theme.name,
      label: theme.label,
      colorPreview: theme.colors?.primary || '#000'
    })),
    darkVariantOptions: [
      { value: 'default', label: m.dark_variant_default() },
      { value: 'dim', label: m.dark_variant_dim() },
      { value: 'oled', label: m.dark_variant_oled() }
    ],
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
      },
      {
        value: 'uk-mpg',
        label: m.settings_mileage_format_uk_mpg()
      }
    ],
    localeOptions: locales.map((code) => ({
      value: code,
      label: localeLabels[code] || code.toUpperCase()
    }))
  };
}
