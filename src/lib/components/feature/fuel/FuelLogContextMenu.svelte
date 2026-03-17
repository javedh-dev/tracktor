<script lang="ts">
  import CrudActionsMenu from '$appui/CrudActionsMenu.svelte';
  import { deleteFuelLog } from '$lib/services/fuel.service';
  import type { FuelLog } from '$lib/domain/fuel';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import FuelLogForm from './FuelLogForm.svelte';
  import * as m from '$lib/paraglide/messages';

  let { fuelLog, onaction }: { fuelLog: FuelLog; onaction: () => void } = $props();

  const deleteLog = (closeDialog: () => void) => {
    deleteFuelLog(fuelLog).then((res) => {
      if (res.status === 'OK') {
        closeDialog();
        toast.success(m.fuel_log_delete_success());
        onaction();
      } else {
        toast.error(res.error || m.fuel_log_delete_error());
      }
    });
  };
</script>

<CrudActionsMenu
  menuId="fuel-log-context-menu"
  triggerId="fuel-log-menu-trigger"
  contentId="fuel-log-menu-content"
  editItemId="fuel-log-menu-edit"
  deleteItemId="fuel-log-menu-delete"
  openLabel={m.fuel_log_menu_open()}
  editLabel={m.fuel_log_edit()}
  deleteLabel={m.fuel_log_delete()}
  onEdit={() => sheetStore.openSheet(FuelLogForm, m.fuel_log_menu_sheet_title(), '', fuelLog)}
  onDelete={deleteLog}
/>
