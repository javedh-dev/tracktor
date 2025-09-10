<script lang="ts">
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { vehicleModelStore } from '$lib/stores/vehicle';
	import VehicleForm from '$components/forms/VehicleForm.svelte';

	let showModal = $state(false);
	let vehicleToEdit = $state(null);
	let editMode = $state(false);
	let loading = $state(false);

	vehicleModelStore.subscribe((data) => {
		showModal = data.show;
		vehicleToEdit = data.vehicleToEdit;
		editMode = data.editMode;
		loading = false;
	});

	function closeModal() {
		vehicleModelStore.hide();
	}
</script>

{#if showModal}
	<ModalContainer onclose={closeModal} title={editMode ? 'Edit Vehicle' : 'Add Vehicle'} {loading}>
		<VehicleForm {vehicleToEdit} {editMode} bind:modalVisibility={showModal} {loading} />
	</ModalContainer>
{/if}
