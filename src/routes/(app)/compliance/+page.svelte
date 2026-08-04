<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import * as Select from '$ui/select/index.js';
  import Shield from '@lucide/svelte/icons/shield';
  import ListFilter from '@lucide/svelte/icons/list-filter';
  import Car from '@lucide/svelte/icons/car';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import Timer from '@lucide/svelte/icons/timer';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { complianceStore } from '$stores/compliance.svelte';
  import ComplianceForm from '$feature/compliance/ComplianceForm.svelte';
  import ComplianceList from '$feature/compliance/ComplianceList.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import {
    COMPLIANCE_TYPES,
    getComplianceStatus,
    getComplianceTypeLabel
  } from '$lib/domain/compliance';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_compliance_disabled_title,
    feature_compliance_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  let typeFilter = $state<string>('all');
  let statusFilter = $state<string>('all');

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));
  let lastScopeKey: string | undefined;
  $effect(() => {
    const vehicleId = scope.vehicleId;
    const scopeKey = vehicleId ?? '__fleet__';
    if (scopeKey !== lastScopeKey) {
      lastScopeKey = scopeKey;
      complianceStore.refreshDocuments(vehicleId);
    }
  });

  const documents = $derived(complianceStore.documents ?? []);
  const isEmpty = $derived(
    !complianceStore.processing && !complianceStore.error && documents.length === 0
  );

  const typeFiltered = $derived(
    typeFilter === 'all' ? documents : documents.filter((d) => d.type === typeFilter)
  );

  const stats = $derived.by(() => {
    const today = new Date();
    const statuses = typeFiltered.map((d) => getComplianceStatus(d, today));
    const total = statuses.length;
    const valid = statuses.filter((s) => s === 'valid').length;
    const expiringSoon = statuses.filter((s) => s === 'expiring_soon').length;
    const expired = statuses.filter((s) => s === 'expired').length;
    return { total, valid, expiringSoon, expired };
  });

  const typeOptions = $derived([
    { id: 'all', label: m.compliance_filter_all_types() },
    ...Object.keys(COMPLIANCE_TYPES).map((type) => ({
      id: type,
      label: getComplianceTypeLabel(type, m)
    }))
  ]);

  const statusOptions = [
    { id: 'all', label: m.compliance_filter_all() },
    { id: 'valid', label: m.compliance_filter_valid() },
    { id: 'expiring_soon', label: m.compliance_filter_expiring_soon() },
    { id: 'expired', label: m.compliance_filter_expired() }
  ];

  const typeOptionLabel = $derived(
    typeOptions.find((o) => o.id === typeFilter)?.label ?? m.compliance_filter_all_types()
  );
  const statusOptionLabel = $derived(
    statusOptions.find((o) => o.id === statusFilter)?.label ?? m.compliance_filter_all()
  );

  const listFilter = $derived((doc: (typeof documents)[number]) => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
    if (statusFilter !== 'all' && getComplianceStatus(doc) !== statusFilter) return false;
    return true;
  });
</script>

<FeaturePageShell
  feature={Features.COMPLIANCE}
  title={m.compliance_page_title()}
  description={m.compliance_page_description()}
  disabledTitle={feature_compliance_disabled_title()}
  disabledHint={feature_compliance_disabled_hint()}
>
  {#snippet actions()}
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(ComplianceForm, m.compliance_add_action())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.compliance_add_action()} />
    </Button>
  {/snippet}

  {#if isEmpty}
    <div
      class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center"
    >
      <span class="flex size-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
        <Shield class="size-8" />
      </span>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">{m.compliance_cta_heading()}</h3>
        <p class="text-muted-foreground max-w-sm text-sm">{m.compliance_list_empty()}</p>
      </div>
      <Button onclick={() => sheetStore.openSheet(ComplianceForm, m.compliance_add_action())}>
        <LabelWithIcon icon={CirclePlus} label={m.compliance_add_action()} />
      </Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Car}
        label={m.compliance_stat_total()}
        value={stats.total}
        color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
      />
      <StatCard
        icon={BadgeCheck}
        label={m.compliance_stat_valid()}
        value={stats.valid}
        color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
      />
      <StatCard
        icon={Timer}
        label={m.compliance_stat_expiring_soon()}
        value={stats.expiringSoon}
        color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
      />
      <StatCard
        icon={AlertTriangle}
        label={m.compliance_stat_expired()}
        value={stats.expired}
        color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <ListFilter class="text-muted-foreground size-4" />
      <Select.Root type="single" bind:value={typeFilter}>
        <Select.Trigger class="w-44">{typeOptionLabel}</Select.Trigger>
        <Select.Content>
          {#each typeOptions as option (option.id)}
            <Select.Item value={option.id}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <Select.Root type="single" bind:value={statusFilter}>
        <Select.Trigger class="w-44">{statusOptionLabel}</Select.Trigger>
        <Select.Content>
          {#each statusOptions as option (option.id)}
            <Select.Item value={option.id}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <ComplianceList filter={listFilter} />
  {/if}
</FeaturePageShell>
