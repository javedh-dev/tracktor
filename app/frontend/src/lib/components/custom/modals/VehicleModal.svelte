<script lang="ts">
	import ModalContainer from '$appui/common/ModalContainer.svelte';
	import { vehicleModelStore } from '$stores/vehicle';
	import VehicleForm from '$appui/forms/VehicleForm.svelte';

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
