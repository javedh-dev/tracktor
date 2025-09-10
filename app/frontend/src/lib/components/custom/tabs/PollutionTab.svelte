<script lang="ts">
	import TabContainer from '$appui/common/TabContainer.svelte';
	import PollutionCertificateList from '$appui/lists/PollutionCertificateList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={'Pollution Certificate Details'}>
	<PollutionCertificateList {vehicleId} />
</TabContainer>
