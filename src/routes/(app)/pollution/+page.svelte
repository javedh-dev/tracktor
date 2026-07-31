<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import FilterTabs from '$dashboard/FilterTabs.svelte';
  import CtaBanner from '$dashboard/CtaBanner.svelte';
  import Car from '@lucide/svelte/icons/car';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import Timer from '@lucide/svelte/icons/timer';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { puccStore } from '$stores/pucc.svelte';
  import PollutionCertificateForm from '$feature/pollution/PollutionCertificateForm.svelte';
  import PollutionCertificateList from '$feature/pollution/PollutionCertificateList.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import { getPuccStatus } from '$lib/domain/pucc';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_pucc_disabled_title,
    feature_pucc_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  let statusFilter = $state<string>('all');

  const certs = $derived(puccStore.pollutionCerts ?? []);

  const stats = $derived.by(() => {
    const today = new Date();
    const statuses = certs.map((c) => getPuccStatus(c, today));
    const total = statuses.length;
    const valid = statuses.filter((s) => s === 'valid').length;
    const expiringSoon = statuses.filter((s) => s === 'expiring_soon').length;
    const expired = statuses.filter((s) => s === 'expired').length;
    return { total, valid, expiringSoon, expired };
  });

  const tabs = [
    { id: 'all', label: m.pollution_filter_all() },
    { id: 'valid', label: m.pollution_filter_valid() },
    { id: 'expiring_soon', label: m.pollution_filter_expiring_soon() },
    { id: 'expired', label: m.pollution_filter_expired() }
  ];

  const listFilter = $derived(
    statusFilter === 'all'
      ? undefined
      : (c: (typeof certs)[number]) => getPuccStatus(c) === statusFilter
  );
</script>

<FeaturePageShell
  feature={Features.PUCC}
  title={m.pollution_page_title()}
  description={m.pollution_page_description()}
  disabledTitle={feature_pucc_disabled_title()}
  disabledHint={feature_pucc_disabled_hint()}
>
  {#snippet actions()}
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(PollutionCertificateForm, m.pollution_add_action())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.pollution_add_action()} />
    </Button>
  {/snippet}
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      icon={Car}
      label={m.pollution_stat_total()}
      value={stats.total}
      color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
    />
    <StatCard
      icon={BadgeCheck}
      label={m.pollution_stat_valid()}
      value={stats.valid}
      color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
    />
    <StatCard
      icon={Timer}
      label={m.pollution_stat_expiring_soon()}
      value={stats.expiringSoon}
      color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
    />
    <StatCard
      icon={AlertTriangle}
      label={m.pollution_stat_expired()}
      value={stats.expired}
      color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
    />
  </div>

  <FilterTabs {tabs} bind:value={statusFilter} />

  <PollutionCertificateList filter={listFilter} />

  <CtaBanner
    heading={m.pollution_cta_heading()}
    description={m.pollution_cta_description()}
    buttonLabel={m.pollution_add_action()}
    buttonIcon={CirclePlus}
    onButtonClick={() => sheetStore.openSheet(PollutionCertificateForm, m.pollution_add_action())}
  />
</FeaturePageShell>
