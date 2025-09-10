<script lang="ts">
	import TabContainer from '$components/common/TabContainer.svelte';
	import FuelLogList from '$components/lists/FuelLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Fuel Refill History">
	<FuelLogList {vehicleId} />
</TabContainer>
