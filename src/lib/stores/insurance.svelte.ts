import type { Insurance } from '$lib/domain';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

const { items, processing, error, refresh } = createEntityStore<Insurance>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/insurance` : undefined,
  errorMessage: 'Failed to fetch Insurances'
});

export const insuranceStore = {
  get insurances() {
    return items;
  },
  get processing() {
    return processing;
  },
  get error() {
    return error;
  },
  refreshInsurances: refresh
};
