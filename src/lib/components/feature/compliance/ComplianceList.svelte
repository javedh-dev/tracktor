<script lang="ts">
  import Badge from '$ui/badge/badge.svelte';
  import Button from '$ui/button/button.svelte';
  import Input from '$appui/input.svelte';
  import * as DropdownMenu from '$ui/dropdown-menu';
  import { endOfDay } from 'date-fns';
  import { getColumnDisplayName } from '$helper/table.helper';
  import { formatTableDate, formatTableCurrency, formatTableText } from '$helper/table-cell.helper';
  import { parseDate } from '$helper/format.helper';
  import { downloadCsv } from '$helper/csv-export.helper';
  import { ACCENT } from '$helper/accent-color.helper';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import Timer from '@lucide/svelte/icons/timer';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import Car from '@lucide/svelte/icons/car';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Notebook from '@lucide/svelte/icons/notebook';
  import FileText from '@lucide/svelte/icons/file-text';
  import Repeat from '@lucide/svelte/icons/repeat';
  import FileDown from '@lucide/svelte/icons/file-down';
  import Columns3 from '@lucide/svelte/icons/columns-3';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import SearchIcon from '@lucide/svelte/icons/search';
  import type { ColumnDef, Table } from '@tanstack/table-core';
  import { renderComponent, renderSnippet } from '$ui/data-table';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import TableSkeleton from '$appui/TableSkeleton.svelte';
  import AppTable from '$layout/AppTable.svelte';
  import TableDetailPanel from '$layout/TableDetailPanel.svelte';
  import DetailFieldList from '$layout/DetailFieldList.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import AttachmentCell from '$lib/components/feature/shared/AttachmentCell.svelte';
  import VehicleCell from '$lib/components/feature/shared/VehicleCell.svelte';
  import AttachmentPreview from '$lib/components/app/AttachmentPreview.svelte';
  import ComplianceContextMenu from './ComplianceContextMenu.svelte';
  import { complianceStore } from '$stores/compliance.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import {
    getComplianceNextDue,
    getComplianceStatus,
    getComplianceTypeLabel,
    getComplianceTypeIcon,
    getComplianceIssuerLabel,
    getComplianceDocumentNumberLabel,
    getComplianceRecurrenceTypeLabel,
    type Compliance,
    type ComplianceStatus
  } from '$lib/domain/compliance';
  import * as m from '$lib/paraglide/messages';

  const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
    insurance: { bg: ACCENT.denim.soft, text: ACCENT.denim.text },
    emissions: { bg: ACCENT.plum.soft, text: ACCENT.plum.text },
    roadworthiness: { bg: ACCENT.teal.soft, text: ACCENT.teal.text },
    registration: { bg: ACCENT.ochre.soft, text: ACCENT.ochre.text },
    other: { bg: ACCENT.fog.soft, text: ACCENT.fog.text }
  };

  const DAYS_LEFT_COLOR: Record<string, string> = {
    valid: 'text-success',
    expiring_soon: 'text-warning',
    expired: 'text-destructive'
  };

  const getStatusLabel = (status: ComplianceStatus): string => {
    switch (status) {
      case 'valid':
        return m.compliance_filter_valid();
      case 'expiring_soon':
        return m.compliance_filter_expiring_soon();
      case 'expired':
        return m.compliance_filter_expired();
    }
  };

  interface Props {
    /** Optional predicate to narrow what's rendered (e.g. page-level type/status filters). */
    filter?: (doc: Compliance) => boolean;
  }

  let { filter }: Props = $props();

  let dateFrom = $state('');
  let dateTo = $state('');

  function inDateRange(date: Date): boolean {
    if (dateFrom && date < parseDate(dateFrom)) return false;
    if (dateTo && date > endOfDay(parseDate(dateTo))) return false;
    return true;
  }

  let selectedId = $state<string | null | undefined>(null);

  let lastScopeKey: string | undefined;
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const documents = $derived(
    (complianceStore.documents ?? [])
      .filter((d) => !filter || filter(d))
      .filter((d) => inDateRange(new Date(d.startDate)))
  );
  const selectedDoc = $derived(
    selectedId ? (documents.find((d) => d.id === selectedId) ?? null) : null
  );
  const selectedDocFields = $derived(
    selectedDoc
      ? [
          ...(scope.isFleet
            ? [
                {
                  label: m.col_vehicle(),
                  value: [
                    `${selectedDoc.vehicleMake ?? ''} ${selectedDoc.vehicleModel ?? ''}`.trim(),
                    selectedDoc.vehiclePlate
                  ]
                    .filter(Boolean)
                    .join(' · '),
                  icon: Car,
                  full: true
                }
              ]
            : []),
          {
            label: getComplianceDocumentNumberLabel(selectedDoc.type, m),
            value: selectedDoc.documentNumber,
            icon: FileText
          },
          {
            label: getComplianceIssuerLabel(selectedDoc.type, m),
            value: selectedDoc.issuer,
            icon: ShieldCheck
          },
          {
            label: m.compliance_col_start_date(),
            value: formatTableDate(selectedDoc.startDate),
            icon: Calendar1
          },
          {
            label: m.compliance_col_end_date(),
            value: formatTableDate(selectedDoc.endDate),
            icon: Calendar1
          },
          {
            label: m.compliance_col_next_due(),
            value: (() => {
              const nextDue = getComplianceNextDue(selectedDoc);
              if (nextDue) return formatTableDate(nextDue);
              return selectedDoc.recurrenceType === 'no_end' ? m.col_no_end_date() : '-';
            })(),
            icon: Calendar1
          },
          {
            label: m.compliance_col_recurrence(),
            value: getComplianceRecurrenceTypeLabel(selectedDoc.recurrenceType, m),
            icon: Repeat
          },
          {
            label: m.col_cost(),
            value: formatTableCurrency(selectedDoc.cost),
            icon: Banknote
          },
          {
            label: m.col_notes(),
            value: formatTableText(selectedDoc.notes),
            icon: Notebook
          }
        ]
      : []
  );

  const daysLeft = (nextDue: Date) => Math.ceil((nextDue.getTime() - Date.now()) / 86_400_000);

  const columns = $derived<ColumnDef<Compliance>[]>([
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
            cell: ({ row }: { row: { original: Compliance } }) =>
              renderComponent(VehicleCell, {
                vehicleId: row.original.vehicleId,
                make: row.original.vehicleMake,
                model: row.original.vehicleModel,
                plate: row.original.vehiclePlate
              })
          } satisfies ColumnDef<Compliance>
        ]
      : []),
    {
      accessorKey: 'issuer',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: ShieldCheck,
          iconClass: 'h-4 w-4',
          label: m.compliance_col_document(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderSnippet(documentCell, { doc: row.original })
    },
    {
      id: 'nextDue',
      accessorFn: (row) => getComplianceNextDue(row),
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Calendar1,
          iconClass: 'h-4 w-4',
          label: m.compliance_col_next_due(),
          style: 'justify-start'
        }),
      cell: ({ row }) => renderSnippet(nextDueCell, { doc: row.original })
    },
    {
      id: 'status',
      accessorFn: (row) => getComplianceStatus(row),
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: BadgeCheck,
          iconClass: 'h-4 w-4',
          label: m.compliance_col_status(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderSnippet(statusCell, { status: getComplianceStatus(row.original) })
    },
    {
      id: 'daysLeft',
      header: () =>
        renderComponent(LabelWithIcon, {
          icon: Timer,
          iconClass: 'h-4 w-4',
          label: m.compliance_col_days_left(),
          style: 'justify-center'
        }),
      cell: ({ row }) => renderSnippet(daysLeftCell, { doc: row.original })
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
        renderComponent(ComplianceContextMenu, {
          document: row.original,
          onaction: () => complianceStore.reloadDocuments()
        })
    }
  ]);

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      complianceStore.refreshDocuments(vehicleId);
    }
  });

  function vehicleLabel(vehicleId: string): string {
    const v = vehicleStore.vehicles?.find((x) => x.id === vehicleId);
    return v ? [`${v.make} ${v.model}`.trim(), v.licensePlate].filter(Boolean).join(' · ') : '';
  }

  function exportCsv(table: Table<Compliance>) {
    const header = [
      ...(scope.isFleet ? [m.col_vehicle()] : []),
      m.compliance_col_document(),
      m.compliance_col_start_date(),
      m.compliance_col_end_date(),
      m.compliance_col_next_due(),
      m.compliance_col_recurrence(),
      m.col_cost(),
      m.col_notes()
    ];
    const rows = table
      .getFilteredRowModel()
      .rows.map((r) => r.original)
      .map((d) => {
        const nextDue = getComplianceNextDue(d);
        return [
          ...(scope.isFleet ? [vehicleLabel(d.vehicleId)] : []),
          [getComplianceTypeLabel(d.type, m), d.issuer].filter(Boolean).join(' · '),
          formatTableDate(d.startDate),
          formatTableDate(d.endDate),
          nextDue
            ? formatTableDate(nextDue)
            : d.recurrenceType === 'no_end'
              ? m.col_no_end_date()
              : '-',
          getComplianceRecurrenceTypeLabel(d.recurrenceType, m),
          formatTableCurrency(d.cost),
          formatTableText(d.notes)
        ];
      });
    downloadCsv(`tracktor-compliance-${new Date().toISOString().split('T')[0]}.csv`, header, rows);
  }
