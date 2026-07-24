<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import Timer from '@lucide/svelte/icons/timer';
  import Ban from '@lucide/svelte/icons/ban';
  import { apiClient } from '$lib/helper/api.helper';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import { feature_pucc_disabled_title, feature_pucc_disabled_hint } from '$lib/paraglide/messages/_index.js';

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
      <PageHeader title="Pollution (PUC)" description="Fleet-wide PUC certificate status" />

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BadgeCheck}
          label="Valid"
          value={loading ? '...' : `${stats.valid} (${stats.validPct}%)`}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          icon={Timer}
          label="Expiring Soon"
          value={loading ? '...' : `${stats.expiringSoon} (${stats.expiringPct}%)`}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Expired"
          value={loading ? '...' : `${stats.expired} (${stats.expiredPct}%)`}
          color="bg-red-500/10 text-red-500"
        />
        <StatCard
          icon={Ban}
          label="Not Available"
          value={loading ? '...' : `${stats.notAvailable} (${stats.naPct}%)`}
          color="bg-gray-500/10 text-gray-500"
        />
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2">
        {#each tabs as tab}
          <button
            onclick={() => statusFilter = tab.id}
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {statusFilter === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Records Table -->
      {#if loading}
        <div class="text-muted-foreground py-8 text-center">Loading PUC status...</div>
      {:else if filteredRecords.length === 0}
        <div class="text-muted-foreground py-8 text-center">No PUC records found</div>
      {:else}
        <div class="bg-card overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-secondary/50 border-b text-left">
                <th class="px-4 py-3 font-medium">Vehicle</th>
                <th class="px-4 py-3 font-medium">Reg. No.</th>
                <th class="px-4 py-3 font-medium">PUC No.</th>
                <th class="px-4 py-3 font-medium">Expiry</th>
                <th class="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              {#each filteredRecords as record (record.vehicleId)}
                <tr class="hover:bg-secondary/30">
                  <td class="px-4 py-3 font-medium">{record.vehicleName}</td>
                  <td class="text-muted-foreground px-4 py-3">{record.licensePlate ?? '--'}</td>
                  <td class="text-muted-foreground px-4 py-3">{record.certificateNumber ?? '--'}</td>
                  <td class="text-muted-foreground px-4 py-3">
                    {record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : '--'}
                  </td>
                  <td class="px-4 py-3">
                    <StatusPill status={record.status} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
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
