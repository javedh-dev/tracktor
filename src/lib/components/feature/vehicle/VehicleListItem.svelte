<script lang="ts">
  import { withBase } from '$lib/utils';
  import * as DropdownMenu from '$ui/dropdown-menu/index.js';
  import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Gauge from '@lucide/svelte/icons/gauge';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import { deleteVehicle } from '$lib/services/vehicle.service';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import VehicleForm from './VehicleForm.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { Vehicle } from '$lib/domain';

  const {
    vehicle,
    onclick,
    isSelected = false,
    actions = true
  }: {
    vehicle: Vehicle;
    onclick: () => void;
    isSelected?: boolean;
    actions?: boolean;
  } = $props();

  let deleteDialog = $state(false);

  const imageUrl = $derived(
    vehicle.image ? withBase(`/api/files/${vehicle.image}`) : '/default-vehicle.png'
  );

  const performDelete = async (vehicleId: string) => {
    deleteVehicle(vehicleId).then((res) => {
      if (res.status == 'OK') {
        vehicleStore.refreshVehicles();
        toast.success(m.vehicle_delete_success());
      } else {
        toast.error(res.error || m.vehicle_delete_error());
      }
    });
  };
</script>

<div
  class={`hover:border-primary flex items-center gap-3 rounded-xl border-2 p-3 transition-colors ${isSelected ? 'border-primary/50' : 'border-transparent'}`}
>
  <button type="button" {onclick} class="flex min-w-0 flex-1 items-center gap-3 text-left">
    <img src={imageUrl} alt="" class="bg-secondary size-11 shrink-0 rounded-lg object-cover" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">{vehicle.make} {vehicle.model}</p>
      <p class="text-muted-foreground truncate text-xs">
        {vehicle.licensePlate ?? '--'}
      </p>
    </div>
  </button>

  {#if vehicle.odometer}
    <div class="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
      <Gauge class="size-3.5" />
      {vehicle.odometer.toLocaleString()} km
    </div>
  {/if}

  {#if actions}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="hover:bg-secondary flex size-8 shrink-0 items-center justify-center rounded-md"
        aria-label={m.vehicle_action_more_info()}
      >
        <EllipsisVertical class="text-muted-foreground size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item
          onclick={() =>
            sheetStore.openSheet(VehicleForm, m.vehicle_action_update_vehicle(), '', vehicle)}
        >
          <Pencil class="size-4" />
          {m.vehicle_action_edit()}
        </DropdownMenu.Item>
        <DropdownMenu.Item variant="destructive" onclick={() => (deleteDialog = true)}>
          <Trash2 class="size-4" />
          {m.vehicle_action_delete()}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}
</div>

{#if actions}
  <DeleteConfirmation onConfirm={() => performDelete(vehicle.id!)} bind:open={deleteDialog} />
{/if}
