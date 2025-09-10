<script lang="ts">
	import { vehiclesStore } from '$stores/vehicle';
	import VehicleCard from '$appui/common/VehicleCard.svelte';

	let { vehicles, selectedVehicleId, updateCallback } = $props();

	function selectVehicle(vehicleId: string) {
		vehiclesStore.selectVehicle(vehicleId);
	}
</script>

{#if vehicles.length > 0}
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
				<VehicleCard {vehicle} {updateCallback} />
			</div>
		{/each}
	</div>
{:else}
	<!-- <div class="flex items-center justify-center"> -->
	<div class="flex min-h-48 items-center justify-center gap-10 bg-gray-100 dark:bg-gray-900">
		<p class="text-lg text-gray-600 dark:text-gray-100">
			No vehicles found. Add your first vehicle to begin.
		</p>
	</div>
	<!-- </div> -->
{/if}
