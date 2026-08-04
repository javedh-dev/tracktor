<script lang="ts">
  import { formatTableText } from '$helper/table-cell.helper';
  import { getColumnDisplayName } from '$helper/table.helper';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import CircleGauge from '@lucide/svelte/icons/circle-gauge';
  import Notebook from '@lucide/svelte/icons/notebook';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import FileDown from '@lucide/svelte/icons/file-down';
  import Columns3 from '@lucide/svelte/icons/columns-3';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import SearchIcon from '@lucide/svelte/icons/search';
  import TableSkeleton from '$appui/TableSkeleton.svelte';
  import AppTable from '$layout/AppTable.svelte';
  import Button from '$ui/button/button.svelte';
  import Input from '$appui/input.svelte';
  import * as DropdownMenu from '$ui/dropdown-menu';
  import type { ColumnDef, Table } from '@tanstack/table-core';
  import { renderComponent, renderSnippet } from '$ui/data-table';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import MaintenanceContextMenu from './MaintenanceContextMenu.svelte';
  import type { MaintenanceLog } from '$lib/domain/maintenance';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import DateCell from '$lib/components/feature/shared/DateCell.svelte';
  import OdometerCell from '$lib/components/feature/shared/OdometerCell.svelte';
  import CostCell from '$lib/components/feature/shared/CostCell.svelte';
  import NotesCell from '$lib/components/feature/shared/NotesCell.svelte';
  import AttachmentCell from '$lib/components/feature/shared/AttachmentCell.svelte';
  import VehicleCell from '$lib/components/feature/shared/VehicleCell.svelte';
  import Car from '@lucide/svelte/icons/car';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    addAction?: (() => void) | null;
    exportAction?: (() => void) | null;
  }

  let { addAction = null, exportAction = null }: Props = $props();

  let lastScopeKey: string | undefined;
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const columns = $derived<ColumnDef<MaintenanceLog>[]>([
    ...(scope.isFleet
      ? [
          {
            id: 'vehicle',
            header: () =>
              renderComponent(LabelWithIcon, {
                icon: Car,
                iconClass: 'h-4 w-4',
                label: m.col_vehicle(),
                style: 'justify-start'
              }),
            cell: ({ row }: { row: { original: MaintenanceLog } }) =>
              renderComponent(VehicleCell, {
                make: row.original.vehicleMake,
                model: row.original.vehicleModel,
                plate: row.original.vehiclePlate
              })
          } satisfies ColumnDef<MaintenanceLog>
        ]
      : []),
    {
      accessorKey: 'date',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Calendar1,
          iconClass: 'h-4 w-4',
          label: m.col_date(),
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
          label: m.col_odometer(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderComponent(OdometerCell, { value: row.getValue('odometer') })
    },
    {
      accessorKey: 'serviceCenter',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Wrench,
          iconClass: 'h-4 w-4',
          label: m.maintenance_col_service_center(),
          style: 'justify-start'
        }),
      cell: ({ row }) =>
        renderSnippet(serviceCenterCell, { value: row.getValue('serviceCenter') as string | null })
    },
    {
      accessorKey: 'cost',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Banknote,
          iconClass: 'h-4 w-4 ',
          label: m.col_cost(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderComponent(CostCell, { value: row.getValue('cost') })
    },
    {
      accessorKey: 'notes',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Notebook,
          iconClass: 'h-4 w-4',
          label: m.col_notes(),
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
          label: m.col_attachment(),
          style: 'justify-center'
        }),
      cell: ({ row }) =>
        renderComponent(AttachmentCell, { value: row.getValue('attachment') as string | null })
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        renderComponent(MaintenanceContextMenu, {
          maintenanceLog: row.original,
          onaction: () => {
            maintenanceStore.reloadMaintenanceLogs();
          }
        })
    }
  ]);

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      maintenanceStore.refreshMaintenanceLogs(vehicleId);
    }
  });
</script>

<div id="maintenance-log-card" class="bg-card rounded-2xl border p-4 lg:p-6">
  <StoreResourceState
    processing={maintenanceStore.processing}
    error={maintenanceStore.error}
    data={maintenanceStore.maintenanceLogs}
    emptyMessage={m.maintenance_list_empty()}
    actions={actionButtons}
  >
    {#snippet skeleton()}
      <TableSkeleton containerId="maintenance-log-list-skeleton" />
    {/snippet}
    <AppTable data={maintenanceStore.maintenanceLogs || []} {columns}>
      {#snippet toolbar(table: Table<MaintenanceLog>)}
        <div class="mb-4 flex flex-row flex-wrap items-center justify-between gap-2">
          <Input
            placeholder={m.common_search()}
            value={(table.getColumn('serviceCenter')?.getFilterValue() as string) ?? ''}
            oninput={(e) => table.getColumn('serviceCenter')?.setFilterValue(e.currentTarget.value)}
            onchange={(e) => {
              table.getColumn('serviceCenter')?.setFilterValue(e.currentTarget.value);
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
  {#if exportAction}
    <Button
      id="maintenance-log-export-btn"
      variant="outline"
      size="icon-sm"
      class="cursor-pointer"
      onclick={exportAction}
    >
      <FileDown class="h-4 w-4" />
    </Button>
  {/if}
  {#if addAction}
    <Button
      id="maintenance-log-add-btn"
      variant="outline"
      size="sm"
      class="cursor-pointer"
      onclick={addAction}
    >
      <LabelWithIcon icon={CirclePlus} label={m.common_add_new()} />
    </Button>
  {/if}
{/snippet}

{#snippet serviceCenterCell({ value }: { value: string | null })}
  <div class="flex flex-row justify-start">{formatTableText(value)}</div>
{/snippet}
