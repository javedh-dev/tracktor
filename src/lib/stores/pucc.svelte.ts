import type { PollutionCertificate } from '$lib/domain';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

const { items, processing, error, refresh } = createEntityStore<PollutionCertificate>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/pucc` : undefined,
  errorMessage: 'Failed to fetch PUCCs'
});

export const puccStore = {
  get pollutionCerts() {
    return items;
  },
  get processing() {
    return processing;
  },
  get error() {
    return error;
  },
  refreshPuccs: refresh
};
