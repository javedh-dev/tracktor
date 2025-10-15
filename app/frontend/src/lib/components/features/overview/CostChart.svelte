<script lang="ts">
	import { formatCurrency, getCurrencySymbol } from '$lib/helper/format.helper';
	import type { DataPoint } from '$lib/domain';
	import AreaChart from './AreaChart.svelte';
	import { chartDataStore } from '$lib/stores/chartDataStore';

	let chartData: DataPoint[] = $state([]);

	chartDataStore.subscribe((data) => {
		chartData = data.costData || [];
	});
</script>

<AreaChart
	{chartData}
	label="Cost"
	title={`Cost over Time in (${getCurrencySymbol()})`}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
	yFormatter={(v: number) => formatCurrency(v)}
/>
