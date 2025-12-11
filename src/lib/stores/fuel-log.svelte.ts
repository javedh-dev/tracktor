import type { FuelLog } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';
import { compareDesc } from 'date-fns';
import { vehicleStore } from './vehicle.svelte';

class FuelLogStore {
	fuelLogs = $state<FuelLog[]>();
	processing = $state(false);
	error = $state<string>();

	refreshFuelLogs = () => {
		if (!vehicleStore.selectedId) return;
		this.processing = true;
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleStore.selectedId}/fuel-logs`)
			.then(({ data: res }) => {
				const logs: FuelLog[] = res.data;
				logs.sort((a, b) => compareDesc(a.date, b.date));
				this.fuelLogs = logs;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch Fuel Logs'))
			.finally(() => (this.processing = false));
	};
}

export const fuelLogStore = new FuelLogStore();
