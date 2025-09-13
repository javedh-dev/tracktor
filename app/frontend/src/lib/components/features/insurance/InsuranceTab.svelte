<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import InsuranceDetailsList from './InsuranceList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Insurance Details">
	<InsuranceDetailsList {vehicleId} />
</TabContainer>
