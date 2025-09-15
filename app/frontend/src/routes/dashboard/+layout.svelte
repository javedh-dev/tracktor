<script lang="ts">
	import FuelForm from '$lib/components/features/fuel/FuelForm.svelte';
	import MaintenanceForm from '$lib/components/features/maintenance/MaintenanceForm.svelte';
	import VehicleForm from '$lib/components/features/vehicle/VehicleForm.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<Header />
<main>
	{@render children()}
</main>

<VehicleForm />
<FuelForm />
<MaintenanceForm />
