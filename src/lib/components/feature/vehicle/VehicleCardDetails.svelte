<script lang="ts">
  import LicensePlate from '$appui/LicensePlate.svelte';
  import Badge from '$ui/badge/badge.svelte';
  import { getFuelTypeLabel, type Vehicle } from '$lib/domain/vehicle';

  interface Props {
    vehicle: Vehicle;
    messages: typeof import('$lib/paraglide/messages');
  }

  let { vehicle, messages: m }: Props = $props();
</script>

<div class="flex items-center justify-between">
  <LicensePlate registrationNumber={vehicle.licensePlate} />
  <div class="flex gap-2">
    <Badge variant="secondary" class="text-xs"
      >{vehicle.fuelType
        ? getFuelTypeLabel(vehicle.fuelType, m)
        : getFuelTypeLabel('petrol', m)}</Badge
    >
    <Badge variant="outline" class="text-sm">{vehicle.year}</Badge>
  </div>
</div>
