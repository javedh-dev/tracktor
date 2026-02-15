export interface Config {
	key: string;
	value?: string;
	description?: string;
}

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
}
