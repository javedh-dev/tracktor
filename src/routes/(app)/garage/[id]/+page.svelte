<script lang="ts">
  import { goto } from '$app/navigation';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Pencil from '@lucide/svelte/icons/pencil';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Button from '$ui/button/button.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import VehicleHubHero from '$feature/vehicle/VehicleHubHero.svelte';
  import VehicleHubDetails from '$feature/vehicle/VehicleHubDetails.svelte';
  import VehicleHubActivity from '$feature/vehicle/VehicleHubActivity.svelte';
  import VehicleHubFeatureLinks from '$feature/vehicle/VehicleHubFeatureLinks.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { deleteVehicle } from '$lib/services/vehicle.service';
  import { toast } from 'svelte-sonner';
  import * as m from '$lib/paraglide/messages';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const vehicle = $derived(data.vehicle);

  let deleteDialog = $state(false);

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

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      onclick={() => goto('/garage')}
    >
      <ArrowLeft class="size-4" />
      {m.vehicle_hub_back_to_vehicles()}
    </button>

    <div class="flex items-center gap-2">
      <Button
        id="vehicle-hub-edit-btn"
        variant="outline"
        onclick={() =>
          sheetStore.openSheet(VehicleForm, m.vehicle_action_update_vehicle(), '', vehicle)}
      >
        <Pencil class="size-4" />
        {m.vehicle_action_edit()}
      </Button>
      <Button
        id="vehicle-hub-delete-btn"
        variant="destructive"
        onclick={() => (deleteDialog = true)}
      >
        <Trash2 class="size-4" />
        {m.vehicle_action_delete()}
      </Button>
    </div>
  </div>

  <VehicleHubHero {vehicle} />

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <VehicleHubDetails {vehicle} />
      <VehicleHubActivity {vehicle} />
    </div>

    <VehicleHubFeatureLinks {vehicle} />
  </div>
</div>

<DeleteConfirmation onConfirm={performDelete} bind:open={deleteDialog} />
