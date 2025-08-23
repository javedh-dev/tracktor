<script lang="ts">
	import MaintenanceLogForm from '$components/forms/MaintenanceLogForm.svelte';
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { maintenanceModelStore } from '$lib/stores/maintenance';
	import { t } from '$lib/stores/i18n';

	let logToEdit = $state<any>(null);
	let showModal = $state(false);
	let editMode = $state(false);
	let loading = $state(false);
	let vehicleId = $state<string | undefined>(undefined);
	let callback = $state<any>();

	maintenanceModelStore.subscribe((data) => {
		logToEdit = data.logToEdit;
		showModal = data.show;
		editMode = data.editMode;
		vehicleId = data.vehicleId;
		loading = false;
		callback = data.callback;
	});

	function closeModal() {
		maintenanceModelStore.hide();
	}
</script>

{#if showModal}
	<ModalContainer
		onclose={closeModal}
		title={editMode ? $t('modals.editMaintenance') : $t('modals.addMaintenance')}
		{loading}
	>
		<MaintenanceLogForm
			bind:modalVisibility={showModal}
			bind:logToEdit
			{editMode}
			{vehicleId}
			{callback}
			{loading}
		/>
	</ModalContainer>
{/if}
