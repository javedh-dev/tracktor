<script lang="ts">
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import VehicleCard from './VehicleCard.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import LabelWithIcon from '$lib/components/app/LabelWithIcon.svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import { Jumper } from 'svelte-loading-spinners';

	let { selectedVehicleId = $bindable() } = $props();

	$effect(() => {
		if (vehicleStore.vehicles && vehicleStore.vehicles.length > 0) {
			selectedVehicleId = selectedVehicleId || vehicleStore.vehicles[0].id;
		} else {
			selectedVehicleId = undefined;
		}
	});

	const selectVehicle = (vehicleId: string | null) => {
		if (vehicleId) {
			selectedVehicleId = vehicleId;
		}
	};
</script>

{#if vehicleStore.processing}
	<div class="flex items-center justify-center">
		<Jumper size="64" color="var(--primary)" duration="2s" />
	</div>
{:else if vehicleStore.error}
	<LabelWithIcon
		icon={CircleAlert}
		iconClass="h-6 w-6"
		style="flex min-h-98 items-center justify-center gap-4 text-xl text-rose-500"
		label={vehicleStore.error}
	/>
{:else if vehicleStore.vehicles && vehicleStore.vehicles.length > 0}
	<ScrollArea class="w-full whitespace-nowrap" orientation="horizontal">
		<div class="my-4 flex gap-4">
			{#each vehicleStore.vehicles as vehicle (vehicle.id)}
				<VehicleCard
					{vehicle}
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
