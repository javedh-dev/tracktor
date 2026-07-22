import type { SettingsConfig } from '$lib/helper/settings-form.helper';

export interface Config {
  key: string;
  value?: string;
  description?: string;
}

/** Keys stored as boolean ('true'/'false' strings in DB). */
export const BOOLEAN_CONFIG_KEYS = new Set([
  'featureFuelLog',
  'featureMaintenance',
  'featurePucc',
  'featureReminders',
  'featureInsurance',
  'featureOverview',
  'notificationProcessingEnabled'
]);

export type Configs = SettingsConfig;
