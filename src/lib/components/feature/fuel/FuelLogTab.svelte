<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import FuelLogForm from './FuelLogForm.svelte';
	import FuelLogList from './FuelLogList.svelte';
</script>

<TabContainer
	title="Fuel Logs"
	addAction={() => sheetStore.openSheet(FuelLogForm, 'Add Fuel Log', '', vehicleStore.selectedId)}
	addActionDisabled={!vehicleStore.selectedId}
>
	<FuelLogList />
</TabContainer>
