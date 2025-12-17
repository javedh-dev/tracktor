<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import InsuranceForm from './InsuranceForm.svelte';
	import InsuranceDetailsList from './InsuranceList.svelte';
</script>

<TabContainer
	title="Insurance Details"
	addAction={() => {
		sheetStore.openSheet(InsuranceForm, 'Add Insurance', '', {
			vehicleId: vehicleStore.selectedId
		});
	}}
	addActionDisabled={!vehicleStore.selectedId}
>
	<InsuranceDetailsList />
</TabContainer>
