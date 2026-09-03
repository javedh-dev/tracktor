import { describe, expect, it } from 'vitest';
import { resolveWeekStartsOn } from '$lib/helper/date.helper';
import { createSettingsConfigSchema } from '$lib/helper/settings-form.helper';

const settingsSchema = createSettingsConfigSchema(
  () => ({ valid: true }),
  () => true,
  {
    includeNotificationProcessingSchedule: true
  }
);

describe('calendar week start resolver', () => {
  it('uses explicit weekday overrides before locale defaults', () => {
    expect(resolveWeekStartsOn('0', 'cs')).toBe(0);
    expect(resolveWeekStartsOn('1', 'en')).toBe(1);
    expect(resolveWeekStartsOn('6', 'de')).toBe(6);
  });

  it('derives Monday-first calendars from supported European locales', () => {
    expect(resolveWeekStartsOn('locale', 'cs')).toBe(1);
    expect(resolveWeekStartsOn('locale', 'de')).toBe(1);
  });

  it('keeps English language default Sunday-first', () => {
    expect(resolveWeekStartsOn('locale', 'en')).toBe(0);
  });

  it('falls back to the locale default for invalid settings', () => {
    expect(resolveWeekStartsOn('invalid', 'cs')).toBe(1);
    expect(resolveWeekStartsOn(undefined, 'en')).toBe(0);
  });

  it('defaults settings to language-based week start', () => {
    const result = settingsSchema.safeParse({
      dateFormat: 'dd/MM/yyyy',
      locale: 'en',
      timezone: 'UTC',
      currency: 'USD',
      unitOfDistance: 'kilometer',
      unitOfVolume: 'liter',
      featureFuelLog: true,
      featureMaintenance: true,
      featureCompliance: true,
      featureReminders: true,
      featureOverview: true,
      notificationProcessingEnabled: true,
      notificationProcessingSchedule: '0 9 * * *'
    });

    expect(result.success).toBe(true);
    expect(result.data?.weekStartDay).toBe('locale');
  });

  it('accepts language default and explicit weekday settings', () => {
    for (const weekStartDay of ['locale', '0', '1', '2', '3', '4', '5', '6']) {
      expect(settingsSchema.shape.weekStartDay.safeParse(weekStartDay).success).toBe(true);
    }
  });

  it('rejects invalid week start settings', () => {
    expect(settingsSchema.shape.weekStartDay.safeParse('7').success).toBe(false);
    expect(settingsSchema.shape.weekStartDay.safeParse('monday').success).toBe(false);
  });
});
