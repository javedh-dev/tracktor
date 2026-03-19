<script lang="ts">
  import CrudActionsMenu from '$appui/CrudActionsMenu.svelte';
  import { deletePollutionCertificate } from '$lib/services/pucc.service';
  import type { PollutionCertificate } from '$lib/domain';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import PollutionCertificateForm from './PollutionCertificateForm.svelte';
  import * as m from '$lib/paraglide/messages';

  let { pucc, onaction }: { pucc: PollutionCertificate; onaction: () => void } = $props();

  const deletePucc = (closeDialog: () => void) => {
    deletePollutionCertificate(pucc).then((res) => {
      if (res.status === 'OK') {
        closeDialog();
        toast.success(m.pollution_delete_success());
        onaction();
      } else {
        toast.error(res.error || m.pollution_delete_error());
      }
    });
  };
</script>

<CrudActionsMenu
  menuId="pollution-context-menu"
  triggerId="pollution-menu-trigger"
  contentId="pollution-menu-content"
  editItemId="pollution-menu-edit"
  deleteItemId="pollution-menu-delete"
  openLabel={m.pollution_menu_open()}
  editLabel={m.pollution_menu_edit()}
  deleteLabel={m.pollution_menu_delete()}
  onEdit={() =>
    sheetStore.openSheet(PollutionCertificateForm, m.pollution_menu_sheet_title(), '', pucc)}
  onDelete={deletePucc}
/>
