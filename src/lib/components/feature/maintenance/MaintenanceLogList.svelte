<script lang="ts">
  import { formatTableText } from '$helper/table-cell.helper';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import CircleGauge from '@lucide/svelte/icons/circle-gauge';
  import Notebook from '@lucide/svelte/icons/notebook';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import TableSkeleton from '$appui/TableSkeleton.svelte';
  import AppTable from '$layout/AppTable.svelte';
  import type { ColumnDef } from '@tanstack/table-core';
  import { renderComponent, renderSnippet } from '$ui/data-table';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import MaintenanceContextMenu from './MaintenanceContextMenu.svelte';
  import type { MaintenanceLog } from '$lib/domain/maintenance';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import DateCell from '$lib/components/feature/shared/DateCell.svelte';
  import OdometerCell from '$lib/components/feature/shared/OdometerCell.svelte';
  import CostCell from '$lib/components/feature/shared/CostCell.svelte';
  import NotesCell from '$lib/components/feature/shared/NotesCell.svelte';
  import AttachmentCell from '$lib/components/feature/shared/AttachmentCell.svelte';
  import * as m from '$lib/paraglide/messages';

  let lastVehicleId: string | undefined;

  const columns: ColumnDef<MaintenanceLog>[] = [
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
            maintenanceStore.refreshMaintenanceLogs();
          }
        })
    }
  ];

  $effect(() => {
    const vehicleId = vehicleStore.selectedId;
    if (vehicleId && vehicleId !== lastVehicleId) {
      lastVehicleId = vehicleId;
      maintenanceStore.refreshMaintenanceLogs();
    }
    if (!vehicleId) {
      lastVehicleId = undefined;
    }
  });
</script>

<StoreResourceState
  processing={maintenanceStore.processing}
  error={maintenanceStore.error}
  data={maintenanceStore.maintenanceLogs}
  emptyMessage={m.maintenance_list_empty()}
>
  {#snippet skeleton()}
    <TableSkeleton containerId="maintenance-log-list-skeleton" />
  {/snippet}
  <div id="maintenance-log-table" class="maintenance-log-table">
    <AppTable data={maintenanceStore.maintenanceLogs || []} {columns} />
  </div>
</StoreResourceState>

{#snippet serviceCenterCell({ value }: { value: string | null })}
  <div class="flex flex-row justify-start">{formatTableText(value)}</div>
{/snippet}
