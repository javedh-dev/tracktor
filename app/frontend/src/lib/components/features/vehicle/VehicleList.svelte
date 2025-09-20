<script lang="ts">
	import { vehiclesStore } from '$stores/vehicle';
	import VehicleCard from './VehicleCard.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import type { Vehicle } from '$lib/types/vehicle';
	import { Jumper } from 'svelte-loading-spinners';

	let { selectedVehicleId = $bindable(), updateCallback } = $props();
	let vehicles = $state<Vehicle[]>([]);
	let loading = $state(true);
	let error = $state('');

	vehiclesStore.subscribe((data) => {
		vehicles = data.vehicles;
		loading = data.loading;
		error = data.error;
		selectedVehicleId = data.selectedVehicleId;
		if (vehicles.length > 0) {
			selectedVehicleId = selectedVehicleId || vehicles[0].id;
		} else {
			selectedVehicleId = undefined;
		}
	});

	const selectVehicle = (vehicleId: string | null) => {
		if (vehicleId) {
			vehiclesStore.selectVehicle(vehicleId);
		}
	};
</script>

{#if loading}
	<div class="flex items-center justify-center">
		<Jumper size="64" color="var(--primary)" duration="2s" />
	</div>
{:else if error}
	<LabelWithIcon
		icon={CircleAlert}
		iconClass="h-6 w-6"
		style="flex min-h-98 items-center justify-center gap-4 text-xl text-rose-500"
		label={error}
	/>
{:else if vehicles.length > 0}
	<ScrollArea class="w-full whitespace-nowrap" orientation="horizontal">
		<div class="my-4 flex gap-4">
			{#each vehicles as vehicle (vehicle.id)}
				<VehicleCard
					{vehicle}
					{updateCallback}
					isSelected={selectedVehicleId === vehicle.id}
					onclick={() => selectVehicle(vehicle.id)}
					onkeydown={(e: { key: string }) => {
						if (e.key === 'Enter' || e.key === ' ') selectVehicle(vehicle.id);
					}}
				/>
			{/each}
		</div>
	</ScrollArea>
{:else}
	<LabelWithIcon
		icon={CircleSlash2}
		iconClass="h-6 w-6"
		style="flex min-h-98 items-center justify-center gap-4 text-xl"
		label="It's empty here. Please add your first vehicle to begin."
	/>
{/if}
