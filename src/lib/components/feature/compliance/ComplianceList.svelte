<script lang="ts">
  import * as Table from '$ui/table/index.js';
  import Button from '$ui/button/button.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import FeatureRecordCardSkeleton from '$appui/FeatureRecordCardSkeleton.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import ComplianceContextMenu from './ComplianceContextMenu.svelte';
  import ComplianceForm from './ComplianceForm.svelte';
  import { complianceStore } from '$stores/compliance.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { formatDate } from '$lib/helper/format.helper';
  import {
    getComplianceNextDue,
    getComplianceStatus,
    getComplianceTypeLabel,
    getComplianceTypeIcon,
    type Compliance
  } from '$lib/domain/compliance';
  import * as m from '$lib/paraglide/messages';

  const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
    insurance: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    emissions: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500' },
    roadworthiness: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
    registration: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    other: { bg: 'bg-slate-500/10', text: 'text-slate-500' }
  };

  const DAYS_LEFT_COLOR: Record<string, string> = {
    valid: 'text-emerald-600 dark:text-emerald-400',
    expiring_soon: 'text-amber-600 dark:text-amber-400',
    expired: 'text-red-600 dark:text-red-400'
  };

  interface Props {
    /** Optional predicate to narrow what's rendered (e.g. page-level type/status filter tabs). */
    filter?: (doc: Compliance) => boolean;
  }

  let { filter }: Props = $props();

  let lastScopeKey: string | undefined;
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const documents = $derived(
    filter ? (complianceStore.documents ?? []).filter(filter) : (complianceStore.documents ?? [])
  );

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      complianceStore.refreshDocuments(vehicleId);
    }
  });

  const daysLeft = (nextDue: Date) => Math.ceil((nextDue.getTime() - Date.now()) / 86_400_000);

  const openEdit = (doc: Compliance) =>
    sheetStore.openSheet(ComplianceForm, m.compliance_menu_sheet_title(), '', doc);
</script>

<StoreResourceState
  processing={complianceStore.processing}
  error={complianceStore.error}
  data={documents}
  emptyMessage={m.compliance_list_empty()}
>
  {#snippet skeleton()}
    <FeatureRecordCardSkeleton cardClass="bg-background rounded-2xl border p-4 shadow-sm h-28" />
  {/snippet}
  <div class="rounded-xl border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>{m.compliance_col_document()}</Table.Head>
          <Table.Head>{m.compliance_col_next_due()}</Table.Head>
          <Table.Head>{m.compliance_col_status()}</Table.Head>
          <Table.Head>{m.compliance_col_days_left()}</Table.Head>
          <Table.Head class="text-right">{m.compliance_col_action()}</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each documents as doc (doc.id)}
          {@const nextDue = getComplianceNextDue(doc)}
          {@const status = getComplianceStatus(doc)}
          {@const TypeIcon = getComplianceTypeIcon(doc.type)}
          {@const style = TYPE_STYLES[doc.type] ?? TYPE_STYLES.other}
          {@const days = nextDue ? daysLeft(nextDue) : null}
          <Table.Row id="compliance-item-{doc.id}">
            <Table.Cell>
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
                  <p class="text-muted-foreground truncate text-xs">
                    {[
                      doc.issuer,
                      scope.isFleet
                        ? `${doc.vehicleMake ?? ''} ${doc.vehicleModel ?? ''}`.trim()
                        : null
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell class="whitespace-nowrap">
              {#if nextDue}
                {formatDate(nextDue)}
              {:else if doc.recurrenceType === 'no_end'}
                {m.col_no_end_date()}
              {:else}
                —
              {/if}
            </Table.Cell>
            <Table.Cell><StatusPill {status} /></Table.Cell>
            <Table.Cell class="whitespace-nowrap {DAYS_LEFT_COLOR[status]}">
              {#if days != null}
                {days} {m.recurrence_interval_days()}
              {:else}
                —
              {/if}
            </Table.Cell>
            <Table.Cell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onclick={() => openEdit(doc)}>
                  {status === 'expired' ? m.compliance_action_renew() : m.compliance_action_view()}
                </Button>
                <ComplianceContextMenu
                  document={doc}
                  onaction={() => complianceStore.reloadDocuments()}
                />
              </div>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</StoreResourceState>
