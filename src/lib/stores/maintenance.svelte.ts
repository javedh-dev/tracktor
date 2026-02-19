import type { FuelLog, MaintenanceLog } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { compareDesc } from 'date-fns';
import { vehicleStore } from './vehicle.svelte';

class MaintenanceStore {
	maintenanceLogs = $state<MaintenanceLog[]>();
	processing = $state(false);
	error = $state<string>();

	refreshMaintenanceLogs = () => {
		if (!vehicleStore.selectedId) return;
		this.processing = true;
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleStore.selectedId}/maintenance-logs`)
			.then(({ data: res }) => {
				const logs: MaintenanceLog[] = res.data;
				logs.sort((a, b) => {
					const dateDiff = compareDesc(a.date, b.date);
					if (dateDiff !== 0) return dateDiff;
					return b.odometer - a.odometer;
				});
				this.maintenanceLogs = logs;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch Maintenance Logs'))
			.finally(() => (this.processing = false));
	};
}

export const maintenanceStore = new MaintenanceStore();
