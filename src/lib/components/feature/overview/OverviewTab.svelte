<script lang="ts">
	import TabContainer from '$appui/TabContainer.svelte';
	import CostChart from './CostChart.svelte';
	import MileageChart from './MileageChart.svelte';
	import AlertsSection from './AlertsSection.svelte';
</script>

<TabContainer title="Overview">
	<div class="overflow-x-auto">
		<div class="space-y-6">
			<!-- Alerts Section -->
			<AlertsSection />

			<!-- Charts Section -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<MileageChart />
				<CostChart />
			</div>
		</div>
	</div>
</TabContainer>
