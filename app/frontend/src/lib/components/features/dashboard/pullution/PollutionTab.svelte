<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import PollutionCertificateList from '$lib/components/features/dashboard/pullution/PollutionCertificateList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title={'Pollution Certificate Details'}>
	<PollutionCertificateList {vehicleId} />
</TabContainer>
