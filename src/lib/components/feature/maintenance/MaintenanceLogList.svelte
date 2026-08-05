<script lang="ts">
  import { endOfDay } from 'date-fns';
  import {
    formatTableText,
    formatTableCurrency,
    formatTableDate,
    formatTableDistance
  } from '$helper/table-cell.helper';
  import { parseDate } from '$helper/format.helper';
  import { downloadCsv } from '$helper/csv-export.helper';
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
  import TableDetailPanel from '$layout/TableDetailPanel.svelte';
  import DetailFieldList from '$layout/DetailFieldList.svelte';
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
  import AttachmentPreview from '$lib/components/app/AttachmentPreview.svelte';
  import Car from '@lucide/svelte/icons/car';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    addAction?: (() => void) | null;
    exportAction?: (() => void) | null;
    /** Optional predicate to narrow what's rendered (e.g. page-level filters). */
    filter?: (log: MaintenanceLog) => boolean;
  }

  let { addAction = null, exportAction = null, filter }: Props = $props();

  let dateFrom = $state('');
  let dateTo = $state('');

  function inDateRange(date: Date): boolean {
    if (dateFrom && date < parseDate(dateFrom)) return false;
    if (dateTo && date > endOfDay(parseDate(dateTo))) return false;
    return true;
  }

  const logs = $derived(
    (maintenanceStore.maintenanceLogs ?? [])
      .filter((l) => !filter || filter(l))
      .filter((l) => inDateRange(new Date(l.date)))
  );

  let selectedId = $state<string | null | undefined>(null);
  const selectedLog = $derived(selectedId ? (logs.find((l) => l.id === selectedId) ?? null) : null);

  let lastScopeKey: string | undefined;
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const detailFields = $derived(
    selectedLog
      ? [
          ...(scope.isFleet
            ? [
                {
                  label: m.col_vehicle(),
                  value: [
                    `${selectedLog.vehicleMake ?? ''} ${selectedLog.vehicleModel ?? ''}`.trim(),
                    selectedLog.vehiclePlate
                  ]
                    .filter(Boolean)
                    .join(' · '),
                  icon: Car,
                  full: true
                }
              ]
            : []),
          { label: m.col_date(), value: formatTableDate(selectedLog.date), icon: Calendar1 },
          {
            label: m.col_odometer(),
            value: formatTableDistance(selectedLog.odometer),
            icon: CircleGauge
          },
          {
            label: m.maintenance_col_service_center(),
            value: formatTableText(selectedLog.serviceCenter),
            icon: Wrench
          },
          { label: m.col_cost(), value: formatTableCurrency(selectedLog.cost), icon: Banknote },
          {
            label: m.col_notes(),
            value: formatTableText(selectedLog.notes),
            icon: Notebook
          }
        ]
      : []
  );

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

  function vehicleLabel(vehicleId: string): string {
    const v = vehicleStore.vehicles?.find((x) => x.id === vehicleId);
    return v ? [`${v.make} ${v.model}`.trim(), v.licensePlate].filter(Boolean).join(' · ') : '';
  }

  function exportCsv(table: Table<MaintenanceLog>) {
    const header = [
      ...(scope.isFleet ? [m.col_vehicle()] : []),
      m.col_date(),
      m.col_odometer(),
      m.maintenance_col_service_center(),
      m.col_cost(),
      m.col_notes()
    ];
    const rows = table
      .getFilteredRowModel()
      .rows.map((r) => r.original)
      .map((l) => [
        ...(scope.isFleet ? [vehicleLabel(l.vehicleId)] : []),
        formatTableDate(l.date),
        formatTableDistance(l.odometer),
        formatTableText(l.serviceCenter),
        formatTableCurrency(l.cost),
        formatTableText(l.notes)
      ]);
    downloadCsv(
      `tracktor-maintenance-logs-${new Date().toISOString().split('T')[0]}.csv`,
      header,
      rows
    );
  }
</script>

<div class="grid grid-cols-1 items-start gap-4 {selectedLog ? 'lg:grid-cols-3' : ''}">
  <div
    id="maintenance-log-card"
    class="bg-card min-w-0 rounded-2xl border p-4 {selectedLog ? 'lg:col-span-2' : ''}"
  >
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
      <AppTable data={logs} {columns} getRowId={(l) => l.id} bind:selectedId>
        {#snippet toolbar(table: Table<MaintenanceLog>)}
          <div class="mb-4 flex flex-row flex-wrap items-center justify-between gap-2">
            <Input
              placeholder={m.common_search()}
              value={(table.getColumn('serviceCenter')?.getFilterValue() as string) ?? ''}
              oninput={(e) =>
                table.getColumn('serviceCenter')?.setFilterValue(e.currentTarget.value)}
              onchange={(e) => {
                table.getColumn('serviceCenter')?.setFilterValue(e.currentTarget.value);
              }}
              icon={SearchIcon}
              class="bg-background/60 h-full max-w-sm"
            />
            <div class="flex flex-row flex-wrap items-center gap-2">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-muted-foreground">{m.common_date_from()}</span>
                <Input type="calendar" bind:value={dateFrom} icon={Calendar1} class="h-7 w-auto" />
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-muted-foreground">{m.common_date_to()}</span>
                <Input type="calendar" bind:value={dateTo} icon={Calendar1} class="h-7 w-auto" />
              </div>
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
              <Button
                variant="outline"
                size="sm"
                class="cursor-pointer"
                onclick={() => exportCsv(table)}
              >
                <LabelWithIcon icon={FileDown} label={m.common_export_csv()} />
              </Button>
              {@render actionButtons()}
            </div>
          </div>
        {/snippet}
      </AppTable>
    </StoreResourceState>
  </div>

  {#if selectedLog}
    <TableDetailPanel onClose={() => (selectedId = null)}>
      <DetailFieldList fields={detailFields} />
      {#if selectedLog.attachment}
        <div class="mt-4">
          <p class="text-muted-foreground mb-2 text-xs">{m.col_attachment()}</p>
          <AttachmentPreview fileName={selectedLog.attachment} />
        </div>
      {/if}
    </TableDetailPanel>
  {/if}
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
