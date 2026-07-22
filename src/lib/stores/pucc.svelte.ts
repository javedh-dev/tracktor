import type { PollutionCertificate } from '$lib/domain';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<PollutionCertificate>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/pucc` : undefined,
  errorMessage: 'Failed to fetch PUCCs'
});

export const puccStore = {
  get pollutionCerts() {
    return entityStore.items;
  },
  get processing() {
    return entityStore.processing;
  },
  get error() {
    return entityStore.error;
  },
  refreshPuccs: entityStore.refresh
};
