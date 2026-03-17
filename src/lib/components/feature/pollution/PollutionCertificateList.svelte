<script lang="ts">
  import Calendar from '@lucide/svelte/icons/calendar';
  import FileText from '@lucide/svelte/icons/file-text';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import Repeat from '@lucide/svelte/icons/repeat';
  import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
  import FeatureRecordCard from '$appui/FeatureRecordCard.svelte';
  import RecordDetailItem from '$appui/RecordDetailItem.svelte';
  import { formatDate } from '$lib/helper/format.helper';
  import { getNextDueDate } from '$lib/helper/recurrence.helper';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import PuccContextMenu from './PuccContextMenu.svelte';
  import { puccStore } from '$stores/pucc.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import ResourceState from '$appui/ResourceState.svelte';
  import { getPuccRecurrenceTypeLabel } from '$lib/domain/pucc';
  import type { PollutionCertificate } from '$lib/domain/pucc';
  import * as m from '$lib/paraglide/messages';

  const getNextPuccDue = (pucc: PollutionCertificate) => {
    const baseDate = pucc.expiryDate ?? pucc.issueDate;
    if (!baseDate) return null;
    if (pucc.recurrenceType === 'no_end') return null;
    if (pucc.recurrenceType === 'none') return baseDate;
    return getNextDueDate(new Date(baseDate), pucc.recurrenceType, pucc.recurrenceInterval);
  };

  $effect(() => {
    if (vehicleStore.selectedId) puccStore.refreshPuccs();
  });
</script>

{#if puccStore.processing}
  <div id="pollution-list-skeleton" class="space-y-4 pt-4">
    {#each [0, 1] as i (i)}
      <div class="bg-background rounded-lg border p-4 shadow-sm lg:p-6">
        <div class="mb-4 flex items-center justify-between">
          <Skeleton class="h-6 w-48" />
          <Skeleton class="h-8 w-8 rounded-full" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton class="h-5 w-full max-w-[200px]" />
          <Skeleton class="h-5 w-full max-w-40" />
          <Skeleton class="h-5 w-full max-w-48" />
          <Skeleton class="h-5 w-full max-w-48" />
        </div>
      </div>
    {/each}
  </div>
{:else if puccStore.error}
  <ResourceState state="error" message={puccStore.error} />
{:else if puccStore.pollutionCerts?.length === 0}
  <ResourceState state="empty" message={m.pollution_list_empty()} />
{:else}
  {#each puccStore.pollutionCerts as pucc (pucc.id)}
    {@const nextDue = getNextPuccDue(pucc)}
    <FeatureRecordCard
      id="pollution-certificate-item-{pucc.id}"
      class="pollution-certificate-item bg-secondary lg:bg-background/50"
      title={pucc.certificateNumber}
      titleIcon={BadgeCheck}
      titleClass="text-fuchsia-500 dark:text-fuchsia-400"
    >
      {#snippet actions()}
        <PuccContextMenu
          {pucc}
          onaction={() => {
            puccStore.refreshPuccs();
          }}
        />
      {/snippet}

      <RecordDetailItem
        label={m.pollution_col_issue_date()}
        value={formatDate(pucc.issueDate)}
        icon={Calendar}
        class="text-gray-900 dark:text-gray-100"
      />
      {#if pucc.expiryDate}
        <RecordDetailItem
          label={m.pollution_col_expiry_date()}
          value={formatDate(pucc.expiryDate)}
          icon={Calendar}
          class="text-gray-900 dark:text-gray-100"
        />
      {/if}
      <RecordDetailItem
        label={m.pollution_col_next_due()}
        icon={Calendar}
        class="text-gray-900 dark:text-gray-100"
      >
        <span>
          {#if nextDue}
            {formatDate(nextDue)}
          {:else if pucc.recurrenceType === 'no_end'}
            {m.col_no_end_date()}
          {:else}
            —
          {/if}
        </span>
      </RecordDetailItem>
      {#if pucc.recurrenceType && pucc.recurrenceType !== 'none'}
        <RecordDetailItem
          label={m.pollution_col_recurrence()}
          icon={Repeat}
          class="text-gray-900 md:col-span-2 dark:text-gray-100"
        >
          <span>
            {getPuccRecurrenceTypeLabel(pucc.recurrenceType, m)}
            {#if (pucc.recurrenceType === 'yearly' || pucc.recurrenceType === 'monthly') && pucc.recurrenceInterval > 1}
              ({m.recurrence_every()}
              {pucc.recurrenceInterval}
              {pucc.recurrenceType === 'yearly'
                ? m.recurrence_interval_years()
                : m.recurrence_interval_months()})
            {/if}
          </span>
        </RecordDetailItem>
      {/if}
      <RecordDetailItem
        label={m.pollution_col_testing_center()}
        value={pucc.testingCenter}
        icon={MapPin}
        class="text-gray-900 dark:text-gray-100"
      />
      {#if pucc.notes}
        <RecordDetailItem
          label={m.pollution_col_notes()}
          value={pucc.notes}
          icon={FileText}
          class="text-gray-900 md:col-span-2 dark:text-gray-100"
        />
      {/if}
      {#if pucc.attachment}
        {@const fileName = pucc.attachment}
        <RecordDetailItem
          label={m.col_attachment()}
          icon={Paperclip}
          class="text-gray-900 md:col-span-2 dark:text-gray-100"
        >
          <AttachmentLink {fileName}>
            <span class="text-sm">{m.pollution_col_view_certificate()}</span>
          </AttachmentLink>
        </RecordDetailItem>
      {/if}
    </FeatureRecordCard>
  {/each}
{/if}
