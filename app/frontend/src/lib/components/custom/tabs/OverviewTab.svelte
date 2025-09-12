<script lang="ts">
	import TabContainer from '$appui/common/TabContainer.svelte';
	import DashboardCharts from '$appui/chart/DashboardCharts.svelte';
	import MileageChart from '../chart/MileageChart.svelte';

	const { vehicleId } = $props();
</script>

<TabContainer title="Overview">
	<!-- <MileageChart {vehicleId} /> -->
	<DashboardCharts {vehicleId} />
</TabContainer>
