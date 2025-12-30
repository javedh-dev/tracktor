<script lang="ts">
	import { vehicleStore } from '$stores/vehicle.svelte';
	import VehicleCard from './VehicleCard.svelte';
	import { ScrollArea } from '$ui/scroll-area';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import * as m from '$lib/paraglide/messages';

	const selectVehicle = (vehicleId: string | null) => {
		if (vehicleId) {
			vehicleStore.selectedId = vehicleId;
		}
	};
</script>

{#if vehicleStore.processing}
	<div id="vehicle-list-skeleton" class="vehicle-list-loading my-4 flex gap-4 overflow-hidden">
		<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
		<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
		<Skeleton class="h-72 w-80 shrink-0 rounded-2xl" />
	</div>
{:else if vehicleStore.error}
	<LabelWithIcon
		icon={CircleAlert}
		iconClass="h-6 w-6"
		style="flex min-h-98 items-center justify-center gap-4 text-xl text-rose-500"
		label={vehicleStore.error}
	/>
{:else if vehicleStore.vehicles && vehicleStore.vehicles.length > 0}
	<ScrollArea
		id="vehicle-list-container"
		class="vehicle-list w-full whitespace-nowrap"
		orientation="horizontal"
	>
		<div class="my-4 flex gap-4">
			{#each vehicleStore.vehicles as vehicle (vehicle.id)}
				<VehicleCard
					{vehicle}
					isSelected={vehicleStore.selectedId === vehicle.id}
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
		label={m.vehicle_list_empty()}
	/>
{/if}
