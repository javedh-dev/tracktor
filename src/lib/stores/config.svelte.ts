import type { Config, Configs } from '$lib/domain/config';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { setLocale } from '$lib/paraglide/runtime.js';

class ConfigStore {
	configs = $state<Configs>({
		dateFormat: 'dd/MM/yyyy',
		currency: 'USD',
		unitOfDistance: 'kilometer',
		unitOfVolume: 'liter',
		unitOfLpg: 'liter',
		unitOfCng: 'kilogram',
		mileageUnitFormat: 'distance-per-fuel',
		locale: 'en',
		timezone: 'UTC',
		featureFuelLog: true,
		featureMaintenance: true,
		featurePucc: true,
		featureReminders: true,
		featureInsurance: true,
		featureOverview: true,
		cronJobsEnabled: true,
		cronRemindersEnabled: true,
		cronRemindersSchedule: '0 * * * *',
		cronInsuranceEnabled: true,
		cronInsuranceSchedule: '0 8 * * *',
		cronPuccEnabled: true,
		cronPuccSchedule: '30 8 * * *',
		cronCleanupEnabled: true,
		cronCleanupSchedule: '0 2 * * *'
	});
	rawConfig = $state<Config[]>([]);
	processing = $state(false);
	error = $state<string>();

	getCustomCss = async () => {
		this.processing = true;
		return apiClient
			.get<ApiResponse>('/config/branding')
			.then(({ data: res }) => {
				const configData = res.data as Config;
				return configData.value || '';
			})
			.catch((_) => {
				this.error = 'Failed to fetch custom CSS';
				return '';
			})
			.finally(() => (this.processing = false));
	};

	refreshConfigs = async () => {
		this.processing = true;
		apiClient
			.get<ApiResponse>('/config')
			.then(({ data: res }) => {
				const configData = res.data as Config[];
				this.rawConfig = configData;
				configData.forEach((item) => {
					switch (item.key) {
						case 'dateFormat':
							this.configs.dateFormat = item.value || this.configs.dateFormat;
							break;
						case 'currency':
							this.configs.currency = item.value || this.configs.currency;
							break;
						case 'unitOfVolume':
							this.configs.unitOfVolume = item.value || this.configs.unitOfVolume;
							break;
						case 'unitOfLpg':
							this.configs.unitOfLpg = item.value || this.configs.unitOfLpg;
							break;
						case 'unitOfCng':
							this.configs.unitOfCng = item.value || this.configs.unitOfCng;
							break;
						case 'unitOfDistance':
							this.configs.unitOfDistance = item.value || this.configs.unitOfDistance;
							break;
						case 'mileageUnitFormat':
							this.configs.mileageUnitFormat = item.value || this.configs.mileageUnitFormat;
							break;
						case 'locale':
							this.configs.locale = item.value || this.configs.locale;
							// Update paraglide locale without reloading during config refresh
							try {
								if (this.configs.locale) {
									setLocale(this.configs.locale as any, { reload: false });
								}
							} catch (_) {
								/* noop */
							}
							break;
						case 'timezone':
							this.configs.timezone = item.value || this.configs.timezone;
							break;
						case 'customCss':
							this.configs.customCss = item.value || this.configs.customCss;
							break;
						case 'featureFuelLog':
							this.configs.featureFuelLog = item.value === 'true';
							break;
						case 'featureMaintenance':
							this.configs.featureMaintenance = item.value === 'true';
							break;
						case 'featurePucc':
							this.configs.featurePucc = item.value === 'true';
							break;
						case 'featureReminders':
							this.configs.featureReminders = item.value === 'true';
							break;
						case 'featureInsurance':
							this.configs.featureInsurance = item.value === 'true';
							break;
						case 'featureOverview':
							this.configs.featureOverview = item.value === 'true';
							break;
						case 'cronJobsEnabled':
							this.configs.cronJobsEnabled = item.value === 'true';
							break;
						case 'cronRemindersEnabled':
							this.configs.cronRemindersEnabled = item.value === 'true';
							break;
						case 'cronRemindersSchedule':
							this.configs.cronRemindersSchedule = item.value || this.configs.cronRemindersSchedule;
							break;
						case 'cronInsuranceEnabled':
							this.configs.cronInsuranceEnabled = item.value === 'true';
							break;
						case 'cronInsuranceSchedule':
							this.configs.cronInsuranceSchedule = item.value || this.configs.cronInsuranceSchedule;
							break;
						case 'cronPuccEnabled':
							this.configs.cronPuccEnabled = item.value === 'true';
							break;
						case 'cronPuccSchedule':
							this.configs.cronPuccSchedule = item.value || this.configs.cronPuccSchedule;
							break;
						case 'cronCleanupEnabled':
							this.configs.cronCleanupEnabled = item.value === 'true';
							break;
						case 'cronCleanupSchedule':
							this.configs.cronCleanupSchedule = item.value || this.configs.cronCleanupSchedule;
							break;
					}
				});
			})
			.catch((_) => (this.error = 'Failed to fetch vehicles'))
			.finally(() => (this.processing = false));
	};
}

export const configStore = new ConfigStore();

export default configStore.configs;
