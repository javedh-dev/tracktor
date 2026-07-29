<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import CtaBanner from '$dashboard/CtaBanner.svelte';
  import FilterTabs from '$dashboard/FilterTabs.svelte';
  import * as Table from '$ui/table/index.js';
  import Car from '@lucide/svelte/icons/car';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import Timer from '@lucide/svelte/icons/timer';
  import { apiClient } from '$lib/helper/api.helper';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import PollutionCertificateForm from '$feature/pollution/PollutionCertificateForm.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import * as m from '$lib/paraglide/messages';
  import {
    feature_pucc_disabled_title,
    feature_pucc_disabled_hint
  } from '$lib/paraglide/messages/_index.js';

  interface PucRecord {
    vehicleId: string;
    vehicleName: string;
    licensePlate: string | null;
    certificateNumber: string | null;
    expiryDate: string | null;
    status: 'valid' | 'expiring_soon' | 'expired' | 'not_available';
  }

  let records = $state<PucRecord[]>([]);
  let loading = $state(true);
  let statusFilter = $state<string>('all');

  onMount(async () => {
    try {
      const { data: res } = await apiClient.get<{ success: boolean; data: PucRecord[] }>(
        '/pucc/status'
      );
      if (res.success && res.data) {
        records = res.data;
      }
    } catch (err) {
      console.error('Failed to fetch PUC status', err);
    } finally {
      loading = false;
    }
  });

  const stats = $derived.by(() => {
    const valid = records.filter((r) => r.status === 'valid').length;
    const expiringSoon = records.filter((r) => r.status === 'expiring_soon').length;
    const expired = records.filter((r) => r.status === 'expired').length;
    const notAvailable = records.filter((r) => r.status === 'not_available').length;
    const total = records.length;
    return {
      total,
      valid,
      expiringSoon,
      expired,
      notAvailable,
      validPct: total > 0 ? Math.round((valid / total) * 100) : 0,
      expiringPct: total > 0 ? Math.round((expiringSoon / total) * 100) : 0,
      expiredPct: total > 0 ? Math.round((expired / total) * 100) : 0,
      naPct: total > 0 ? Math.round((notAvailable / total) * 100) : 0
    };
  });

  const filteredRecords = $derived(
    statusFilter === 'all' ? records : records.filter((r) => r.status === statusFilter)
  );

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'valid', label: 'Valid' },
    { id: 'expiring_soon', label: 'Expiring Soon' },
    { id: 'expired', label: 'Expired' },
    { id: 'not_available', label: 'N/A' }
  ];
</script>

<FeatureGate feature={Features.PUCC}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader title="Pollution (PUC)" description="Fleet-wide PUC certificate status">
        <Button
          variant="default"
          onclick={() => sheetStore.openSheet(PollutionCertificateForm, m.pollution_add_action())}
        >
          <LabelWithIcon icon={CirclePlus} label={m.pollution_add_action()} />
        </Button>
      </PageHeader>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Car}
          label="Total"
          value={loading ? '...' : stats.total}
          color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
        />
        <StatCard
          icon={BadgeCheck}
          label="Valid"
          value={loading ? '...' : `${stats.valid} (${stats.validPct}%)`}
          color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
        />
        <StatCard
          icon={Timer}
          label="Expiring Soon"
          value={loading ? '...' : `${stats.expiringSoon} (${stats.expiringPct}%)`}
          color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
        />
        <StatCard
          icon={AlertTriangle}
          label="Expired"
          value={loading ? '...' : `${stats.expired} (${stats.expiredPct}%)`}
          color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
        />
      </div>

      <!-- Filter Tabs -->
      <FilterTabs {tabs} bind:value={statusFilter} />

      <!-- Records Table -->
      {#if loading}
        <div class="text-muted-foreground py-8 text-center">Loading PUC status...</div>
      {:else if filteredRecords.length === 0}
        <div class="text-muted-foreground py-8 text-center">No PUC records found</div>
      {:else}
        <div class="bg-card overflow-hidden rounded-xl border">
          <Table.Root>
            <Table.Header>
              <Table.Row class="bg-secondary/50 hover:bg-secondary/50">
                <Table.Head>Vehicle</Table.Head>
                <Table.Head>Reg. No.</Table.Head>
                <Table.Head>PUC No.</Table.Head>
                <Table.Head>Expiry</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each filteredRecords as record (record.vehicleId)}
                <Table.Row>
                  <Table.Cell class="font-medium">{record.vehicleName}</Table.Cell>
                  <Table.Cell class="text-muted-foreground">
                    {record.licensePlate ?? '--'}
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground">
                    {record.certificateNumber ?? '--'}
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground">
                    {record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : '--'}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusPill status={record.status} />
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}

      <!-- Bottom CTA -->
      <CtaBanner
        heading="Keep your vehicles compliant"
        description="Keep your PUC certificates updated to avoid penalties and ensure a cleaner environment."
        buttonLabel={m.pollution_add_action()}
        buttonIcon={CirclePlus}
        onButtonClick={() =>
          sheetStore.openSheet(PollutionCertificateForm, m.pollution_add_action())}
      />
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">{feature_pucc_disabled_title()}</p>
        <p class="text-muted-foreground text-sm">{feature_pucc_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
