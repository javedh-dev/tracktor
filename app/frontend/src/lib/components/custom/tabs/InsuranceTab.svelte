<script lang="ts">
	import TabContainer from '$appui/common/TabContainer.svelte';
	import InsuranceDetailsList from '$appui/lists/InsuranceList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Insurance Details">
	<InsuranceDetailsList {vehicleId} />
</TabContainer>
