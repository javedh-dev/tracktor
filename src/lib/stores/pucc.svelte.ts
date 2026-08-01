import type { PollutionCertificate } from '$lib/domain/pucc';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<PollutionCertificate>({
  buildPath: (vehicleId) => (vehicleId ? `/pucc?vehicleId=${vehicleId}` : '/pucc'),
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
  refreshPuccs: entityStore.refresh,
  reloadPuccs: entityStore.reload
};
