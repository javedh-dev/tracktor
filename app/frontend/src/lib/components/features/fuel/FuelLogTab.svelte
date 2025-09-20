<script lang="ts">
	import TabContainer from '$lib/components/app/TabContainer.svelte';
	import FuelLogList from './FuelLogList.svelte';

	let { vehicleId } = $props();
</script>

<TabContainer title="Fuel Logs">
	<FuelLogList {vehicleId} />
</TabContainer>
