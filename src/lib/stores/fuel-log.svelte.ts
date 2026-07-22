import type { FuelLog } from '$lib/domain';
import { compareDesc } from 'date-fns';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<FuelLog>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/fuel-logs` : undefined,
  sort: (a, b) => {
    const dateDiff = compareDesc(a.date, b.date);
    if (dateDiff !== 0) return dateDiff;
    return (b.odometer ?? 0) - (a.odometer ?? 0);
  },
  errorMessage: 'Failed to fetch Fuel Logs'
});

export const fuelLogStore = {
  get fuelLogs() {
    return entityStore.items;
  },
  get processing() {
    return entityStore.processing;
  },
  get error() {
    return entityStore.error;
  },
  refreshFuelLogs: entityStore.refresh
};
