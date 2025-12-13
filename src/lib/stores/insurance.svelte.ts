import type { Insurance } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { vehicleStore } from './vehicle.svelte';

class InsuranceStore {
	insurances = $state<Insurance[]>();
	processing = $state(false);
	error = $state<string>();

	refreshInsurances = () => {
		if (!vehicleStore.selectedId) return;
		this.processing = true;
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleStore.selectedId}/insurance`)
			.then(({ data: res }) => {
				this.insurances = res.data;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch Insurances'))
			.finally(() => (this.processing = false));
	};
}

export const insuranceStore = new InsuranceStore();
