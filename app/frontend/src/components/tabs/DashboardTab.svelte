<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import TabContainer from '$components/common/TabContainer.svelte';
	import DashboardCharts from '$components/chart/DashboardCharts.svelte';

	const { vehicleId } = $props();
</script>

<TabContainer title={$t('dashboard.vehicleTrends')}>
	<DashboardCharts {vehicleId} />
</TabContainer>
