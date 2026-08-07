<script lang="ts">
  import FuelLogForm from './FuelLogForm.svelte';
  import FuelLogImportForm from './FuelLogImportForm.svelte';
  import FuelLogList from './FuelLogList.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { fuel_import_title, fuel_add_title } from '$lib/paraglide/messages/_index.js';
</script>

<FuelLogList
  addAction={() => sheetStore.openSheet(FuelLogForm, fuel_add_title(), '')}
  importAction={() => sheetStore.openSheet(FuelLogImportForm, fuel_import_title(), '')}
/>
