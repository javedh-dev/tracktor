<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import InsuranceDetailsList from '$lib/components/features/dashboard/insurance/InsuranceList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Insurance Details">
	<InsuranceDetailsList {vehicleId} />
</TabContainer>
