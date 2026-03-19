<script lang="ts">
  import CrudActionsMenu from '$appui/CrudActionsMenu.svelte';
  import type { MaintenanceLog } from '$lib/domain';
  import { toast } from 'svelte-sonner';
  import { deleteMaintenanceLog } from '$lib/services/maintenance.service';
  import { sheetStore } from '$stores/sheet.svelte';
  import MaintenanceForm from './MaintenanceForm.svelte';
  import * as m from '$lib/paraglide/messages';

  let { maintenanceLog, onaction }: { maintenanceLog: MaintenanceLog; onaction: () => void } =
    $props();

  const deleteLog = (closeDialog: () => void) => {
    deleteMaintenanceLog(maintenanceLog).then((res) => {
      if (res.status === 'OK') {
        closeDialog();
        toast.success(m.maintenance_delete_success());
        onaction();
      } else {
        toast.error(res.error || m.maintenance_delete_error());
      }
    });
  };
</script>

<CrudActionsMenu
  menuId="maintenance-context-menu"
  triggerId="maintenance-menu-trigger"
  contentId="maintenance-menu-content"
  editItemId="maintenance-menu-edit"
  deleteItemId="maintenance-menu-delete"
  openLabel={m.maintenance_menu_open()}
  editLabel={m.maintenance_menu_edit()}
  deleteLabel={m.maintenance_menu_delete()}
  onEdit={() =>
    sheetStore.openSheet(MaintenanceForm, m.maintenance_menu_sheet_title(), '', maintenanceLog)}
  onDelete={deleteLog}
/>
