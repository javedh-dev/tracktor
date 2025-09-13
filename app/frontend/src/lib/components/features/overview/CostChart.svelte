<script lang="ts">
	import { formatCurrency, getCurrencySymbol } from '$helper/formatting';
	import { fetchCostData } from '$services/vehicle.service';
	import type { DataPoint } from '$lib/types';
	import AreaChart from './AreaChart.svelte';

	let { vehicleId } = $props();

	let chartData: DataPoint[] = $state([]);
	$effect(() => {
		if (vehicleId) {
			fetchCostData(vehicleId).then((data) => (chartData = data));
		}
	});
</script>

<AreaChart
	{chartData}
	color="#a1a1aa"
	label="Cost"
	title={`Cost over Time in (${getCurrencySymbol()})`}
	xFormatter={(v: Date) => v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
	yFormatter={(v: number) => formatCurrency(v)}
/>
