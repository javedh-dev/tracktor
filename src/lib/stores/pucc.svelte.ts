import type { PollutionCertificate } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import type { ApiResponse } from '$lib/response';
import { vehicleStore } from './vehicle.svelte';

class PuccStore {
  pollutionCerts = $state<PollutionCertificate[]>();
  vehicleId = $derived<string | undefined>(vehicleStore.selectedId);
  selectedId = $state<string>();
  processing = $state(false);
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

  // openForm removed - use sheetStore.openSheet() instead
}

export const puccStore = new PuccStore();
