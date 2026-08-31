<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import Route from '@lucide/svelte/icons/route';
  import Gauge from '@lucide/svelte/icons/gauge';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { chartStore } from '$stores/chart.svelte';
  import { ACCENT } from '$lib/helper/accent-color.helper';
  import { formatMileage } from '$lib/helper/format.helper';
  import VehicleTrendChart from '$feature/overview/VehicleTrendChart.svelte';
  import FuelLogTab from '$feature/fuel/FuelLogTab.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import {
    feature_fuel_disabled_title,
    feature_fuel_disabled_hint,
    fuel_page_title,
    fuel_page_description,
    fuel_stat_used,
    fuel_stat_spent,
    fuel_stat_avg_mileage,
    fuel_stat_entries,
    widget_fuel_consumption_trend,
    widget_mileage_overview
  } from '$lib/paraglide/messages/_index.js';

  const fuelLogs = $derived(fuelLogStore.fuelLogs ?? []);
  const totalFuelUsed = $derived(fuelLogs.reduce((sum, l) => sum + (l.fuelAmount || 0), 0));
  const totalCost = $derived(fuelLogs.reduce((sum, l) => sum + (l.cost || 0), 0));
  const avgMileage = $derived.by(() => {
    const withMileage = fuelLogs.filter((l) => l.mileage);
    if (withMileage.length === 0) return 0;
    return withMileage.reduce((sum, l) => sum + (l.mileage || 0), 0) / withMileage.length;
  });
  const totalEntries = $derived(fuelLogs.length);
</script>

<FeaturePageShell
  feature={Features.FUEL_LOG}
  title={fuel_page_title()}
  description={fuel_page_description()}
  disabledTitle={feature_fuel_disabled_title()}
  disabledHint={feature_fuel_disabled_hint()}
>
  {#snippet children(_scope)}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Fuel}
        label={fuel_stat_used()}
        value={totalFuelUsed > 0 ? `${totalFuelUsed.toFixed(1)} L` : '--'}
        color={ACCENT.moss.gradient}
      />
      <StatCard
        icon={DollarSign}
        label={fuel_stat_spent()}
        value={totalCost > 0 ? `$${totalCost.toFixed(2)}` : '--'}
        color={ACCENT.ochre.gradient}
      />
      <StatCard
        icon={Gauge}
        label={fuel_stat_avg_mileage()}
        value={avgMileage > 0 ? avgMileage.toFixed(1) : '--'}
        color={ACCENT.denim.gradient}
      />
      <StatCard
        icon={Route}
        label={fuel_stat_entries()}
        value={totalEntries}
        color={ACCENT.plum.gradient}
      />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <VehicleTrendChart
        series={chartStore.fuelAmountByVehicle}
        title={widget_fuel_consumption_trend()}
        loading={fuelLogStore.processing}
        valueFormatter={(value) => `${value.toFixed(1)} L`}
        xFormatter={(v: Date) =>
          v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      />
      <VehicleTrendChart
        series={chartStore.mileageByVehicle}
        title={widget_mileage_overview()}
        loading={fuelLogStore.processing}
        valueFormatter={(value, series) => formatMileage(value, series.fuelType)}
        xFormatter={(v: Date) =>
          v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      />
    </div>

    <FuelLogTab />
  {/snippet}
</FeaturePageShell>
