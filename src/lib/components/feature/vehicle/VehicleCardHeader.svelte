<script lang="ts">
  import Gauge from '@lucide/svelte/icons/gauge';
  import IdCard from '@lucide/svelte/icons/id-card';
  import Badge from '$ui/badge/badge.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import { formatDistance } from '$lib/helper/format.helper';
  import type { Vehicle } from '$lib/domain/vehicle';

  interface Props {
    vehicle: Vehicle;
    imageUrl: string;
  }

  let { vehicle, imageUrl }: Props = $props();
</script>

<div class="w-full">
  {#if imageUrl}
    <img src={imageUrl} alt="car" class="rounded-t-xl object-center opacity-30" />
  {/if}
</div>
<div class="absolute inset-0 flex flex-col justify-between border-b p-4">
  <div class="flex flex-col">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-primary text-2xl font-bold">{vehicle.make} {vehicle.model}</span>
      </div>
      <p class="flex items-center gap-2">
        {#if vehicle.color}
          <Badge class="m-1 h-5 w-8" style={`background-color: ${vehicle.color}`} />
        {/if}
      </p>
    </div>
    <div class="mt-2 flex flex-row justify-between text-sm font-medium">
      <LabelWithIcon
        icon={IdCard}
        iconClass="h-5 w-5"
        style="mono text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
        label={vehicle.vin ? vehicle.vin : '-'}
      />
      <LabelWithIcon
        icon={Gauge}
        iconClass="h-5 w-5"
        style="mono text-foreground flex items-center gap-2"
        label={vehicle.odometer ? formatDistance(vehicle.odometer) : '-'}
      />
    </div>
  </div>

  <div class="flex flex-row justify-end"></div>
</div>
