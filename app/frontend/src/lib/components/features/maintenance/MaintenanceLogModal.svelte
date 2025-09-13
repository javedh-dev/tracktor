<script lang="ts">
	import MaintenanceLogForm from './MaintenanceLogForm.svelte';
	import ModalContainer from '$appui/ModalContainer.svelte';
	import { maintenanceModelStore } from '$stores/maintenance';

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
		title={editMode ? 'Edit Maintenance Log' : 'Add Maintenance Log'}
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
