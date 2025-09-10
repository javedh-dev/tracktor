<script lang="ts">
	import TabContainer from '$components/common/TabContainer.svelte';
	import InsuranceDetailsList from '$components/lists/InsuranceList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Insurance Details">
	<InsuranceDetailsList {vehicleId} />
</TabContainer>
