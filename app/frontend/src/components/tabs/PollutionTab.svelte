<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import TabContainer from '$components/common/TabContainer.svelte';
	import PollutionCertificateList from '$components/lists/PollutionCertificateList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={$t('modals.pollutionDetails')}>
	<PollutionCertificateList {vehicleId} />
</TabContainer>
