export interface SettingsFormShape extends Record<string, unknown> {
  dateFormat: string;
  locale: string;
  timezone: string;
  currency: string;
  unitOfDistance: 'kilometer' | 'mile';
  unitOfVolume: 'liter' | 'gallon';
  unitOfLpg: 'liter' | 'gallon' | 'kilogram' | 'pound';
  unitOfCng: 'liter' | 'gallon' | 'kilogram' | 'pound';
  mileageUnitFormat: 'distance-per-fuel' | 'fuel-per-distance';
  theme: string;
  customCss?: string;
  featureFuelLog: boolean;
  featureMaintenance: boolean;
  featurePucc: boolean;
  featureReminders: boolean;
  featureInsurance: boolean;
  featureOverview: boolean;
  notificationProcessingEnabled?: boolean;
  notificationProcessingSchedule?: string;
}

export interface SettingsOption {
  value: string;
  label: string;
  colorPreview?: string;
}
