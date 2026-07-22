<script lang="ts">
  import CardGridSkeleton from '$appui/CardGridSkeleton.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import VehicleCard from './VehicleCard.svelte';
  import { ScrollArea } from '$ui/scroll-area';
  import * as m from '$lib/paraglide/messages';

  const selectVehicle = (vehicleId: string | null) => {
    if (vehicleId) {
      vehicleStore.selectedId = vehicleId;
    }
  };
</script>

<StoreResourceState
  processing={vehicleStore.processing}
  error={vehicleStore.error}
  data={vehicleStore.vehicles}
  emptyMessage={m.vehicle_list_empty()}
>
  {#snippet skeleton()}
    <CardGridSkeleton
      containerId="vehicle-list-skeleton"
      containerClass="vehicle-list-loading my-4 flex gap-4 overflow-hidden"
    />
  {/snippet}
  <ScrollArea
    id="vehicle-list-container"
    class="vehicle-list w-full whitespace-nowrap"
    orientation="horizontal"
  >
    <div class="my-4 flex gap-4 rtl:flex-row-reverse">
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
</StoreResourceState>
