<script lang="ts">
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { puccModelStore } from '$lib/stores/pucc';
	import PollutionCertificateForm from '$components/forms/PollutionCertificateForm.svelte';

	let entryToEdit = $state<any>(null);
	let showModal = $state(false);
	let editMode = $state(false);
	let loading = $state(false);
	let vehicleId = $state<string | undefined>(undefined);
	let callback = $state<any>();

	puccModelStore.subscribe((data) => {
		entryToEdit = data.entryToEdit;
		showModal = data.show;
		editMode = data.editMode;
		vehicleId = data.vehicleId;
		loading = false;
		callback = data.callback;
	});

	function closeModal() {
		puccModelStore.hide();
	}
</script>

{#if showModal}
	<ModalContainer
		onclose={closeModal}
		title={editMode ? 'Edit Pollution Certificate' : 'Add Pollution Certificate'}
		{loading}
	>
		<PollutionCertificateForm
			bind:modalVisibility={showModal}
			bind:entryToEdit
			{editMode}
			{vehicleId}
			{callback}
			{loading}
		/>
	</ModalContainer>
{/if}
