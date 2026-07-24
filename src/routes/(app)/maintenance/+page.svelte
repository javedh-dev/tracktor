<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import Wrench from '@lucide/svelte/icons/wrench';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Gauge from '@lucide/svelte/icons/gauge';
  import ClipboardList from '@lucide/svelte/icons/clipboard-list';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import MaintenenceLogTab from '$feature/maintenance/MaintenenceLogTab.svelte';
  import SearchableSelect from '$appui/SearchableSelect.svelte';
  import Tractor from '@lucide/svelte/icons/tractor';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import { feature_maintenance_disabled_title, feature_maintenance_disabled_hint } from '$lib/paraglide/messages/_index.js';

  onMount(() => {
    if (vehicleStore.selectedId) {
      maintenanceLogStore.refreshMaintenanceLogs();
    }
  });

  const vehicleOptions = $derived(
    vehicleStore.vehicles?.map((v) => ({
      value: v.id,
      label: `${v.make} ${v.model}${v.licensePlate ? ` (${v.licensePlate})` : ''}`
    })) ?? []
  );

  let selectedVehicleId = $state(vehicleStore.selectedId ?? '');

  $effect(() => {
    if (selectedVehicleId && selectedVehicleId !== vehicleStore.selectedId) {
      vehicleStore.selectedId = selectedVehicleId;
      maintenanceStore.refreshMaintenanceLogs();
    }
  });

  const logs = $derived(maintenanceStore.maintenanceLogs ?? []);
  const totalCost = $derived(logs.reduce((sum, l) => sum + (l.cost || 0), 0));
  const totalEntries = $derived(logs.length);
  const latestOdometer = $derived.by(() => {
    if (logs.length === 0) return 0;
    return Math.max(...logs.map((l) => l.odometer || 0));
  });
  const nextServiceOdometer = $derived(latestOdometer > 0 ? latestOdometer + 5000 : 0);
  const selectedVehicle = $derived(
    vehicleStore.vehicles?.find((v) => v.id === selectedVehicleId)
  );
</script>

<FeatureGate feature={Features.MAINTENANCE}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader title="Maintenance" description="Track service history and upcoming maintenance">
        <div class="w-64">
          <SearchableSelect
            options={vehicleOptions}
            name="vehicle"
            bind:value={selectedVehicleId}
            icon={Tractor}
          />
        </div>
      </PageHeader>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wrench}
          label="Total Spent"
          value={totalCost > 0 ? `$${totalCost.toFixed(2)}` : '--'}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={CalendarDays}
          label="Next Service"
          value={nextServiceOdometer > 0 ? `${nextServiceOdometer.toLocaleString()} km` : '--'}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={Gauge}
          label="Latest Odometer"
          value={latestOdometer > 0 ? `${latestOdometer.toLocaleString()} km` : '--'}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          icon={ClipboardList}
          label="Service Records"
          value={totalEntries}
          color="bg-violet-500/10 text-violet-500"
        />
      </div>

      <MaintenenceLogTab />
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">{feature_maintenance_disabled_title()}</p>
        <p class="text-muted-foreground text-sm">{feature_maintenance_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
