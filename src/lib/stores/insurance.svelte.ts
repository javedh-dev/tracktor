import type { Insurance } from '$lib/domain';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<Insurance>({
  buildPath: (vehicleId) => (vehicleId ? `/insurance?vehicleId=${vehicleId}` : '/insurance'),
  errorMessage: 'Failed to fetch Insurances'
});

export const insuranceStore = {
  get insurances() {
    return entityStore.items;
  },
  get processing() {
    return entityStore.processing;
  },
  get error() {
    return entityStore.error;
  },
  refreshInsurances: entityStore.refresh,
  reloadInsurances: entityStore.reload
};
