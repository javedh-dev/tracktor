<script lang="ts">
  import CardGridSkeleton from '$appui/CardGridSkeleton.svelte';
  import ResourceState from '$appui/ResourceState.svelte';
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

{#if vehicleStore.processing}
  <CardGridSkeleton
    containerId="vehicle-list-skeleton"
    containerClass="vehicle-list-loading my-4 flex gap-4 overflow-hidden"
  />
{:else if vehicleStore.error}
  <ResourceState state="error" message={vehicleStore.error} />
{:else if vehicleStore.vehicles && vehicleStore.vehicles.length > 0}
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
{:else}
  <ResourceState state="empty" message={m.vehicle_list_empty()} />
{/if}
