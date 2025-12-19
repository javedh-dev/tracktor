<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import PollutionCertificateForm from './PollutionCertificateForm.svelte';
	import PollutionCertificateList from './PollutionCertificateList.svelte';
</script>

<TabContainer
	title={'Pollution Certificate Details'}
	addAction={() => {
		sheetStore.openSheet(PollutionCertificateForm, 'Add Pollution Certificate', '');
	}}
	addActionDisabled={!vehicleStore.selectedId}
>
	<PollutionCertificateList />
</TabContainer>
