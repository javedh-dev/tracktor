<script lang="ts">
	import TabContainer from '$components/common/TabContainer.svelte';
	import PollutionCertificateList from '$components/lists/PollutionCertificateList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={'Pollution Certificate Details'}>
	<PollutionCertificateList {vehicleId} />
</TabContainer>
