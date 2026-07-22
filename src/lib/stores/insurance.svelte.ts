import type { Insurance } from '$lib/domain';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<Insurance>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/insurance` : undefined,
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
  refreshInsurances: entityStore.refresh
};
