<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import Car from '@lucide/svelte/icons/car';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Route from '@lucide/svelte/icons/route';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import { vehicleStore } from '$stores/vehicle.svelte';

  const totalVehicles = $derived(vehicleStore.vehicles?.length ?? 0);
</script>

<div class="space-y-6">
  <PageHeader title="Dashboard" description="Welcome to your fleet overview" />

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      icon={Car}
      label="Total Vehicles"
      value={totalVehicles}
      color="bg-blue-500/10 text-blue-500"
    />
    <StatCard
      icon={Fuel}
      label="Total Fuel Used"
      value="--"
      color="bg-green-500/10 text-green-500"
    />
    <StatCard
      icon={Route}
      label="Total Distance"
      value="--"
      color="bg-violet-500/10 text-violet-500"
    />
    <StatCard
      icon={DollarSign}
      label="Total Expenses"
      value="--"
      color="bg-amber-500/10 text-amber-500"
    />
  </div>

  <div class="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
    <p>Dashboard charts and widgets coming in Phase 3</p>
  </div>
</div>
