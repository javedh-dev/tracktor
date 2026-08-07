<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import DonutChart from '$dashboard/DonutChart.svelte';
  import StackedAreaChart from '$dashboard/StackedAreaChart.svelte';
  import FleetChartPlaceholder from '$feature/overview/FleetChartPlaceholder.svelte';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import DetailedReportTable from '$feature/reports/DetailedReportTable.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { formatCurrency } from '$lib/helper/format.helper';
  import { ACCENT } from '$lib/helper/accent-color.helper';
  import type { VehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { onMount } from 'svelte';
  import {
    reports_page_title,
    reports_page_description,
    reports_section_costs,
    reports_section_details,
    reports_stat_fuel_costs,
    reports_stat_maintenance_costs,
    reports_stat_compliance_costs,
    reports_chart_breakdown_title,
    reports_chart_trend_title,
    reports_chart_trend_unavailable
  } from '$lib/paraglide/messages/_index.js';

  onMount(() => {
    dashboardStore.fetchSummary();
  });

  const summary = $derived(dashboardStore.summary);
  const loading = $derived(dashboardStore.loading);

  function scopedCosts(scope: VehicleScope) {
    if (!summary) return null;
    if (scope.isFleet) {
      return {
        fuel: summary.expenses.breakdown.fuel,
        maintenance: summary.expenses.breakdown.maintenance,
        compliance: summary.expenses.breakdown.compliance
      };
    }
    const vehicle = summary.vehicles.find((v) => v.id === scope.vehicleId);
    if (!vehicle) return null;
    return {
      fuel: vehicle.totalFuelCost,
      maintenance: vehicle.totalMaintenanceCost,
      compliance: vehicle.totalComplianceCost
    };
  }

  function costDonutData(costs: { fuel: number; maintenance: number; compliance: number } | null) {
    if (!costs) return [];
    return [
      { name: 'Fuel', value: costs.fuel, color: 'var(--chart-1)' },
      { name: 'Maintenance', value: costs.maintenance, color: 'var(--chart-2)' },
      { name: 'Compliance', value: costs.compliance, color: 'var(--chart-3)' }
    ].filter((d) => d.value > 0);
  }
</script>

<FeaturePageShell title={reports_page_title()} description={reports_page_description()}>
  {#snippet children(scope)}
    {@const costs = scopedCosts(scope)}
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">{reports_section_costs()}</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Fuel}
          label={reports_stat_fuel_costs()}
          value={loading ? '...' : costs ? formatCurrency(costs.fuel) : '--'}
          color={ACCENT.moss.gradient}
        />
        <StatCard
          icon={Wrench}
          label={reports_stat_maintenance_costs()}
          value={loading ? '...' : costs ? formatCurrency(costs.maintenance) : '--'}
          color={ACCENT.denim.gradient}
        />
        <StatCard
          icon={Shield}
          label={reports_stat_compliance_costs()}
          value={loading ? '...' : costs ? formatCurrency(costs.compliance) : '--'}
          color={ACCENT.ochre.gradient}
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div class="bg-card col-span-5 h-72 rounded-2xl border p-4">
          <DonutChart
            bare
            data={costDonutData(costs)}
            title={reports_chart_breakdown_title()}
            {loading}
          />
        </div>
        <div class="bg-card col-span-7 h-72 rounded-2xl border p-4 pb-8">
          {#if scope.isFleet}
            <StackedAreaChart
              bare
              data={summary?.expenses.monthlyTrend ?? []}
              title={reports_chart_trend_title()}
              {loading}
            />
          {:else}
            <FleetChartPlaceholder
              bare
              title={reports_chart_trend_title()}
              message={reports_chart_trend_unavailable()}
            />
          {/if}
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">{reports_section_details()}</h2>
      <DetailedReportTable />
    </section>
  {/snippet}
</FeaturePageShell>
