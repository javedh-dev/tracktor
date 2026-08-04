<script lang="ts">
  import type { Component } from 'svelte';
  import IdCard from '@lucide/svelte/icons/id-card';
  import Fingerprint from '@lucide/svelte/icons/fingerprint';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import FuelIcon from '@lucide/svelte/icons/fuel';
  import Paintbrush from '@lucide/svelte/icons/paintbrush';
  import Shield from '@lucide/svelte/icons/shield';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import StatusPill from '$dashboard/StatusPill.svelte';
  import { formatDate } from '$lib/helper/format.helper';
  import { getFuelTypeLabel, getVehicleTypeIcon, getVehicleTypeLabel } from '$lib/domain/vehicle';
  import type { VehicleHubSummary } from '$lib/domain/vehicle';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    vehicle: VehicleHubSummary;
  }

  let { vehicle }: Props = $props();

  interface InfoRow {
    icon: Component<{ class?: string }>;
    label: string;
    value: string;
    colorDot?: string;
    badge?: { status: 'valid' | 'expired' | 'not_available' };
  }

  const notSpecified = m.vehicle_details_not_specified();

  const leftRows = $derived<InfoRow[]>([
    {
      icon: IdCard,
      label: m.vehicle_details_license_plate(),
      value: vehicle.licensePlate || notSpecified
    },
    { icon: Fingerprint, label: m.vehicle_details_vin(), value: vehicle.vin || notSpecified },
    { icon: CalendarIcon, label: m.vehicle_details_year(), value: String(vehicle.year) },
    {
      icon: FuelIcon,
      label: m.vehicle_details_fuel_type(),
      value: getFuelTypeLabel(vehicle.fuelType ?? 'petrol', m)
    }
  ]);

  const rightRows = $derived<InfoRow[]>([
    {
      icon: Paintbrush,
      label: m.vehicle_details_color(),
      value: vehicle.color || notSpecified,
      colorDot: vehicle.color ?? undefined
    },
    {
      icon: Shield,
      label: m.vehicle_hub_insurance_valid_till(),
      value: vehicle.insuranceValidTill ? formatDate(vehicle.insuranceValidTill) : notSpecified,
      badge: vehicle.insuranceValidityStatus
        ? { status: vehicle.insuranceValidityStatus }
        : undefined
    },
    {
      icon: BadgeCheck,
      label: m.vehicle_hub_pollution_valid_till(),
      value: vehicle.puccValidTill ? formatDate(vehicle.puccValidTill) : notSpecified,
      badge: vehicle.puccValidityStatus ? { status: vehicle.puccValidityStatus } : undefined
    },
    {
      icon: getVehicleTypeIcon(vehicle.vehicleType ?? 'car'),
      label: m.vehicle_hub_vehicle_type(),
      value: getVehicleTypeLabel(vehicle.vehicleType ?? 'car', m)
    }
  ]);

  const customFieldEntries = $derived(Object.entries(vehicle.customFields ?? {}));
</script>

{#snippet row(item: InfoRow)}
  <div class="flex items-center gap-3 border-b py-3 last:border-b-0">
    <span class="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
      <item.icon class="text-muted-foreground size-4" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="text-muted-foreground text-xs">{item.label}</p>
      <div class="flex items-center gap-2">
        {#if item.colorDot}
          <span
            class="size-3 shrink-0 rounded-full border"
            style={`background-color: ${item.colorDot}`}
          ></span>
        {/if}
        <p class="truncate text-sm font-medium">{item.value}</p>
        {#if item.badge}
          <StatusPill status={item.badge.status} />
        {/if}
      </div>
    </div>
  </div>
{/snippet}

<div id="vehicle-hub-details" class="bg-card space-y-4 rounded-xl border p-4">
  <div>
    <h3 class="text-lg font-semibold">{m.vehicle_details_section_title()}</h3>
    <div class="bg-primary mt-2 h-0.5 w-10 rounded-full"></div>
  </div>
  <div class="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
    {#each leftRows as item (item.label)}
      {@render row(item)}
    {/each}
    {#each rightRows as item (item.label)}
      {@render row(item)}
    {/each}
  </div>

  {#if customFieldEntries.length > 0}
    <div>
      <h3 class="text-lg font-semibold">{m.custom_fields_label()}</h3>
      <div class="bg-primary mt-2 h-0.5 w-10 rounded-full"></div>
    </div>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {#each customFieldEntries as [key, value] (key)}
        <div class="space-y-1">
          <p class="text-muted-foreground text-xs capitalize">{key}</p>
          <p class="text-sm">{value}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>
