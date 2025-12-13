import type { Vehicle } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
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
				if (this.vehicles && this.vehicles.length > 0) {
					this.selectedId = this.vehicles[0].id || undefined;
				} else {
					this.selectedId = undefined;
				}
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch vehicles'))
			.finally(() => (this.processing = false));
	};

	openForm = (id?: string) => {
		this.openSheet = true;
		if (id) {
			const vehicle = this.vehicles?.find((v) => v.id == id);
			if (vehicle) {
				this.selectedId = id;
				this.editMode = true;
			}
		}
	};

	closeForm = () => {
		this.openSheet = false;
		this.editMode = false;
		this.selectedId = undefined;
	};
}

export const vehicleStore = new VehicleStore();
