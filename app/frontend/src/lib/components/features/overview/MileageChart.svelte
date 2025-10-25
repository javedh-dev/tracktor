<script lang="ts">
	import { formatMileage, getMileageUnit } from '$lib/helper/format.helper';
	import { chartStore } from '$lib/stores/chart.svelte';
	import AreaChart from './AreaChart.svelte';
</script>

<AreaChart
	chartData={chartStore.mileageData || []}
	label="Milage"
	title={`Mileage over Time in ( ${getMileageUnit()} )`}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
	yFormatter={(v: number) => formatMileage(v)}
/>
