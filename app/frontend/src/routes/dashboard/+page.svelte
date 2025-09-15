<script lang="ts">
	import VehicleList from '$feature/vehicle/VehicleList.svelte';
	import { vehicleModelStore, vehiclesStore } from '$stores/vehicle';
	import Button from '$lib/components/ui/button/button.svelte';
	import DashboardTabs from '$lib/components/layout/DashboardTabs.svelte';
	import { onMount } from 'svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import { CirclePlus } from '@lucide/svelte';

	let selectedVehicleId = $state<string | undefined>();

	const updateCallback = (success: boolean) => success && fetchVehicles();

	const fetchVehicles = () => {
		const pin = localStorage.getItem('userPin') || undefined;
		if (pin) vehiclesStore.fetchVehicles(pin);
	};

	onMount(() => fetchVehicles());
</script>

<div class="mx-auto p-6 lg:container">
	<div class="mb-2 flex items-center justify-between">
		<h1 class="text-3xl font-semibold text-gray-900 dark:text-gray-100">Your Garage</h1>
		<Button
			variant="outline"
			size="lg"
			class="cursor-pointer"
			onclick={() => vehicleModelStore.show()}
		>
			<LabelWithIcon icon={CirclePlus} label="Add Vehicle" />
		</Button>
	</div>

	<VehicleList bind:selectedVehicleId {updateCallback} />

	{#if selectedVehicleId}
		<DashboardTabs vehicleId={selectedVehicleId} />
	{:else}
		<div class="py-12 text-center">
			<p class="text-lg text-gray-500 dark:text-gray-400">
				Please select a vehicle from the list for more details
			</p>
		</div>
	{/if}
</div>
