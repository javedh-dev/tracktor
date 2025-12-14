<script lang="ts">
	import { getMileageUnit } from '$lib/helper/format.helper';
	import { chartStore } from '$stores/chart.svelte';
	import AreaChart from './AreaChart.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';

	const selectedVehicle = $derived(
		vehicleStore.vehicles?.find((v) => v.id === vehicleStore.selectedId)
	);
</script>

<AreaChart
	chartData={chartStore.mileageData || []}
	label="Milage"
	title={`Mileage over Time in ( ${getMileageUnit(selectedVehicle?.fuelType as string)} )`}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
/>
