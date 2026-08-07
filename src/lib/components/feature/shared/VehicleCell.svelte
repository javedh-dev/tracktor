<script lang="ts">
  import { vehicleStore } from '$stores/vehicle.svelte';
  import VehicleTypeBadge from '$feature/vehicle/VehicleTypeBadge.svelte';

  interface Props {
    vehicleId?: string | null;
    make?: string | null;
    model?: string | null;
    plate?: string | null;
  }

  let { vehicleId, make, model, plate }: Props = $props();

  const vehicle = $derived(vehicleStore.vehicles?.find((v) => v.id === vehicleId));
</script>

<div class="flex items-center gap-2">
  <VehicleTypeBadge vehicleType={vehicle?.vehicleType} color={vehicle?.color} class="size-8" />
  <div class="flex flex-col">
    <span class="font-medium">{make} {model}</span>
    {#if plate}
      <span class="text-muted-foreground text-xs">{plate}</span>
    {/if}
  </div>
</div>
