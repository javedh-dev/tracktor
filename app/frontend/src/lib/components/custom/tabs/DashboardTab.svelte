<script lang="ts">
	import TabContainer from '$appui/common/TabContainer.svelte';
	import DashboardCharts from '$appui/chart/DashboardCharts.svelte';

	const { vehicleId } = $props();
</script>

<TabContainer title="Vehicle Trends">
	<DashboardCharts {vehicleId} />
</TabContainer>
