<script lang="ts">
  import { type FuelLog } from '$lib/domain/fuel';

  import Badge from '$ui/badge/badge.svelte';
  import {
    formatTableBoolean,
    formatTableCurrency,
    formatTableDate,
    formatTableDistance,
    formatTableFuelAmount,
    formatTableMileage,
    formatTableText
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
  import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
  import type { ColumnDef } from '@tanstack/table-core';
  import { renderComponent, renderSnippet } from '$ui/data-table';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import ResourceState from '$appui/ResourceState.svelte';
  import TableSkeleton from '$appui/TableSkeleton.svelte';
  import AppTable from '$layout/AppTable.svelte';

  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import {
    col_date,
    col_odometer,
    col_filled,
    col_missed_last,
    col_cost,
    col_mileage,
    col_notes,
    col_attachment,
    fuel_volume_label_energy,
    fuel_volume_label_fuel,
    fuel_empty_list,
    common_yes,
    common_no
  } from '$lib/paraglide/messages/_index.js';

  // Get the selected vehicle to determine fuel type and units
  const selectedVehicle = $derived(
    vehicleStore.vehicles?.find((v) => v.id === vehicleStore.selectedId)
  );
  // const fuelUnit = $derived(selectedVehicle?.fuelType ? FUEL_UNITS[selectedVehicle.fuelType] : 'L');
  const volumeLabel = $derived(
    selectedVehicle?.fuelType === 'electric' ? fuel_volume_label_energy() : fuel_volume_label_fuel()
  );

  const columns: ColumnDef<FuelLog>[] = [
    {
      accessorKey: 'date',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Calendar1,
          iconClass: 'h-4 w-4',
          label: col_date(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderSnippet(dateCell, { value: row.getValue('date') })
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
      cell: ({ row }) => renderSnippet(odometerCell, { value: row.getValue('odometer') })
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
      cell: ({ row }) => renderSnippet(badge, { value: row.getValue('filled') })
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
      cell: ({ row }) => renderSnippet(badge, { value: row.getValue('missedLast') })
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
          amount: row.getValue('fuelAmount'),
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
      cell: ({ row }) => renderSnippet(costCell, { value: row.getValue('cost') })
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
          mileage: row.getValue('mileage'),
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
      cell: ({ row }) => renderSnippet(notesCell, { value: row.getValue('notes') })
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
      cell: ({ row }) => renderSnippet(attachmentCell, { value: row.getValue('attachment') })
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        renderComponent(FuelLogContextMenu, {
          fuelLog: row.original,
          onaction: () => {
            fuelLogStore.refreshFuelLogs();
          }
        })
    }
  ];

  $effect(() => {
    if (vehicleStore.selectedId) fuelLogStore.refreshFuelLogs();
  });
</script>

{#if fuelLogStore.processing}
  <TableSkeleton containerId="fuel-log-list-skeleton" />
{:else if fuelLogStore.error}
  <ResourceState state="error" message={fuelLogStore.error} />
{:else if fuelLogStore.fuelLogs?.length === 0}
  <ResourceState state="empty" message={fuel_empty_list()} />
{:else}
  <AppTable data={fuelLogStore.fuelLogs || []} {columns} />
{/if}

{#snippet badge(params: any)}
  <div class="flex flex-row justify-center">
    <Badge variant="outline"
      ><span>{formatTableBoolean(params.value, common_yes(), common_no())}</span></Badge
    >
  </div>
{/snippet}

{#snippet dateCell(params: any)}
  <div class="flex flex-row justify-start">{formatTableDate(params.value)}</div>
{/snippet}

{#snippet odometerCell(params: any)}
  <div class="flex flex-row justify-center">{formatTableDistance(params.value)}</div>
{/snippet}

{#snippet fuelAmountCell(params: any)}
  <div class="flex flex-row justify-center">
    {formatTableFuelAmount(params.amount, params.fuelType as string | undefined)}
  </div>
{/snippet}

{#snippet costCell(params: any)}
  <div class="flex flex-row justify-start">{formatTableCurrency(params.value)}</div>
{/snippet}

{#snippet mileageCell(params: any)}
  <div class="flex flex-row justify-center">
    {formatTableMileage(params.mileage, params.fuelType as string | undefined)}
  </div>
{/snippet}

{#snippet notesCell(params: any)}
  <div class="flex flex-row justify-start">{formatTableText(params.value)}</div>
{/snippet}

{#snippet attachmentCell(params: any)}
  <div class="flex flex-row justify-center">
    {#if params.value}
      {@const fileName = params.value}
      <AttachmentLink {fileName} />
    {:else}
      <span class="text-muted-foreground">-</span>
    {/if}
  </div>
{/snippet}
