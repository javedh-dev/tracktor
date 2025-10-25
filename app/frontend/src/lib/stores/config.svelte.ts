import type { Config } from '$lib/domain/config';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';

class ConfigStore {
	configs = $state<Config[]>([]);
	openSheet = $state(false);
	processing = $state(false);
	error = $state<string>();

	refreshConfigs = () => {
		this.processing = true;
		apiClient
			.get<ApiResponse>('/configs')
			.then(({ data: res }) => {
				this.configs = res.data;
			})
			.catch((err) => (this.error = 'Failed to fetch vehicles'))
			.finally(() => (this.processing = false));
	};

	openForm = (state: boolean) => {
		this.openSheet = state;
	};
}

export const configStore = new ConfigStore();
