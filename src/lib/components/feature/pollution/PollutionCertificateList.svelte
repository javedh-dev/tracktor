<script lang="ts">
  import Calendar from '@lucide/svelte/icons/calendar';
  import FileText from '@lucide/svelte/icons/file-text';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import Repeat from '@lucide/svelte/icons/repeat';
  import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
  import FeatureRecordCard from '$appui/FeatureRecordCard.svelte';
  import FeatureRecordCardSkeleton from '$appui/FeatureRecordCardSkeleton.svelte';
  import RecordDetailItem from '$appui/RecordDetailItem.svelte';
  import { formatDate } from '$lib/helper/format.helper';
  import PuccContextMenu from './PuccContextMenu.svelte';
  import { puccStore } from '$stores/pucc.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import StoreResourceState from '$appui/StoreResourceState.svelte';
  import { getPuccRecurrenceTypeLabel, getPuccNextDue } from '$lib/domain/pucc';
  import type { PollutionCertificate } from '$lib/domain/pucc';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    /** Optional predicate to narrow what's rendered (e.g. page-level status filter tabs). */
    filter?: (pucc: PollutionCertificate) => boolean;
  }

  let { filter }: Props = $props();

  let lastScopeKey: string | undefined;
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  const certs = $derived(
    filter ? (puccStore.pollutionCerts ?? []).filter(filter) : (puccStore.pollutionCerts ?? [])
  );

  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      puccStore.refreshPuccs(vehicleId);
    }
  });
</script>

<StoreResourceState
  processing={puccStore.processing}
  error={puccStore.error}
  data={certs}
  emptyMessage={m.pollution_list_empty()}
>
  {#snippet skeleton()}
    <FeatureRecordCardSkeleton containerId="pollution-list-skeleton" />
  {/snippet}
  {#each certs as pucc (pucc.id)}
    {@const nextDue = getPuccNextDue(pucc)}
    <FeatureRecordCard
      id="pollution-certificate-item-{pucc.id}"
      class="pollution-certificate-item bg-secondary lg:bg-background/50"
      title={pucc.certificateNumber}
      titleIcon={BadgeCheck}
      titleClass="text-fuchsia-500 dark:text-fuchsia-400"
      subtitle={scope.isFleet && (pucc.vehicleMake || pucc.vehicleModel)
        ? `${pucc.vehicleMake ?? ''} ${pucc.vehicleModel ?? ''}`.trim()
        : undefined}
    >
      {#snippet actions()}
        <PuccContextMenu
          {pucc}
          onaction={() => {
            puccStore.reloadPuccs();
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
</StoreResourceState>
