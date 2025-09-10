<script lang="ts">
	import TabContainer from '$appui/common/TabContainer.svelte';
	import FuelLogList from '$appui/lists/FuelLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Fuel Refill History">
	<FuelLogList {vehicleId} />
</TabContainer>
