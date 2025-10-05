<script lang="ts">
	import { formatMileage, getMileageUnit } from '$lib/helper/formatting';
	import { fuelLogStore } from '$lib/stores/fuelLogStore';
	import type { DataPoint } from '$lib/types';
	import AreaChart from './AreaChart.svelte';

	let chartData: DataPoint[] = $state([]);

	fuelLogStore.subscribe((data) => {
		chartData = data.mileageData || [];
	});
</script>

<AreaChart
	{chartData}
	label="Milage"
	title={`Mileage over Time in ( ${getMileageUnit()} )`}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
	yFormatter={(v: number) => formatMileage(v)}
/>
