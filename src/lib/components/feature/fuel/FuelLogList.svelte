<script lang="ts">
  import { type FuelLog } from '$lib/domain/fuel';

  import Badge from '$ui/badge/badge.svelte';
  import Button from '$ui/button/button.svelte';
  import Input from '$appui/input.svelte';
  import * as DropdownMenu from '$ui/dropdown-menu';
  import {
    formatTableBoolean,
    formatTableFuelAmount,
    formatTableMileage
  } from '$helper/table-cell.helper';
  import { getColumnDisplayName } from '$helper/table.helper';
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
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import ImportIcon from '@lucide/svelte/icons/import';
  import Columns3 from '@lucide/svelte/icons/columns-3';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import SearchIcon from '@lucide/svelte/icons/search';
  import type { ColumnDef, Table } from '@tanstack/table-core';
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
  import * as m from '$lib/paraglide/messages';
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

  interface Props {
    addAction?: (() => void) | null;
    importAction?: (() => void) | null;
  }

  let { addAction = null, importAction = null }: Props = $props();

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

<div id="fuel-log-card" class="bg-card rounded-2xl border p-4 lg:p-6">
  <StoreResourceState
    processing={fuelLogStore.processing}
    error={fuelLogStore.error}
    data={fuelLogStore.fuelLogs}
    emptyMessage={fuel_empty_list()}
    actions={actionButtons}
  >
    {#snippet skeleton()}
      <TableSkeleton containerId="fuel-log-list-skeleton" />
    {/snippet}
    <AppTable data={fuelLogStore.fuelLogs || []} {columns}>
      {#snippet toolbar(table: Table<FuelLog>)}
        <div class="mb-4 flex flex-row flex-wrap items-center justify-between gap-2">
          <Input
            placeholder={m.common_search()}
            value={(table.getColumn('notes')?.getFilterValue() as string) ?? ''}
            oninput={(e) => table.getColumn('notes')?.setFilterValue(e.currentTarget.value)}
            onchange={(e) => {
              table.getColumn('notes')?.setFilterValue(e.currentTarget.value);
            }}
            icon={SearchIcon}
            class="bg-background/60 h-full max-w-sm"
          />
          <div class="flex flex-row items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                {#snippet child({ props })}
                  <Button variant="outline" size="sm" {...props}>
                    <Columns3 />
                    <span class="inline">{m.common_columns()}</span>
                    <ChevronDownIcon />
                  </Button>
                {/snippet}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                {#each table
                  .getAllColumns()
                  .filter((col: any) => typeof col.accessorFn !== 'undefined' && col.getCanHide()) as column (column.id)}
                  <DropdownMenu.CheckboxItem
                    class="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {getColumnDisplayName(column)}
                  </DropdownMenu.CheckboxItem>
                {/each}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            {@render actionButtons()}
          </div>
        </div>
      {/snippet}
    </AppTable>
  </StoreResourceState>
</div>

{#snippet actionButtons()}
  {#if importAction}
    <Button
      id="fuel-log-import-btn"
      variant="outline"
      size="icon-sm"
      class="cursor-pointer"
      onclick={importAction}
    >
      <ImportIcon class="h-4 w-4" />
    </Button>
  {/if}
  {#if addAction}
    <Button
      id="fuel-log-add-btn"
      variant="outline"
      size="sm"
      class="cursor-pointer"
      onclick={addAction}
    >
      <LabelWithIcon icon={CirclePlus} label={m.common_add_new()} />
    </Button>
  {/if}
{/snippet}

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
