import { apiClient } from '$lib/helper/api.helper';
import type { FuelLog } from '$lib/types/fuel';
import type { ApiResponse } from '@tracktor/common';
import { compareDesc } from 'date-fns';
import { writable } from 'svelte/store';

export type FuelLogStore = {
	fuelLogs: FuelLog[];
	openSheet: boolean;
	vehicleId?: string;
	editMode?: boolean;
	selectedId?: string;
	processing: boolean;
	error?: string;
};

const createFuelLogStore = () => {
	const { subscribe, update } = writable<FuelLogStore>({
		fuelLogs: [],
		openSheet: false,
		processing: false
	});

	const refreshFuelLogs = (vehicleId: string) => {
		update((prev) => ({ ...prev, processing: true }));
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleId}/fuel-logs`)
			.then(({ data: res }) => {
				const logs: FuelLog[] = res.data;
				logs.sort((a, b) => compareDesc(a.date, b.date));
				update((prev) => ({ ...prev, fuelLogs: logs, error: undefined }));
			})
			.catch((err) => {
				console.log(err);
				update((prev) => ({ ...prev, error: 'Failed to fetch fuel logs' }));
			})
			.finally(() => update((prev) => ({ ...prev, processing: false })));
	};

	const openSheet = (state: boolean, editMode?: boolean) => {
		update((prev) => ({ ...prev, openSheet: state, editMode }));
	};

	return { subscribe, refreshFuelLogs, openSheet };
};

export const fuelLogStore = createFuelLogStore();
