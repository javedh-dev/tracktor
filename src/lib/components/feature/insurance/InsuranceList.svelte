<script lang="ts">
  import Shield from '@lucide/svelte/icons/shield';
  import Calendar from '@lucide/svelte/icons/calendar';
  import Hash from '@lucide/svelte/icons/hash';
  import Notebook from '@lucide/svelte/icons/notebook';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import Repeat from '@lucide/svelte/icons/repeat';
  import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
  import FeatureRecordCard from '$appui/FeatureRecordCard.svelte';
  import RecordDetailItem from '$appui/RecordDetailItem.svelte';
  import { formatCurrency, formatDate } from '$lib/helper/format.helper';
  import { getNextDueDate } from '$lib/helper/recurrence.helper';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import InsuranceContextMenu from './InsuranceContextMenu.svelte';
  import { insuranceStore } from '$stores/insurance.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import ResourceState from '$appui/ResourceState.svelte';
  import { getInsuranceRecurrenceTypeLabel } from '$lib/domain/insurance';
  import type { Insurance } from '$lib/domain/insurance';
  import * as m from '$lib/paraglide/messages';

  let vehicleId = $derived(vehicleStore.selectedId);

  const getNextInsuranceDue = (ins: Insurance) => {
    const baseDate = ins.endDate ?? ins.startDate;
    if (!baseDate) return null;
    if (ins.recurrenceType === 'no_end') return null;
    if (ins.recurrenceType === 'none') return baseDate;
    return getNextDueDate(new Date(baseDate), ins.recurrenceType, ins.recurrenceInterval);
  };

  $effect(() => {
    if (vehicleId) insuranceStore.refreshInsurances();
  });
</script>

{#if insuranceStore.processing}
  <div class="space-y-4 pt-4">
    {#each [0, 1] as i (i)}
      <div class="bg-background rounded-lg border p-4 shadow-sm lg:p-6">
        <div class="mb-4 flex items-center justify-between">
          <Skeleton class="h-6 w-48" />
          <Skeleton class="h-8 w-8 rounded-full" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton class="h-5 w-full max-w-50" />
          <Skeleton class="h-5 w-full max-w-40" />
          <Skeleton class="h-5 w-full max-w-48" />
          <Skeleton class="h-5 w-full max-w-48" />
        </div>
      </div>
    {/each}
  </div>
{:else if insuranceStore.error}
  <ResourceState state="error" message={insuranceStore.error} />
{:else if insuranceStore.insurances?.length === 0}
  <ResourceState state="empty" message={m.insurance_list_empty()} />
{:else}
  {#each insuranceStore.insurances as ins (ins.id)}
    {@const nextDue = getNextInsuranceDue(ins)}
    <FeatureRecordCard
      id="insurance-item-{ins.id}"
      class="insurance-item bg-secondary lg:bg-background/50"
      title={ins.provider}
      titleIcon={Shield}
      titleClass="text-blue-400"
    >
      {#snippet actions()}
        <InsuranceContextMenu
          insurance={ins}
          onaction={() => {
            insuranceStore.refreshInsurances();
          }}
        />
      {/snippet}

      <RecordDetailItem
        label={m.insurance_col_policy_number()}
        value={ins.policyNumber}
        icon={Hash}
      />
      <RecordDetailItem
        label={m.insurance_col_cost()}
        value={formatCurrency(ins.cost)}
        icon={Banknote}
      />
      <RecordDetailItem
        label={m.insurance_col_start_date()}
        value={formatDate(ins.startDate)}
        icon={Calendar}
      />
      {#if ins.endDate}
        <RecordDetailItem
          label={m.insurance_col_end_date()}
          value={formatDate(ins.endDate)}
          icon={Calendar}
        />
      {/if}
      <RecordDetailItem label={m.insurance_col_next_due()} icon={Calendar}>
        <span>
          {#if nextDue}
            {formatDate(nextDue)}
          {:else if ins.recurrenceType === 'no_end'}
            {m.col_no_end_date()}
          {:else}
            —
          {/if}
        </span>
      </RecordDetailItem>
      {#if ins.recurrenceType && ins.recurrenceType !== 'none'}
        <RecordDetailItem label={m.insurance_col_recurrence()} icon={Repeat} class="md:col-span-2">
          <span>
            {getInsuranceRecurrenceTypeLabel(ins.recurrenceType, m)}
            {#if (ins.recurrenceType === 'yearly' || ins.recurrenceType === 'monthly') && ins.recurrenceInterval > 1}
              ({m.recurrence_every()}
              {ins.recurrenceInterval}
              {ins.recurrenceType === 'yearly'
                ? m.recurrence_interval_years()
                : m.recurrence_interval_months()})
            {/if}
          </span>
        </RecordDetailItem>
      {/if}
      {#if ins.notes}
        <RecordDetailItem
          label={m.insurance_col_notes()}
          value={ins.notes}
          icon={Notebook}
          class="md:col-span-2"
        />
      {/if}
      {#if ins.attachment}
        {@const fileName = ins.attachment}
        <RecordDetailItem label={m.col_attachment()} icon={Paperclip} class="md:col-span-2">
          <AttachmentLink {fileName}>
            <span class="text-sm">{m.insurance_col_view_document()}</span>
          </AttachmentLink>
        </RecordDetailItem>
      {/if}
    </FeatureRecordCard>
  {/each}
{/if}
