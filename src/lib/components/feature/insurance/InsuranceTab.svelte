<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import InsuranceForm from './InsuranceForm.svelte';
	import InsuranceDetailsList from './InsuranceList.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<TabContainer
	title={m.insurance_tab_title()}
	addAction={() => {
		sheetStore.openSheet(InsuranceForm, m.insurance_add_action(), '');
	}}
	addActionDisabled={!vehicleStore.selectedId}
>
	<InsuranceDetailsList />
</TabContainer>
