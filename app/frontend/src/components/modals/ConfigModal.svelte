<script lang="ts">
	import ConfigForm from '$components/forms/ConfigForm.svelte';
	import ModalContainer from '$components/common/ModalContainer.svelte';
	import { configModelStore } from '$lib/stores/config';
	import { t } from '$lib/stores/i18n';

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
	<ModalContainer
		onclose={() => closeModal()}
		title={$t('modals.configurations')}
		{loading}
	>
		<ConfigForm
			bind:modalVisibility={showModal}
			{callback}
			{loading}
		/>
	</ModalContainer>
{/if}
