<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import VehicleCard from './VehicleCard.svelte';
	export let vehicles: Array<any> = [];
	export let selectedVehicleId: number | null = null;

	const dispatch = createEventDispatcher();

	function selectVehicle(vehicleId: number) {
		dispatch('vehicleSelect', { vehicleId });
	}

	function addVehicle() {
		dispatch('addVehicle');
	}
</script>

<div
	class="grid grid-cols-1 gap-6 bg-gray-100 transition-colors sm:grid-cols-2 lg:grid-cols-3 dark:bg-gray-900"
>
	{#each vehicles as vehicle (vehicle.id)}
		<div
			tabindex="0"
			role="button"
			onclick={() => selectVehicle(vehicle.id)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') selectVehicle(vehicle.id);
			}}
			class:ring-2={selectedVehicleId === vehicle.id}
			class:ring-blue-500={selectedVehicleId === vehicle.id}
			class="cursor-pointer rounded-2xl transition-all duration-300 ease-in-out"
		>
			<VehicleCard
				{vehicle}
				on:editVehicle={(e) => dispatch('editVehicle', e.detail)}
				on:deleteVehicle={(e) => dispatch('deleteVehicle', e.detail)}
				on:refillFuel={(e) => dispatch('refillFuel', e.detail)}
				on:addMaintenance={(e) => dispatch('addMaintenance', e.detail)}
			/>
		</div>
	{/each}
</div>
