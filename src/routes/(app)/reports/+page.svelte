<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import DonutChart from '$dashboard/DonutChart.svelte';
  import StackedAreaChart from '$dashboard/StackedAreaChart.svelte';
  import FleetChartPlaceholder from '$feature/overview/FleetChartPlaceholder.svelte';
  import FeaturePageShell from '$feature/shared/FeaturePageShell.svelte';
  import DataExportImport from '$feature/data-export-import/DataExportImport.svelte';
  import { Button } from '$ui/button';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import FileText from '@lucide/svelte/icons/file-text';
  import FileDown from '@lucide/svelte/icons/file-down';
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { formatCurrency } from '$lib/helper/format.helper';
  import { exportMaintenanceLogsPdf } from '$lib/services/maintenance.service';
  import type { VehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import { onMount } from 'svelte';
  import {
    reports_page_title,
    reports_page_description,
    reports_section_costs,
    reports_section_exports,
    reports_stat_fuel_costs,
    reports_stat_maintenance_costs,
    reports_stat_insurance_costs,
    reports_chart_breakdown_title,
    reports_chart_trend_title,
    reports_chart_trend_unavailable,
    reports_export_maintenance_title,
    reports_export_maintenance_description,
    reports_export_maintenance_hint,
    reports_export_data_title,
    reports_export_data_description,
    reports_export_action,
    data_export_import_sheet_title,
    data_export_import_sheet_desc
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
        insurance: summary.expenses.breakdown.insurance
      };
    }
    const vehicle = summary.vehicles.find((v) => v.id === scope.vehicleId);
    if (!vehicle) return null;
    return {
      fuel: vehicle.totalFuelCost,
      maintenance: vehicle.totalMaintenanceCost,
      insurance: vehicle.totalInsuranceCost
    };
  }

  function costDonutData(costs: { fuel: number; maintenance: number; insurance: number } | null) {
    if (!costs) return [];
    return [
      { name: 'Fuel', value: costs.fuel, color: 'var(--chart-1)' },
      { name: 'Maintenance', value: costs.maintenance, color: 'var(--chart-2)' },
      { name: 'Insurance', value: costs.insurance, color: 'var(--chart-3)' }
    ].filter((d) => d.value > 0);
  }

  function handleExportMaintenancePdf(scope: VehicleScope) {
    if (!scope.vehicleId) return;
    void exportMaintenanceLogsPdf(scope.vehicleId);
  }

  function openDataExport() {
    sheetStore.openSheet(
      DataExportImport,
      data_export_import_sheet_title(),
      data_export_import_sheet_desc()
    );
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
          color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
        />
        <StatCard
          icon={Wrench}
          label={reports_stat_maintenance_costs()}
          value={loading ? '...' : costs ? formatCurrency(costs.maintenance) : '--'}
          color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
        />
        <StatCard
          icon={Shield}
          label={reports_stat_insurance_costs()}
          value={loading ? '...' : costs ? formatCurrency(costs.insurance) : '--'}
          color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DonutChart
          data={costDonutData(costs)}
          title={reports_chart_breakdown_title()}
          {loading}
          height={300}
        />
        {#if scope.isFleet}
          <StackedAreaChart
            data={summary?.expenses.monthlyTrend ?? []}
            title={reports_chart_trend_title()}
            {loading}
          />
        {:else}
          <FleetChartPlaceholder
            title={reports_chart_trend_title()}
            message={reports_chart_trend_unavailable()}
          />
        {/if}
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold">{reports_section_exports()}</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="bg-card flex flex-col items-center gap-4 rounded-xl border p-8 text-center">
          <FileText class="text-primary size-12" />
          <div>
            <h3 class="font-semibold">{reports_export_maintenance_title()}</h3>
            <p class="text-muted-foreground mt-1 text-sm">
              {reports_export_maintenance_description()}
            </p>
            {#if scope.isFleet}
              <p class="text-muted-foreground mt-1 text-xs italic">
                {reports_export_maintenance_hint()}
              </p>
            {/if}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={scope.isFleet}
            onclick={() => handleExportMaintenancePdf(scope)}
          >
            <LabelWithIcon icon={FileDown} label={reports_export_action()} />
          </Button>
        </div>

        <div class="bg-card flex flex-col items-center gap-4 rounded-xl border p-8 text-center">
          <FileText class="text-primary size-12" />
          <div>
            <h3 class="font-semibold">{reports_export_data_title()}</h3>
            <p class="text-muted-foreground mt-1 text-sm">{reports_export_data_description()}</p>
          </div>
          <Button variant="outline" size="sm" onclick={openDataExport}>
            <LabelWithIcon icon={FileDown} label={reports_export_action()} />
          </Button>
        </div>
      </div>
    </section>
  {/snippet}
</FeaturePageShell>
