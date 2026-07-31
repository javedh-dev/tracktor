<script lang="ts">
  import { type FuelLog } from '$lib/domain/fuel';

  import Badge from '$ui/badge/badge.svelte';
  import {
    formatTableBoolean,
    formatTableFuelAmount,
    formatTableMileage
  } from '$helper/table-cell.helper';
  import FuelLogContextMenu from './FuelLogContextMenu.svelte';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Rabbit from '@lucide/svelte/icons/rabbit';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import CircleGauge from '@lucide/svelte/icons/circle-gauge';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Notebook from '@lucide/svelte/icons/notebook';
  import PaintBucket from '@lucide/svelte/icons/paint-bucket';
  import SquircleDashed from '@lucide/svelte/icons/squircle-dashed';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import type { ColumnDef } from '@tanstack/table-core';
  import { renderComponent, renderSnippet } from '$ui/data-table';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import TableSkeleton from '$appui/TableSkeleton.svelte';
  import AppTable from '$layout/AppTable.svelte';
  import DateCell from '$lib/components/feature/shared/DateCell.svelte';
  import OdometerCell from '$lib/components/feature/shared/OdometerCell.svelte';
  import CostCell from '$lib/components/feature/shared/CostCell.svelte';
  import NotesCell from '$lib/components/feature/shared/NotesCell.svelte';
  import AttachmentCell from '$lib/components/feature/shared/AttachmentCell.svelte';
  import VehicleCell from '$lib/components/feature/shared/VehicleCell.svelte';
  import Car from '@lucide/svelte/icons/car';

  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import {
    col_date,
    col_odometer,
    col_filled,
    col_missed_last,
    col_cost,
    col_mileage,
    col_notes,
    col_attachment,
    col_vehicle,
    fuel_volume_label_energy,
    fuel_volume_label_fuel,
    fuel_empty_list,
    common_yes,
    common_no
  } from '$lib/paraglide/messages/_index.js';

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));
  const selectedVehicle = $derived(scope.vehicle);
  const volumeLabel = $derived(
    selectedVehicle?.fuelType === 'electric' ? fuel_volume_label_energy() : fuel_volume_label_fuel()
  );

  let lastScopeKey: string | undefined;

  const columns = $derived<ColumnDef<FuelLog>[]>([
    ...(scope.isFleet
      ? [
          {
            id: 'vehicle',
            header: () =>
              renderComponent(LabelWithIcon, {
                icon: Car,
                iconClass: 'h-4 w-4',
                label: col_vehicle(),
                style: 'justify-start'
              }),
            cell: ({ row }: { row: { original: FuelLog } }) =>
              renderComponent(VehicleCell, {
                make: row.original.vehicleMake,
                model: row.original.vehicleModel,
                plate: row.original.vehiclePlate
              })
          } satisfies ColumnDef<FuelLog>
        ]
      : []),
    {
      accessorKey: 'date',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Calendar1,
          iconClass: 'h-4 w-4',
          label: col_date(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderComponent(DateCell, { value: row.getValue('date') })
    },
    {
      accessorKey: 'odometer',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: CircleGauge,
          iconClass: 'h-4 w-4 ',
          label: col_odometer(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderComponent(OdometerCell, { value: row.getValue('odometer') })
    },
    {
      accessorKey: 'distanceDriven',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: CircleGauge,
          iconClass: 'h-4 w-4 ',
          label: col_odometer(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderComponent(OdometerCell, { value: row.getValue('distanceDriven') })
    },
    {
      accessorKey: 'filled',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Fuel,
          iconClass: 'h-4 w-4',
          label: col_filled(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderSnippet(badge, { value: row.getValue('filled') as boolean })
    },
    {
      accessorKey: 'missedLast',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: SquircleDashed,
          iconClass: 'h-4 w-4',
          label: col_missed_last(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderSnippet(badge, { value: row.getValue('missedLast') as boolean })
    },
    {
      accessorKey: 'fuelAmount',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: PaintBucket,
          iconClass: 'h-4 w-4 ',
          label: volumeLabel,
          style: 'justify-center'
        }),
      cell: ({ row }) =>
        renderSnippet(fuelAmountCell, {
          amount: row.getValue('fuelAmount') as number | null,
          fuelType: selectedVehicle?.fuelType
        })
    },
    {
      accessorKey: 'cost',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Banknote,
          iconClass: 'h-4 w-4 ',
          label: col_cost(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderComponent(CostCell, { value: row.getValue('cost') })
    },
    {
      accessorKey: 'mileage',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Rabbit,
          iconClass: 'h-4 w-4 ',
          label: col_mileage(),
          style: 'justify-center'
        }),
      cell: ({ row }) =>
        renderSnippet(mileageCell, {
          mileage: row.getValue('mileage') as number | null,
          fuelType: selectedVehicle?.fuelType
        })
    },
    {
      accessorKey: 'notes',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Notebook,
          iconClass: 'h-4 w-4',
          label: col_notes(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderComponent(NotesCell, { value: row.getValue('notes') })
    },
    {
      accessorKey: 'attachment',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Paperclip,
          iconClass: 'h-4 w-4',
          label: col_attachment(),
          style: 'justify-center'
        }),
      cell: ({ row }) =>
        renderComponent(AttachmentCell, { value: row.getValue('attachment') as string | null })
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        renderComponent(FuelLogContextMenu, {
          fuelLog: row.original,
          onaction: () => {
            fuelLogStore.reloadFuelLogs();
          }
        })
    }
  ]);

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      fuelLogStore.refreshFuelLogs(vehicleId);
    }
  });
</script>

<StoreResourceState
  processing={fuelLogStore.processing}
  error={fuelLogStore.error}
  data={fuelLogStore.fuelLogs}
  emptyMessage={fuel_empty_list()}
>
  {#snippet skeleton()}
    <TableSkeleton containerId="fuel-log-list-skeleton" />
  {/snippet}
  <AppTable data={fuelLogStore.fuelLogs || []} {columns} />
</StoreResourceState>

{#snippet badge({ value }: { value: boolean })}
  <div class="flex flex-row justify-center">
    <Badge variant="outline"
      ><span>{formatTableBoolean(value, common_yes(), common_no())}</span></Badge
    >
  </div>
{/snippet}

{#snippet fuelAmountCell({
  amount,
  fuelType
}: {
  amount: number | null;
  fuelType: string | undefined;
})}
  <div class="flex flex-row justify-center">
    {formatTableFuelAmount(amount, fuelType)}
  </div>
{/snippet}

{#snippet mileageCell({
  mileage,
  fuelType
}: {
  mileage: number | null;
  fuelType: string | undefined;
})}
  <div class="flex flex-row justify-center">
    {formatTableMileage(mileage, fuelType)}
  </div>
{/snippet}
