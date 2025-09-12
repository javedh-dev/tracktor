<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import DashboardCharts from './DashboardCharts.svelte';

	const { vehicleId } = $props();
</script>

<TabContainer title="Overview">
	<!-- <MileageChart {vehicleId} /> -->
	<DashboardCharts {vehicleId} />
</TabContainer>
