import type { Insurance } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';
import { vehicleStore } from './vehicle.svelte';

class InsuranceStore {
	insurances = $state<Insurance[]>();
	vehicleId = $derived<string | undefined>(vehicleStore.selectedId);
	selectedId = $state<string>();
	processing = $state(false);
	openSheet = $state(false);
	editMode = $state(false);
	error = $state<string>();

	refreshInsurances = () => {
		this.processing = true;
		apiClient
			.get<ApiResponse>('/fuel-logs')
			.then(({ data: res }) => {
				this.insurances = res.data;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch Insurances'))
			.finally(() => (this.processing = false));
	};

	openForm = (state: boolean, id?: string | null, vehicleId?: string) => {
		this.openSheet = state;
		if (id) {
			this.selectedId = id;
			this.vehicleId = vehicleId;
			this.editMode = true;
		}
	};

	setVehicleId = (id: string) => {
		this.vehicleId = id;
	};
}

export const insuranceStore = new InsuranceStore();
