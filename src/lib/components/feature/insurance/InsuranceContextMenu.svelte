<script lang="ts">
  import CrudActionsMenu from '$appui/CrudActionsMenu.svelte';
  import { deleteInsurance } from '$lib/services/insurance.service';
  import type { Insurance } from '$lib/domain';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import InsuranceForm from './InsuranceForm.svelte';
  import * as m from '$lib/paraglide/messages';

  let { insurance, onaction }: { insurance: Insurance; onaction: () => void } = $props();

  const deleteIns = (closeDialog: () => void) => {
    deleteInsurance(insurance).then((res) => {
      if (res.status === 'OK') {
        closeDialog();
        toast.success(m.insurance_delete_success());
        onaction();
      } else {
        toast.error(res.error || m.insurance_delete_error());
      }
    });
  };
</script>

<CrudActionsMenu
  menuId="insurance-context-menu"
  triggerId="insurance-menu-trigger"
  contentId="insurance-menu-content"
  editItemId="insurance-menu-edit"
  deleteItemId="insurance-menu-delete"
  openLabel={m.insurance_menu_open()}
  editLabel={m.insurance_menu_edit()}
  deleteLabel={m.insurance_menu_delete()}
  onEdit={() => sheetStore.openSheet(InsuranceForm, m.insurance_menu_sheet_title(), '', insurance)}
  onDelete={deleteIns}
/>
