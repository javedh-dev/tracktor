import { apiClient } from '$lib/helper/api';
import type { Insurance } from '$lib/types';
import type { ApiResponse } from '@tracktor/common';
import { writable } from 'svelte/store';

export type InsuranceStore = {
	insurances: Insurance[];
	openSheet: boolean;
	vehicleId?: string;
	editMode?: boolean;
	selectedId?: string;
	processing: boolean;
	error?: string;
};

const createInsuranceStore = () => {
	const { subscribe, update } = writable<InsuranceStore>({
		insurances: [],
		openSheet: false,
		processing: false
	});

	const refreshInsurances = (vehicleId: string) => {
		update((prev) => ({ ...prev, processing: true }));
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleId}/insurance`)
			.then(({ data: res }) => {
				const insurances: Insurance[] = res.data;
				update((prev) => ({ ...prev, insurances, error: undefined }));
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

	return { subscribe, refreshInsurances, openSheet };
};

export const insuranceStore = createInsuranceStore();
