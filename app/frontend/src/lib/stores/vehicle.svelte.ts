import type { Vehicle } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';
import { toast } from 'svelte-sonner';

class VehicleStore {
	vehicles = $state<Vehicle[]>();
	selectedId = $state<string>();
	processing = $state(false);
	openSheet = $state(false);
	editMode = $state(false);
	error = $state<string>();

	refreshVehicles = () => {
		this.processing = true;
		apiClient
			.get<ApiResponse>('/vehicles')
			.then(({ data: res }) => {
				this.vehicles = res.data;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch vehicles'))
			.finally(() => (this.processing = false));
	};

	openForm = (state: boolean, id?: string) => {
		this.openSheet = state;
		if (id) {
			const vehicle = this.vehicles?.find((v) => v.id == id);
			if (vehicle) {
				this.selectedId = id;
				this.editMode = true;
			}
		}
	};
}

export const vehicleStore = new VehicleStore();
