<script lang="ts">
	import { formatCurrency, getCurrencySymbol } from '$helper/formatting';
	import type { DataPoint } from '$lib/types';
	import AreaChart from './AreaChart.svelte';
	import { fuelLogStore } from '$lib/stores/fuelLogStore';

	let chartData: DataPoint[] = $state([]);

	fuelLogStore.subscribe((data) => {
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
