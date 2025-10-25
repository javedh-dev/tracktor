import type { FuelLog } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '@tracktor/common';
import { compareDesc } from 'date-fns';
import { vehicleStore } from './vehicle.svelte';

class FuelLogStore {
	fuelLogs = $state<FuelLog[]>();
	vehicleId = $derived<string | undefined>(vehicleStore.selectedId);
	selectedId = $state<string>();
	processing = $state(false);
	openSheet = $state(false);
	editMode = $state(false);
	error = $state<string>();

	refreshFuelLogs = () => {
		this.processing = true;
		apiClient
			.get<ApiResponse>(`/vehicles/${this.vehicleId}/fuel-logs`)
			.then(({ data: res }) => {
				const logs: FuelLog[] = res.data;
				logs.sort((a, b) => compareDesc(a.date, b.date));
				this.fuelLogs = logs;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch Fuel Logs'))
			.finally(() => (this.processing = false));
	};

	openForm = (state: boolean, id?: string | null, vehicleId?: string | null) => {
		this.openSheet = state;
		id && (this.selectedId = id) && (this.editMode = true);
		vehicleId && (this.vehicleId = vehicleId);
	};
	setVehicleId = (id: string) => {
		this.vehicleId = id;
	};
}

export const fuelLogStore = new FuelLogStore();
