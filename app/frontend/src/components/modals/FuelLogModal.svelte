<script lang="ts">
	import FuelLogForm from '$components/forms/FuelLogForm.svelte';
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { fuelLogModelStore } from '$lib/stores/fuel-log';
	import { t } from '$lib/stores/i18n';

	let logToEdit = $state<any>(null);
	let showModal = $state(false);
	let editMode = $state(false);
	let loading = $state(false);
	let vehicleId = $state<string | undefined>(undefined);
	let callback = $state<any>();

	fuelLogModelStore.subscribe((data) => {
		logToEdit = data.logToEdit;
		showModal = data.show;
		editMode = data.editMode;
		vehicleId = data.vehicleId;
		loading = false;
		callback = data.callback;
	});

	function closeModal() {
		fuelLogModelStore.hide();
	}
</script>

{#if showModal}
	<ModalContainer
		onclose={() => closeModal()}
		title={editMode ? $t('modals.editFuelLog') : $t('modals.addFuelLog')}
		{loading}
	>
		<FuelLogForm
			{vehicleId}
			{logToEdit}
			{editMode}
			bind:modalVisibility={showModal}
			{callback}
			{loading}
		/>
	</ModalContainer>
{/if}
