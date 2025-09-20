<script lang="ts">
	import { formatMileage, getMileageUnit } from '$lib/helper/formatting';
	import { fetchMileageData } from '$lib/services/vehicle.service';
	import type { DataPoint } from '$lib/types';
	import AreaChart from './AreaChart.svelte';

	let { vehicleId } = $props();

	let chartData: DataPoint[] = $state([]);

	$effect(() => {
		if (vehicleId) {
			fetchMileageData(vehicleId).then((data) => (chartData = data));
		}
	});
</script>

<AreaChart
	{chartData}
	label="Milage"
	title={`Mileage over Time in ( ${getMileageUnit()} )`}
	xFormatter={(v: Date) => v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
	yFormatter={(v: number) => formatMileage(v)}
/>
