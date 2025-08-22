<script lang="ts">
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { puccModelStore } from '$lib/stores/pucc';
	import PollutionCertificateForm from '$components/forms/PollutionCertificateForm.svelte';
	import { t } from '$lib/stores/i18n';

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
		title={editMode ? $t('modals.editPollution') : $t('modals.addPollution')}
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
