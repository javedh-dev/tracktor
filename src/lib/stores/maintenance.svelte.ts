import type { MaintenanceLog } from '$lib/domain';
import { compareDesc } from 'date-fns';
import { vehicleStore } from './vehicle.svelte';
import { createEntityStore } from './entity-store.svelte';

const { items, processing, error, refresh } = createEntityStore<MaintenanceLog>({
  buildPath: () =>
    vehicleStore.selectedId ? `/vehicles/${vehicleStore.selectedId}/maintenance-logs` : undefined,
  sort: (a, b) => {
    const dateDiff = compareDesc(a.date, b.date);
    if (dateDiff !== 0) return dateDiff;
    return b.odometer - a.odometer;
  },
  errorMessage: 'Failed to fetch Maintenance Logs'
});

export const maintenanceStore = {
  get maintenanceLogs() {
    return items;
  },
  get processing() {
    return processing;
  },
  get error() {
    return error;
  },
  refreshMaintenanceLogs: refresh
};
