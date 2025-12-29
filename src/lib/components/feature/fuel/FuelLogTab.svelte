<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import FuelLogForm from './FuelLogForm.svelte';
	import FuelLogImportForm from './FuelLogImportForm.svelte';
	import FuelLogList from './FuelLogList.svelte';
</script>

<TabContainer
	title="Fuel Logs"
	importAction={() => sheetStore.openSheet(FuelLogImportForm, 'Import Fuel Logs', '')}
	addAction={() => sheetStore.openSheet(FuelLogForm, 'Add Fuel Log', '')}
	addActionDisabled={!vehicleStore.selectedId}
>
	<FuelLogList />
</TabContainer>
