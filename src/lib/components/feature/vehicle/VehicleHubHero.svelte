<script lang="ts">
  import { withBase } from '$lib/utils';
  import { goto } from '$app/navigation';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Gauge from '@lucide/svelte/icons/gauge';
  import Rabbit from '@lucide/svelte/icons/rabbit';
  import LicensePlate from '$appui/LicensePlate.svelte';
  import Badge from '$ui/badge/badge.svelte';
  import Button from '$ui/button/button.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { deleteVehicle } from '$lib/services/vehicle.service';
  import { toast } from 'svelte-sonner';
  import { getFuelTypeLabel } from '$lib/domain/vehicle';
  import { formatDistance, formatMileage } from '$lib/helper/format.helper';
  import VehicleForm from './VehicleForm.svelte';
  import type { Vehicle } from '$lib/domain';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    vehicle: Vehicle & { currentOdometer?: number | null; overallMileage?: number | null };
  }

  let { vehicle }: Props = $props();

  let deleteDialog = $state(false);

  const imageUrl = $derived(
    vehicle.image ? withBase(`/api/files/${vehicle.image}`) : '/default-vehicle.png'
  );

  const fuelLabel = $derived(getFuelTypeLabel(vehicle.fuelType ?? 'petrol', m));

  const performDelete = async () => {
    if (!vehicle.id) return;
    const res = await deleteVehicle(vehicle.id);
    if (res.status === 'OK') {
      vehicleStore.refreshVehicles();
      toast.success(m.vehicle_delete_success());
      goto('/vehicles');
    } else {
      toast.error(res.error || m.vehicle_delete_error());
    }
  };
</script>

<div id="vehicle-hub-hero" class="overflow-hidden rounded-2xl border">
  <div class="relative h-48 w-full sm:h-56">
    <img src={imageUrl} alt="" class="h-full w-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
    <div
      class="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6"
    >
      <div>
        <h1 class="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
          {vehicle.make}
          {vehicle.model}
        </h1>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{vehicle.year}</Badge>
          <Badge variant="secondary">{fuelLabel}</Badge>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          id="vehicle-hub-edit-btn"
          variant="secondary"
          size="sm"
          onclick={() =>
            sheetStore.openSheet(VehicleForm, m.vehicle_action_update_vehicle(), '', vehicle)}
        >
          <Pencil class="size-4" />
          {m.vehicle_action_edit()}
        </Button>
        <Button
          id="vehicle-hub-delete-btn"
          variant="destructive"
          size="sm"
          onclick={() => (deleteDialog = true)}
        >
          <Trash2 class="size-4" />
          {m.vehicle_action_delete()}
        </Button>
      </div>
    </div>
  </div>
  <div class="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
    <LicensePlate registrationNumber={vehicle.licensePlate} />
    <div class="flex flex-wrap items-center gap-6 text-sm">
      <div class="flex items-center gap-2">
        <Gauge class="text-muted-foreground size-4" />
        <span>
          {vehicle.currentOdometer ? formatDistance(vehicle.currentOdometer) : '--'}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Rabbit class="text-muted-foreground size-4" />
        <span>
          {vehicle.overallMileage ? formatMileage(vehicle.overallMileage, vehicle.fuelType) : '--'}
        </span>
      </div>
    </div>
  </div>
</div>

<DeleteConfirmation onConfirm={performDelete} bind:open={deleteDialog} />
