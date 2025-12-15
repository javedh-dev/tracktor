<script lang="ts">
	import { getCurrencySymbol } from '$lib/helper/format.helper';
	import { chartStore } from '$stores/chart.svelte';
	import { fuelLogStore } from '$stores/fuel-log.svelte';
	import AreaChart from './AreaChart.svelte';
</script>

<AreaChart
	chartData={chartStore.costData || []}
	label="Cost"
	title={`Cost over Time in (${getCurrencySymbol()})`}
	loading={fuelLogStore.processing}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
/>
