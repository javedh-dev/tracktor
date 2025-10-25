import type { FuelLog, MaintenanceLog } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';
import { vehicleStore } from './vehicle.svelte';

class MaintenanceStore {
	maintenanceLogs = $state<MaintenanceLog[]>();
	vehicleId = $derived<string | undefined>(vehicleStore.selectedId);
	selectedId = $state<string>();
	processing = $state(false);
	openSheet = $state(false);
	editMode = $state(false);
	error = $state<string>();

	refreshMaintenanceLogs = () => {
		this.processing = true;
		apiClient
			.get<ApiResponse>(`/vehicles/${this.vehicleId}/maintenance-logs`)
			.then(({ data: res }) => {
				const logs: MaintenanceLog[] = res.data;
				this.maintenanceLogs = logs;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch Maintenance Logs'))
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
}

export const maintenanceStore = new MaintenanceStore();
