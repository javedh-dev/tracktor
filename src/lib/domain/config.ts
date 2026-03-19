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

export interface Configs {
  dateFormat: string;
  currency: string;
  unitOfDistance: string;
  unitOfVolume: string;
  unitOfLpg: string;
  unitOfCng: string;
  mileageUnitFormat: string;
  locale: string;
  timezone: string;
  customCss?: string;
  featureFuelLog?: boolean;
  featureMaintenance?: boolean;
  featurePucc?: boolean;
  featureReminders?: boolean;
  featureInsurance?: boolean;
  featureOverview?: boolean;
  notificationProcessingEnabled?: boolean;
  notificationProcessingSchedule?: string;
}
