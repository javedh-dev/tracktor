<script lang="ts">
	import TabContainer from '$lib/components/app/TabContainer.svelte';
	import CostChart from './CostChart.svelte';
	import MileageChart from './MileageChart.svelte';

	const { vehicleId } = $props();
</script>

<TabContainer title="Overview">
	<div class="overflow-x-auto">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<MileageChart {vehicleId} />
			<CostChart {vehicleId} />
		</div>
	</div>
</TabContainer>
