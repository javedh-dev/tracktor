<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import CostChart from './CostChart.svelte';
	import MileageChart from './MileageChart.svelte';
	import { fuelLogStore } from '$stores/fuel-log.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { nav_overview } from '$lib/paraglide/messages/_index.js';

	$effect(() => {
		if (!vehicleStore.selectedId) return;
		fuelLogStore.refreshFuelLogs();
	});
</script>

<TabContainer title={nav_overview()}>
	<div id="overview-charts-container" class="overview-charts overflow-x-auto">
		<div class="space-y-6">
			<!-- Charts Section -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<MileageChart />
				<CostChart />
			</div>
		</div>
	</div>
</TabContainer>
