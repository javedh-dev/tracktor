<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import CostChart from './CostChart.svelte';
	import MileageChart from './MileageChart.svelte';
</script>

<TabContainer title="Overview">
	<div class="overflow-x-auto">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<MileageChart />
			<CostChart />
		</div>
	</div>
</TabContainer>
