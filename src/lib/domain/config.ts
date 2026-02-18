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
  'cronJobsEnabled',
  'cronRemindersEnabled',
  'cronInsuranceEnabled',
  'cronPuccEnabled',
  'cronCleanupEnabled',
  'cronEmailDigestEnabled',
  'cronEmailDigestOnStartup'
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
  cronJobsEnabled?: boolean;
  cronRemindersEnabled?: boolean;
  cronRemindersSchedule?: string;
  cronInsuranceEnabled?: boolean;
  cronInsuranceSchedule?: string;
  cronPuccEnabled?: boolean;
  cronPuccSchedule?: string;
  cronCleanupEnabled?: boolean;
  cronCleanupSchedule?: string;
  cronEmailDigestEnabled?: boolean;
  cronEmailDigestSchedule?: string;
  cronEmailDigestOnStartup?: boolean;
}
