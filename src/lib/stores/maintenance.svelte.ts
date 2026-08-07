import type { MaintenanceLog } from '$lib/domain/maintenance';
import { compareDesc } from 'date-fns';
import { createEntityStore } from './entity-store.svelte';

const entityStore = createEntityStore<MaintenanceLog>({
  buildPath: (vehicleId) =>
    vehicleId ? `/maintenance-logs?vehicleId=${vehicleId}` : '/maintenance-logs',
  sort: (a, b) => {
    const dateDiff = compareDesc(a.date, b.date);
    if (dateDiff !== 0) return dateDiff;
    return b.odometer - a.odometer;
  },
  errorMessage: 'Failed to fetch Maintenance Logs'
});

export const maintenanceStore = {
  get maintenanceLogs() {
    return entityStore.items;
  },
  get processing() {
    return entityStore.processing;
  },
  get error() {
    return entityStore.error;
  },
  refreshMaintenanceLogs: entityStore.refresh,
  reloadMaintenanceLogs: entityStore.reload
};
