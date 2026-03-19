<script lang="ts">
  import FeatureTabShell from '$appui/FeatureTabShell.svelte';
  import FuelLogForm from './FuelLogForm.svelte';
  import FuelLogImportForm from './FuelLogImportForm.svelte';
  import FuelLogList from './FuelLogList.svelte';
  import {
    nav_fuel_logs,
    fuel_import_title,
    fuel_add_title
  } from '$lib/paraglide/messages/_index.js';
</script>

<FeatureTabShell
  title={nav_fuel_logs()}
  listComponent={FuelLogList}
  addSheetTitle={fuel_add_title()}
  addSheetComponent={FuelLogForm}
  importSheetTitle={fuel_import_title()}
  importSheetComponent={FuelLogImportForm}
/>
