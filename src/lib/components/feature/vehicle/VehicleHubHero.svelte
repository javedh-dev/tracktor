<script lang="ts">
  import Copy from '@lucide/svelte/icons/copy';
  import Gauge from '@lucide/svelte/icons/gauge';
  import Rabbit from '@lucide/svelte/icons/rabbit';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Badge from '$ui/badge/badge.svelte';
  import { toast } from 'svelte-sonner';
  import { getFuelTypeLabel, getVehicleTypeIcon, getVehicleTypeLabel } from '$lib/domain/vehicle';
  import { formatDistance, formatMileage } from '$lib/helper/format.helper';
  import type { VehicleHubSummary } from '$lib/domain/vehicle';
  import * as m from '$lib/paraglide/messages';
  import VehicleImage from './VehicleImage.svelte';

  interface Props {
    vehicle: VehicleHubSummary;
  }

  let { vehicle }: Props = $props();

  const fuelLabel = $derived(getFuelTypeLabel(vehicle.fuelType ?? 'petrol', m));
  const vehicleTypeLabel = $derived(getVehicleTypeLabel(vehicle.vehicleType ?? 'car', m));
  const VehicleTypeIcon = $derived(getVehicleTypeIcon(vehicle.vehicleType ?? 'car'));

  // Overall status pill: attention if either compliance record has lapsed, active once both are
  // valid, hidden entirely when there's not enough data yet to say either way.
  const overallStatus = $derived.by(() => {
    if (vehicle.insuranceValidityStatus === 'expired' || vehicle.puccValidityStatus === 'expired') {
      return { label: 'Needs Attention', dot: 'bg-amber-500' };
    }
    if (vehicle.insuranceValidityStatus === 'valid' && vehicle.puccValidityStatus === 'valid') {
      return { label: 'Active', dot: 'bg-emerald-500' };
    }
    return null;
  });

  const stats = $derived([
    {
      icon: Gauge,
      color: 'bg-gradient-to-br from-violet-400 to-violet-600',
      value: vehicle.currentOdometer ? formatDistance(vehicle.currentOdometer) : '--',
      label: m.vehicle_hub_stat_odometer()
    },
    {
      icon: Rabbit,
      color: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      value: vehicle.overallMileage
        ? formatMileage(vehicle.overallMileage, vehicle.fuelType)
        : '--',
      label: m.vehicle_hub_stat_mileage()
    },
    {
      icon: Fuel,
      color: 'bg-gradient-to-br from-amber-400 to-amber-600',
      value: vehicle.totalFuelLogs ?? 0,
      label: m.vehicle_hub_stat_fuel_logs()
    },
    {
      icon: Wrench,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      value: vehicle.totalMaintenanceLogs ?? 0,
      label: m.vehicle_hub_stat_maintenance_logs()
    }
  ]);

  function copyPlate() {
    if (!vehicle.licensePlate) return;
    navigator.clipboard.writeText(vehicle.licensePlate);
    toast.success(m.vehicle_hub_plate_copied());
  }
</script>

<div id="vehicle-hub-hero" class="bg-card rounded-2xl border">
  <div class="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
    <div class="relative h-full overflow-hidden rounded-l-2xl md:col-span-5">
      <VehicleImage image={vehicle.image} class="h-full w-full object-cover" />
      <div
        class="to-card pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-linear-to-r from-transparent mask-[linear-gradient(to_right,transparent,black)] backdrop-blur-xl md:block"
      ></div>
    </div>

    <div class="flex flex-col gap-8 p-4 sm:p-6 md:col-span-7">
      <div class="flex flex-col">
        <div class="flex flex-row items-center gap-4">
          <div class="bg-accent rounded-xl p-2">
            <VehicleTypeIcon style={`color: ${vehicle.color}`} />
          </div>
          <h1 class="text-2xl font-bold sm:text-3xl">
            {vehicle.make}
            {vehicle.model}
          </h1>
        </div>

        {#if vehicle.licensePlate}
          <button
            type="button"
            onclick={copyPlate}
            class="bg-secondary hover:bg-secondary/70 mt-3 inline-flex w-fit items-center gap-2 rounded-md px-2.5 py-1 font-mono text-sm font-semibold transition-colors"
          >
            {vehicle.licensePlate}
            <Copy class="text-muted-foreground size-3.5" />
          </button>
        {/if}

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <div class="flex flex-row items-center gap-1">
              {vehicleTypeLabel}
            </div>
          </Badge>
          <Badge variant="secondary">{vehicle.year}</Badge>
          <Badge variant="secondary">{fuelLabel}</Badge>
          {#if overallStatus}
            <Badge variant="secondary" class="gap-1.5">
              <span class="size-1.5 rounded-full {overallStatus.dot}"></span>
              {overallStatus.label}
            </Badge>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        {#each stats as stat (stat.label)}
          <div class="bg-muted/40 flex items-center gap-3 rounded-xl border p-2">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg {stat.color}">
              <stat.icon class="size-5 text-white" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-lg leading-tight font-bold tabular-nums">{stat.value}</p>
              <p class="text-muted-foreground truncate text-xs">{stat.label}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
