<script lang="ts">
  import Pencil from '@lucide/svelte/icons/pencil';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import IconButton from '$appui/IconButton.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import * as Card from '$ui/card';
  import { deleteVehicle } from '$lib/services/vehicle.service';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import * as m from '$lib/paraglide/messages';
  import FuelLogForm from '../fuel/FuelLogForm.svelte';
  import MaintenanceForm from '../maintenance/MaintenanceForm.svelte';
  import ComplianceForm from '../compliance/ComplianceForm.svelte';
  import VehicleForm from './VehicleForm.svelte';
  import ReminderForm from '../reminder/ReminderForm.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import VehicleCardDetails from './VehicleCardDetails.svelte';
  import VehicleCardHeader from './VehicleCardHeader.svelte';
  import VehicleQuickActions from './VehicleQuickActions.svelte';

  const { vehicle, onclick, onkeydown } = $props();
  let deleteDialog = $state(false);

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

  const quickActions = [
    {
      id: 'vehicle-card-fuel-btn',
      feature: Features.FUEL_LOG,
      buttonStyles: 'hover:bg-green-100 dark:hover:bg-green-700',
      iconStyles:
        'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-200',
      icon: Fuel,
      onclick: () => sheetStore.openSheet(FuelLogForm, m.vehicle_action_add_fuel_log(), ''),
      ariaLabel: m.vehicle_action_add_fuel_log()
    },
    {
      id: 'vehicle-card-maintenance-btn',
      feature: Features.MAINTENANCE,
      buttonStyles: 'hover:bg-amber-100 dark:hover:bg-amber-700',
      iconStyles:
        'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-200',
      icon: Wrench,
      onclick: () =>
        sheetStore.openSheet(MaintenanceForm, m.vehicle_action_add_maintenance_log(), ''),
      ariaLabel: m.vehicle_action_add_maintenance_log()
    },
    {
      id: 'vehicle-card-compliance-btn',
      feature: Features.COMPLIANCE,
      buttonStyles: 'hover:bg-sky-100 dark:hover:bg-sky-700',
      iconStyles: 'text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-200',
      icon: Shield,
      onclick: () => sheetStore.openSheet(ComplianceForm, m.vehicle_action_add_compliance(), ''),
      ariaLabel: m.vehicle_action_add_compliance()
    },
    {
      id: 'vehicle-card-reminder-btn',
      feature: Features.REMINDERS,
      buttonStyles: 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      iconStyles:
        'text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200',
      icon: BellRing,
      onclick: () => sheetStore.openSheet(ReminderForm, m.vehicle_action_add_reminder(), ''),
      ariaLabel: m.vehicle_action_add_reminder()
    }
  ];
</script>

<div
  id="vehicle-card-{vehicle.id}"
  class="vehicle-card"
  tabindex="0"
  role="button"
  {onclick}
  {onkeydown}
>
  <Card.Root
    class="hover:border-primary h-full w-xs cursor-pointer gap-2 rounded-2xl border-2 border-transparent p-0 pb-4 transition-all duration-300 ease-in-out lg:w-sm"
  >
    <Card.Header class="relative block h-38 overflow-hidden p-0">
      <VehicleCardHeader {vehicle} />
    </Card.Header>
    <Card.Content class="px-4">
      <VehicleCardDetails {vehicle} messages={m} />
    </Card.Content>
    <Card.Footer id="vehicle-card-actions" class="px-3" onclick={(e) => e.stopPropagation()}>
      <div id="vehicle-card-action-row" class="flex w-full justify-between">
        <VehicleQuickActions actions={quickActions} />
        <div id="vehicle-card-secondary-actions" class="flex justify-end gap-2">
          <IconButton
            id="vehicle-card-edit-btn"
            buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
            iconStyles="text-gray-600 dark:text-gray-100 hover:text-sky-500"
            icon={Pencil}
            onclick={() => {
              sheetStore.openSheet(VehicleForm, m.vehicle_action_update_vehicle(), '', vehicle);
            }}
            ariaLabel={m.vehicle_action_edit()}
          />
          <IconButton
            id="vehicle-card-delete-btn"
            buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
            iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
            icon={Trash2}
            onclick={() => (deleteDialog = true)}
            ariaLabel={m.vehicle_action_delete()}
          />
        </div>
      </div>
    </Card.Footer>
  </Card.Root>
</div>
<DeleteConfirmation onConfirm={() => performDelete(vehicle.id)} bind:open={deleteDialog} />
