<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import DonutChart from '$dashboard/DonutChart.svelte';
  import ProgressRing from '$dashboard/ProgressRing.svelte';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import Car from '@lucide/svelte/icons/car';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Route from '@lucide/svelte/icons/route';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import Bell from '@lucide/svelte/icons/bell';
  import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
  import ChartBar from '@lucide/svelte/icons/chart-bar';
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import VehicleCard from '$feature/vehicle/VehicleCard.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import { env } from '$lib/config/env';

  onMount(() => {
    dashboardStore.fetchSummary();
  });

  const summary = $derived(dashboardStore.summary);
  const loading = $derived(dashboardStore.loading);

  const greeting = $derived.by(() => {
    if (!authStore.user?.username) return 'Welcome';
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeGreeting}, ${authStore.user.username}`;
  });

  const expenseDonutData = $derived(
    summary
      ? [
          { name: 'Fuel', value: summary.expenseBreakdown.fuel, color: 'var(--chart-1)' },
          { name: 'Maintenance', value: summary.expenseBreakdown.maintenance, color: 'var(--chart-2)' },
          { name: 'Insurance', value: summary.expenseBreakdown.insurance, color: 'var(--chart-3)' }
        ].filter((d) => d.value > 0)
      : []
  );

  const puccDonutData = $derived(
    summary
      ? [
          { name: 'Valid', value: summary.puccStatus.valid, color: 'var(--chart-1)' },
          { name: 'Expiring Soon', value: summary.puccStatus.expiringSoon, color: 'var(--chart-4)' },
          { name: 'Expired', value: summary.puccStatus.expired, color: 'var(--chart-5)' },
          { name: 'N/A', value: summary.puccStatus.notAvailable, color: 'var(--muted)' }
        ].filter((d) => d.value > 0)
      : []
  );

  const healthPercentage = $derived(
    summary && summary.totalVehicles > 0
      ? Math.round((summary.vehicleHealth.good / summary.totalVehicles) * 100)
      : 0
  );

  const totalExpenses = $derived(summary?.totalExpenses ?? 0);
  const totalFuelUsed = $derived(summary?.totalFuelUsed ?? 0);
  const totalDistance = $derived(summary?.totalDistance ?? 0);
  const totalVehicles = $derived(vehicleStore.vehicles?.length ?? 0);
</script>

<div class="min-h-full space-y-6">
  <PageHeader title="Dashboard" description={greeting}>
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(VehicleForm, m.app_add_vehicle())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.app_add_vehicle()} />
    </Button>
  </PageHeader>

  <!-- Stat Cards -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      icon={Car}
      label="Total Vehicles"
      value={totalVehicles}
      color="bg-blue-500/10 text-blue-500"
    />
    <StatCard
      icon={Route}
      label="Total Distance"
      value={loading ? '...' : totalDistance > 0 ? `${(totalDistance / 1000).toFixed(1)}k km` : '--'}
      color="bg-violet-500/10 text-violet-500"
    />
    <StatCard
      icon={Fuel}
      label="Total Fuel Used"
      value={loading ? '...' : totalFuelUsed > 0 ? `${totalFuelUsed.toFixed(1)} L` : '--'}
      color="bg-green-500/10 text-green-500"
    />
    <StatCard
      icon={DollarSign}
      label="Total Expenses"
      value={loading ? '...' : totalExpenses > 0 ? `$${totalExpenses.toFixed(2)}` : '--'}
      color="bg-amber-500/10 text-amber-500"
    />
  </div>

  <!-- Charts Row -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Fuel Consumption placeholder -->
    <div class="bg-secondary lg:bg-background/50 flex h-64 items-center justify-center rounded-lg">
      <p class="text-muted-foreground text-sm">Fuel Consumption Chart</p>
    </div>

    <!-- Expenses Donut -->
    <DonutChart
      data={expenseDonutData}
      title="Expenses Overview"
      loading={loading}
      height={280}
    />
  </div>

  <!-- My Vehicles & Health Section -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- My Vehicles -->
    <div class="bg-card rounded-xl border p-4 lg:col-span-2">
      <h3 class="mb-4 text-lg font-semibold">My Vehicles</h3>
      {#if vehicleStore.vehicles && vehicleStore.vehicles.length > 0}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {#each vehicleStore.vehicles as vehicle (vehicle.id)}
            <VehicleCard {vehicle} onclick={() => vehicleStore.selectedId = vehicle.id} />
          {/each}
          <Button
            variant="dashed"
            class="border-muted-foreground/30 text-muted-foreground hover:text-foreground flex h-full min-h-[120px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed"
            onclick={() => sheetStore.openSheet(VehicleForm, m.app_add_vehicle())}
          >
            <LabelWithIcon icon={CirclePlus} label={m.app_add_vehicle()} />
          </Button>
        </div>
      {:else}
        <div class="text-muted-foreground flex h-40 items-center justify-center">
          No vehicles yet
        </div>
      {/if}
    </div>

    <!-- Vehicle Health & PUC Status -->
    <div class="space-y-6">
      <!-- Vehicle Health -->
      <div class="bg-card rounded-xl border p-4">
        <h3 class="mb-4 text-lg font-semibold">Vehicle Health</h3>
        <div class="flex flex-col items-center gap-4">
          <ProgressRing
            value={healthPercentage}
            size={140}
            strokeWidth={12}
            label="Overall Health"
          />
          {#if summary}
            <div class="w-full space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2">
                  <span class="bg-green-500 inline-block size-2.5 rounded-full"></span>
                  Good
                </span>
                <span class="font-medium">{summary.vehicleHealth.good}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2">
                  <span class="bg-amber-500 inline-block size-2.5 rounded-full"></span>
                  Attention
                </span>
                <span class="font-medium">{summary.vehicleHealth.attention}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2">
                  <span class="bg-red-500 inline-block size-2.5 rounded-full"></span>
                  Needs Action
                </span>
                <span class="font-medium">{summary.vehicleHealth.needsAction}</span>
              </div>
            </div>
          {:else}
            <div class="text-muted-foreground h-20 text-sm">Loading...</div>
          {/if}
        </div>
      </div>

      <!-- PUC Status -->
      <div class="bg-card rounded-xl border p-4">
        <h3 class="mb-4 text-lg font-semibold">PUC Status</h3>
        <DonutChart
          data={puccDonutData}
          loading={loading}
          height={200}
          innerRadius={50}
        />
      </div>
    </div>
  </div>

  <!-- Upcoming Reminders -->
  <div class="bg-card rounded-xl border p-4">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold">Upcoming Reminders</h3>
      <Button variant="ghost" size="sm" onclick={() => goto('/reminders')}>
        View All
      </Button>
    </div>
    {#if summary && summary.upcomingReminders.length > 0}
      <div class="divide-y">
        {#each summary.upcomingReminders.slice(0, 5) as reminder (reminder.id)}
          <div class="flex items-center gap-4 py-3">
            <Bell class="text-muted-foreground size-4 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {reminder.vehicleName}
                {#if reminder.vehiclePlate}
                  <span class="text-muted-foreground">({reminder.vehiclePlate})</span>
                {/if}
              </p>
              <p class="text-muted-foreground truncate text-xs">{reminder.note || reminder.type}</p>
            </div>
            <StatusPill
              status={reminder.daysUntilDue <= 7 ? 'expiring_soon' : reminder.daysUntilDue <= 0 ? 'expired' : 'valid'}
              label={reminder.daysUntilDue === 0 ? 'Today' : `in ${reminder.daysUntilDue}d`}
            />
          </div>
        {/each}
      </div>
    {:else if loading}
      <div class="text-muted-foreground py-4 text-sm">Loading reminders...</div>
    {:else}
      <div class="text-muted-foreground py-4 text-sm">No upcoming reminders</div>
    {/if}
  </div>

  <!-- Bottom CTA -->
  <div class="bg-primary/5 border-primary/20 flex items-center justify-between rounded-xl border p-6">
    <div>
      <h3 class="text-lg font-semibold">Get detailed insights</h3>
      <p class="text-muted-foreground text-sm">View comprehensive reports and analytics for your fleet</p>
    </div>
    <Button variant="default" onclick={() => goto('/reports')} class="shrink-0">
      <LabelWithIcon icon={ChartBar} label="View Reports" />
    </Button>
  </div>
</div>
