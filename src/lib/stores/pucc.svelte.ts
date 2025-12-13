import type { PollutionCertificate } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { vehicleStore } from './vehicle.svelte';
import { onMount } from 'svelte';

class PuccStore {
	pollutionCerts = $state<PollutionCertificate[]>();
	vehicleId = $derived<string | undefined>(vehicleStore.selectedId);
	selectedId = $state<string>();
	processing = $state(false);
	openSheet = $state(false);
	editMode = $state(false);
	error = $state<string>();

	refreshPuccs = () => {
		if (!this.vehicleId) return;
		this.processing = true;
		apiClient
			.get<ApiResponse>(`/vehicles/${this.vehicleId}/pucc`)
			.then(({ data: res }) => {
				this.pollutionCerts = res.data;
				this.error = undefined;
			})
			.catch((err) => (this.error = 'Failed to fetch PUCCs'))
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

export const puccStore = new PuccStore();
