<script lang="ts">
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { insuranceModelStore } from '$lib/stores/insurance';
	import InsuranceForm from '$components/forms/InsuranceForm.svelte';
	import { t } from '$lib/stores/i18n';

	let entryToEdit = $state<any>(null);
	let showModal = $state(false);
	let editMode = $state(false);
	let loading = $state(false);
	let vehicleId = $state<string | undefined>(undefined);
	let callback = $state<any>();

	insuranceModelStore.subscribe((data) => {
		entryToEdit = data.entryToEdit;
		showModal = data.show;
		editMode = data.editMode;
		vehicleId = data.vehicleId;
		loading = false;
		callback = data.callback;
	});

	function closeModal() {
		insuranceModelStore.hide();
	}
</script>

{#if showModal}
	<ModalContainer
		onclose={closeModal}
		title={editMode ? $t('modals.editInsurance') : $t('modals.addInsurance')}
		{loading}
	>
		<InsuranceForm
			bind:modalVisibility={showModal}
			bind:entryToEdit
			{editMode}
			{vehicleId}
			{callback}
			{loading}
		/>
	</ModalContainer>
{/if}
