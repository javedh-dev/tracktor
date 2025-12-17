<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import MaintenanceForm from './MaintenanceForm.svelte';
	import MaintenanceLogList from './MaintenanceLogList.svelte';
</script>

<TabContainer
	title="Maintenance History"
	addAction={() => {
		sheetStore.openSheet(MaintenanceForm, 'Add Maintenance Log', '', {
			vehicleId: vehicleStore.selectedId
		});
	}}
	addActionDisabled={!vehicleStore.selectedId}
>
	<MaintenanceLogList />
</TabContainer>
