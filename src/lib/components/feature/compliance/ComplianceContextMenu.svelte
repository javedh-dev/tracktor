<script lang="ts">
  import CrudActionsMenu from '$appui/CrudActionsMenu.svelte';
  import { deleteComplianceDocument } from '$lib/services/compliance.service';
  import type { Compliance } from '$lib/domain/compliance';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import ComplianceForm from './ComplianceForm.svelte';
  import * as m from '$lib/paraglide/messages';

  let { document, onaction }: { document: Compliance; onaction: () => void } = $props();

  const deleteDoc = (closeDialog: () => void) => {
    deleteComplianceDocument(document).then((res) => {
      if (res.status === 'OK') {
        closeDialog();
        toast.success(m.compliance_delete_success());
        onaction();
      } else {
        toast.error(res.error || m.compliance_delete_error());
      }
    });
  };
</script>

<CrudActionsMenu
  menuId="compliance-context-menu"
  triggerId="compliance-menu-trigger"
  contentId="compliance-menu-content"
  editItemId="compliance-menu-edit"
  deleteItemId="compliance-menu-delete"
  openLabel={m.compliance_menu_open()}
  editLabel={m.compliance_menu_edit()}
  deleteLabel={m.compliance_menu_delete()}
  onEdit={() => sheetStore.openSheet(ComplianceForm, m.compliance_menu_sheet_title(), '', document)}
  onDelete={deleteDoc}
/>
