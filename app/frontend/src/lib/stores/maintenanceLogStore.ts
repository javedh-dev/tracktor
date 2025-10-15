import { apiClient } from '$lib/helper/api.helper';
import type { MaintenanceLog } from '$lib/types';
import type { ApiResponse } from '@tracktor/common';
import { compareDesc } from 'date-fns';
import { writable } from 'svelte/store';

export type MaintenanceLogStore = {
	maintenanceLogs: MaintenanceLog[];
	openSheet: boolean;
	vehicleId?: string;
	editMode?: boolean;
	selectedId?: string;
	processing: boolean;
	error?: string;
};

const createMaintenanceLogStore = () => {
	const { subscribe, update } = writable<MaintenanceLogStore>({
		maintenanceLogs: [],
		openSheet: false,
		processing: false
	});

	const refreshMaintenanceLogs = (vehicleId: string) => {
		update((prev) => ({ ...prev, processing: true }));
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleId}/maintenance-logs`)
			.then(({ data: res }) => {
				const logs: MaintenanceLog[] = res.data;
				logs.sort((a, b) => compareDesc(a.date, b.date));
				update((prev) => ({ ...prev, maintenanceLogs: logs, error: undefined }));
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

	return { subscribe, refreshMaintenanceLogs, openSheet };
};

export const maintenanceLogStore = createMaintenanceLogStore();
