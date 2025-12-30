<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import MaintenanceForm from './MaintenanceForm.svelte';
	import MaintenanceLogList from './MaintenanceLogList.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<TabContainer
	title={m.maintenance_tab_title()}
	addAction={() => {
		sheetStore.openSheet(MaintenanceForm, m.maintenance_add_action(), '');
	}}
	addActionDisabled={!vehicleStore.selectedId}
>
	<MaintenanceLogList />
</TabContainer>
