<script lang="ts">
	import { vehiclesStore } from '$stores/vehicle';
	import VehicleCard from './VehicleCard.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let { vehicles, selectedVehicleId, updateCallback } = $props();

	function selectVehicle(vehicleId: string) {
		vehiclesStore.selectVehicle(vehicleId);
	}
</script>

{#if vehicles.length > 0}
	<ScrollArea class="w-full whitespace-nowrap" orientation="horizontal">
		<div class="m-4 flex gap-4">
			{#each vehicles as vehicle (vehicle.id)}
				<div
					tabindex="0"
					role="button"
					onclick={() => selectVehicle(vehicle.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') selectVehicle(vehicle.id);
					}}
				>
					<VehicleCard {vehicle} {updateCallback} isSelected={selectedVehicleId === vehicle.id} />
				</div>
			{/each}
		</div>
	</ScrollArea>
{:else}
	<!-- <div class="flex items-center justify-center"> -->
	<div class="flex min-h-48 items-center justify-center gap-10 bg-gray-100 dark:bg-gray-900">
		<p class="text-lg text-gray-600 dark:text-gray-100">
			No vehicles found. Add your first vehicle to begin.
		</p>
	</div>
	<!-- </div> -->
{/if}
