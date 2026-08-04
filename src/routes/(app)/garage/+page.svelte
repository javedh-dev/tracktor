<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import VehicleCard from '$feature/vehicle/VehicleCard.svelte';
  import CardGridSkeleton from '$appui/CardGridSkeleton.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { goto } from '$app/navigation';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import { app_add_vehicle, vehicle_list_empty } from '$lib/paraglide/messages/_index.js';
</script>

<div class="space-y-6">
  <PageHeader title="Vehicles" description="Manage your fleet" />

  {#if vehicleStore.processing}
    <CardGridSkeleton
      containerId="vehicles-grid-skeleton"
      containerClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    />
  {:else if vehicleStore.vehicles && vehicleStore.vehicles.length > 0}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each vehicleStore.vehicles as vehicle (vehicle.id)}
        <VehicleCard
          {vehicle}
          onclick={() => {
            if (vehicle.id) goto(`/garage/${vehicle.id}`);
          }}
          onkeydown={() => {}}
        />
      {/each}
      <button
        class="text-muted-foreground hover:text-foreground hover:bg-secondary/50 flex min-h-[200px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-transparent transition-colors"
        onclick={() => sheetStore.openSheet(VehicleForm, app_add_vehicle())}
      >
        <LabelWithIcon icon={CirclePlus} label={app_add_vehicle()} />
      </button>
    </div>
  {:else}
    <button
      class="text-muted-foreground hover:text-foreground hover:bg-secondary/50 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-transparent transition-colors"
      onclick={() => sheetStore.openSheet(VehicleForm, app_add_vehicle())}
    >
      <p class="text-lg font-medium">{vehicle_list_empty()}</p>
      <LabelWithIcon icon={CirclePlus} label={app_add_vehicle()} />
    </button>
  {/if}
</div>