</script>

<div class="grid grid-cols-1 items-start gap-4 {selectedDoc ? 'lg:grid-cols-3' : ''}">
  <div
    id="compliance-list-card"
    class="bg-card min-w-0 rounded-2xl border p-4 {selectedDoc ? 'lg:col-span-2' : ''}"
  >
    <StoreResourceState
      processing={complianceStore.processing}
      error={complianceStore.error}
      data={complianceStore.documents}
      emptyMessage={m.compliance_list_empty()}
    >
      {#snippet skeleton()}
        <TableSkeleton containerId="compliance-list-skeleton" />
      {/snippet}
      <AppTable data={documents} {columns} getRowId={(d) => d.id} bind:selectedId>
        {#snippet toolbar(table: Table<Compliance>)}
          <div class="mb-4 flex flex-row flex-wrap items-center justify-between gap-2">
            <Input
              placeholder={m.common_search()}
              value={(table.getColumn('issuer')?.getFilterValue() as string) ?? ''}
              oninput={(e) => table.getColumn('issuer')?.setFilterValue(e.currentTarget.value)}
              onchange={(e) => {
                table.getColumn('issuer')?.setFilterValue(e.currentTarget.value);
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
            </div>
          </div>
        {/snippet}
      </AppTable>
    </StoreResourceState>
  </div>

  {#if selectedDoc}
    {@const status = getComplianceStatus(selectedDoc)}
    <TableDetailPanel onClose={() => (selectedId = null)}>
      <div class="mb-3 flex items-center gap-2">
        <StatusPill {status} label={getStatusLabel(status)} />
        <span class="text-sm font-medium">
          {selectedDoc.type === 'other' && selectedDoc.otherLabel
            ? selectedDoc.otherLabel
            : getComplianceTypeLabel(selectedDoc.type, m)}
        </span>
      </div>
      <DetailFieldList fields={selectedDocFields} />
      {#if selectedDoc.attachment}
        <div class="mt-4">
          <p class="text-muted-foreground mb-2 text-xs">{m.col_attachment()}</p>
          <AttachmentPreview fileName={selectedDoc.attachment} />
        </div>
      {/if}
    </TableDetailPanel>
  {/if}
</div>

{#snippet documentCell({ doc }: { doc: Compliance })}
  {@const TypeIcon = getComplianceTypeIcon(doc.type)}
  {@const style = TYPE_STYLES[doc.type] ?? TYPE_STYLES.other}
  <div class="flex items-center gap-3">
    <span
      class="flex size-9 shrink-0 items-center justify-center rounded-lg {style.bg} {style.text}"
    >
      <TypeIcon class="size-4" />
    </span>
    <div class="min-w-0">
      <p class="truncate text-sm font-medium">
        {doc.type === 'other' && doc.otherLabel
          ? doc.otherLabel
          : getComplianceTypeLabel(doc.type, m)}
      </p>
      <p class="text-muted-foreground truncate text-xs">{doc.issuer}</p>
    </div>
  </div>
{/snippet}

{#snippet nextDueCell({ doc }: { doc: Compliance })}
  {@const nextDue = getComplianceNextDue(doc)}
  <div class="flex flex-row justify-start whitespace-nowrap">
    {#if nextDue}
      {formatTableDate(nextDue)}
    {:else if doc.recurrenceType === 'no_end'}
      {m.col_no_end_date()}
    {:else}
      -
    {/if}
  </div>
{/snippet}

{#snippet statusCell({ status }: { status: ComplianceStatus })}
  <div class="flex flex-row justify-center">
    <StatusPill {status} label={getStatusLabel(status)} />
  </div>
{/snippet}

{#snippet daysLeftCell({ doc }: { doc: Compliance })}
  {@const nextDue = getComplianceNextDue(doc)}
  {@const status = getComplianceStatus(doc)}
  {@const days = nextDue ? daysLeft(nextDue) : null}
  <div class="flex flex-row justify-center whitespace-nowrap {DAYS_LEFT_COLOR[status]}">
    {#if days != null}
      <Badge variant="outline">{days} {m.recurrence_interval_days()}</Badge>
    {:else}
      -
    {/if}
  </div>
{/snippet}
