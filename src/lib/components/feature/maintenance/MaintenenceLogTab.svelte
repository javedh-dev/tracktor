<script lang="ts">
  import MaintenanceForm from './MaintenanceForm.svelte';
  import MaintenanceLogList from './MaintenanceLogList.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { vehicleStore } from '$lib/stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { exportMaintenanceLogsPdf } from '$lib/services/maintenance.service';
  import * as m from '$lib/paraglide/messages';

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const handleExportPdf = async () => {
    if (scope.vehicleId) {
      await exportMaintenanceLogsPdf(scope.vehicleId);
    }
  };
</script>

<MaintenanceLogList
  addAction={() => sheetStore.openSheet(MaintenanceForm, m.maintenance_add_action(), '')}
  exportAction={scope.vehicleId ? handleExportPdf : null}
/>
