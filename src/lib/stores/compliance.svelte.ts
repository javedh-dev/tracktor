import type { Compliance } from '$lib/domain/compliance';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<Compliance>({
  buildPath: (vehicleId) => (vehicleId ? `/compliance?vehicleId=${vehicleId}` : '/compliance'),
  errorMessage: 'Failed to fetch compliance documents'
});

export const complianceStore = {
  get documents() {
    return entityStore.items;
  },
  get processing() {
    return entityStore.processing;
  },
  get error() {
    return entityStore.error;
  },
  refreshDocuments: entityStore.refresh,
  reloadDocuments: entityStore.reload
};
