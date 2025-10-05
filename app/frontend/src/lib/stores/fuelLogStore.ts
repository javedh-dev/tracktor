import { axiosAuth } from '$lib/helper/api';
import type { DataPoint } from '$lib/types';
import type { FuelLog } from '$lib/types/fuel';
import type { ApiResponse } from '@tracktor/common';
import { compareDesc } from 'date-fns';
import { writable } from 'svelte/store';

type FuelLogStore = {
	fuelLogs: FuelLog[];
	mileageData?: DataPoint[];
	costData?: DataPoint[];
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

	const updateCostData = (logs: FuelLog[]) => {
		const costData = logs
			.filter((log) => log.cost)
			.map((log) => {
				return {
					x: new Date(log.date),
					y: log.cost
				};
			})
			.sort((a, b) => a.x.getTime() - b.x.getTime());
		update((prev) => ({ ...prev, costData }));
	};

	const updateMileageData = (logs: FuelLog[]) => {
		const mileageData = logs
			.filter((log) => log.mileage)
			.map((log) => {
				return {
					x: new Date(log.date),
					y: log.mileage || 0
				};
			})
			.sort((a, b) => a.x.getTime() - b.x.getTime());
		update((prev) => ({ ...prev, mileageData }));
	};

	const refreshFuelLogs = (vehicleId: string) => {
		update((prev) => ({ ...prev, processing: true }));
		axiosAuth
			.get<ApiResponse>(`/vehicles/${vehicleId}/fuel-logs`)
			.then(({ data: res }) => {
				const logs: FuelLog[] = res.data;
				logs.sort((a, b) => compareDesc(a.date, b.date));
				updateCostData(logs);
				updateMileageData(logs);
				update((prev) => ({ ...prev, fuelLogs: res.data, error: undefined }));
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
