<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import FuelLogForm from './FuelLogForm.svelte';
	import FuelLogImportForm from './FuelLogImportForm.svelte';
	import FuelLogList from './FuelLogList.svelte';
	import {
		nav_fuel_logs,
		fuel_import_title,
		fuel_add_title
	} from '$lib/paraglide/messages/_index.js';
</script>

<TabContainer
	title={nav_fuel_logs()}
	importAction={() => sheetStore.openSheet(FuelLogImportForm, fuel_import_title(), '')}
	addAction={() => sheetStore.openSheet(FuelLogForm, fuel_add_title(), '')}
	addActionDisabled={!vehicleStore.selectedId}
>
	<FuelLogList />
</TabContainer>
