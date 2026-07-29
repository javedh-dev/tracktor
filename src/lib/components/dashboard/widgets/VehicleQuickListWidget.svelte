<script lang="ts">
  import VehicleListItem from '$feature/vehicle/VehicleListItem.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
</script>

{#if vehicleStore.vehicles && vehicleStore.vehicles.length > 0}
  <div class="h-full space-y-2 overflow-y-auto">
    {#each vehicleStore.vehicles.slice(0, 5) as vehicle (vehicle.id)}
      <VehicleListItem
        {vehicle}
        onclick={() => (vehicleStore.selectedId = vehicle.id!)}
        isSelected={vehicleStore.selectedId === vehicle.id}
        actions={false}
      />
    {/each}
  </div>
{:else}
  <div class="text-muted-foreground flex h-full items-center justify-center text-sm">
    No vehicles yet
  </div>
{/if}
