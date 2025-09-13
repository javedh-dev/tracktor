<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import FuelLogList from './FuelLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Fuel Refill History">
	<FuelLogList {vehicleId} />
</TabContainer>
