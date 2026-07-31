<script lang="ts">
  import StatCard from '$dashboard/StatCard.svelte';
  import Gauge from '@lucide/svelte/icons/gauge';
  import Rabbit from '@lucide/svelte/icons/rabbit';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import { formatDistance, formatMileage } from '$lib/helper/format.helper';
  import type { Vehicle } from '$lib/domain';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    vehicle: Vehicle & {
      currentOdometer?: number | null;
      overallMileage?: number | null;
      totalFuelLogs?: number;
      totalMaintenanceLogs?: number;
    };
  }

  let { vehicle }: Props = $props();
</script>

<div id="vehicle-hub-stats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard
    icon={Gauge}
    label={m.vehicle_hub_stat_odometer()}
    value={vehicle.currentOdometer ? formatDistance(vehicle.currentOdometer) : '--'}
    color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
  />
  <StatCard
    icon={Rabbit}
    label={m.vehicle_hub_stat_mileage()}
    value={vehicle.overallMileage ? formatMileage(vehicle.overallMileage, vehicle.fuelType) : '--'}
    color="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
  />
  <StatCard
    icon={Fuel}
    label={m.vehicle_hub_stat_fuel_logs()}
    value={vehicle.totalFuelLogs ?? 0}
    color="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
  />
  <StatCard
    icon={Wrench}
    label={m.vehicle_hub_stat_maintenance_logs()}
    value={vehicle.totalMaintenanceLogs ?? 0}
    color="bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30"
  />
</div>
