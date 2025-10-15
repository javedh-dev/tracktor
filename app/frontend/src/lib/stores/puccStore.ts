import { apiClient } from '$lib/helper/api.helper';
import type { PollutionCertificate } from '$lib/types';
import type { ApiResponse } from '@tracktor/common';
import { writable } from 'svelte/store';

export type PuccStore = {
	puccs: PollutionCertificate[];
	openSheet: boolean;
	vehicleId?: string;
	editMode?: boolean;
	selectedId?: string;
	processing: boolean;
	error?: string;
};

const createPuccStore = () => {
	const { subscribe, update } = writable<PuccStore>({
		puccs: [],
		openSheet: false,
		processing: false
	});

	const refreshPuccs = (vehicleId: string) => {
		update((prev) => ({ ...prev, processing: true }));
		apiClient
			.get<ApiResponse>(`/vehicles/${vehicleId}/pucc`)
			.then(({ data: res }) => {
				const puccs: PollutionCertificate[] = res.data;
				update((prev) => ({ ...prev, puccs, error: undefined }));
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

	return { subscribe, refreshPuccs, openSheet };
};

export const puccStore = createPuccStore();
