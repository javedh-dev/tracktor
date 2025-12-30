<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import PollutionCertificateForm from './PollutionCertificateForm.svelte';
	import PollutionCertificateList from './PollutionCertificateList.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<TabContainer
	title={m.pollution_tab_title()}
	addAction={() => {
		sheetStore.openSheet(PollutionCertificateForm, m.pollution_add_action(), '');
	}}
	addActionDisabled={!vehicleStore.selectedId}
>
	<PollutionCertificateList />
</TabContainer>
