<script lang="ts">
	import ConfigForm from '$appui/forms/ConfigForm.svelte';
	import ModalContainer from '$appui/common/ModalContainer.svelte';
	import { configModelStore } from '$stores/config';

	let showModal = $state(false);
	let loading = $state(false);
	let callback = $state<any>();

	configModelStore.subscribe((data) => {
		showModal = data.show;
		loading = false;
		callback = data.callback;
	});

	function closeModal() {
		configModelStore.hide();
	}
</script>

{#if showModal}
	<ModalContainer onclose={() => closeModal()} title="Configurations" {loading}>
		<ConfigForm bind:modalVisibility={showModal} {callback} {loading} />
	</ModalContainer>
{/if}
