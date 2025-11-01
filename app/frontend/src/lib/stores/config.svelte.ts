import type { Config, Configs } from '$lib/domain/config';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';

class ConfigStore {
	configs = $state<Configs>({
		dateFormat: 'dd/MM/yyyy',
		currency: 'USD',
		unitOfDistance: 'kilometer',
		unitOfVolume: 'liter',
		locale: 'en',
		timezone: 'UTC'
	});
	rawConfig = $state<Config[]>([]);
	processing = $state(false);
	error = $state<string>();

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
						case 'unitOfDistance':
							this.configs.unitOfDistance = item.value || this.configs.unitOfDistance;
							break;
						case 'locale':
							this.configs.locale = item.value || this.configs.locale;
							break;
						case 'timezone':
							this.configs.timezone = item.value || this.configs.timezone;
							break;
					}
				});
			})
			.catch((err) => (this.error = 'Failed to fetch vehicles'))
			.finally(() => (this.processing = false));
	};
}

export const configStore = new ConfigStore();

export default configStore.configs;
