<script lang="ts">
  import Gauge from '@lucide/svelte/icons/gauge';
  import IdCard from '@lucide/svelte/icons/id-card';
  import Badge from '$ui/badge/badge.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import { formatDistance } from '$lib/helper/format.helper';
  import { getVehicleTypeIcon, getVehicleTypeLabel } from '$lib/domain/vehicle';
  import type { Vehicle } from '$lib/domain/vehicle';
  import * as m from '$lib/paraglide/messages';
  import VehicleImage from './VehicleImage.svelte';

  interface Props {
    vehicle: Vehicle;
  }

  let { vehicle }: Props = $props();

  const VehicleTypeIcon = $derived(getVehicleTypeIcon(vehicle.vehicleType));
</script>

<VehicleImage
  image={vehicle.image}
  class="absolute inset-0 h-full w-full rounded-t-2xl object-cover"
/>
<div
  class="absolute inset-0 rounded-t-2xl bg-linear-to-t from-black/35 via-black/15 to-black/35"
></div>

<!-- relative (not absolute) keeps this in normal flex flow while still painting above the two absolute layers above -->
<div class="relative flex h-full flex-col justify-between p-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        title={getVehicleTypeLabel(vehicle.vehicleType, m)}
      >
        <VehicleTypeIcon class="size-5" />
      </div>
      <span class="text-2xl font-bold text-white drop-shadow-lg">
        {vehicle.make}
        {vehicle.model}
      </span>
    </div>
    <p class="flex items-center gap-2">
      {#if vehicle.color}
        <Badge
          class="m-1 h-5 w-8 border border-white/40"
          style={`background-color: ${vehicle.color}`}
        />
      {/if}
    </p>
  </div>

  <div class="flex flex-row justify-between text-sm font-medium text-white/90">
    <LabelWithIcon
      icon={IdCard}
      iconClass="h-5 w-5"
      style="mono flex items-center gap-2 drop-shadow-md"
      label={vehicle.vin ? vehicle.vin : '-'}
    />
    <LabelWithIcon
      icon={Gauge}
      iconClass="h-5 w-5"
      style="mono flex items-center gap-2 drop-shadow-md"
      label={vehicle.odometer ? formatDistance(vehicle.odometer) : '-'}
    />
  </div>
</div>
