<script lang="ts">
  import { goto } from '$app/navigation';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import Button from '$ui/button/button.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import { formatDate } from '$lib/helper/format.helper';
  import FuelLogForm from '../fuel/FuelLogForm.svelte';
  import MaintenanceForm from '../maintenance/MaintenanceForm.svelte';
  import type { VehicleHubSummary } from '$lib/domain/vehicle';
  import * as m from '$lib/paraglide/messages';
  import { ACCENT } from '$lib/helper/accent-color.helper';

  interface Props {
    vehicle: VehicleHubSummary;
  }

  let { vehicle }: Props = $props();
  const vehicleId = $derived(vehicle.id ?? '');

  const links = $derived([
    {
      id: 'fuel',
      feature: Features.FUEL_LOG,
      icon: Fuel,
      label: m.nav_fuel_logs(),
      subtitle: m.vehicle_hub_records_count({ count: vehicle.totalFuelLogs ?? 0 }),
      href: `/fuel?vehicle=${vehicleId}`,
      dotClass: ACCENT.moss.chip,
      addAriaLabel: m.vehicle_action_add_fuel_log(),
      onAdd: () =>
        sheetStore.openSheet(FuelLogForm, m.vehicle_action_add_fuel_log(), '', { vehicleId })
    },
    {
      id: 'maintenance',
      feature: Features.MAINTENANCE,
      icon: Wrench,
      label: m.nav_maintenance(),
      subtitle: m.vehicle_hub_records_count({ count: vehicle.totalMaintenanceLogs ?? 0 }),
      href: `/maintenance?vehicle=${vehicleId}`,
      dotClass: ACCENT.ochre.chip,
      addAriaLabel: m.vehicle_action_add_maintenance_log(),
      onAdd: () =>
        sheetStore.openSheet(MaintenanceForm, m.vehicle_action_add_maintenance_log(), '', {
          vehicleId
        })
    },
    {
      id: 'compliance',
      feature: Features.COMPLIANCE,
      icon: Shield,
      label: m.nav_compliance(),
      subtitle: vehicle.insuranceValidTill
        ? m.vehicle_hub_valid_till({ date: formatDate(vehicle.insuranceValidTill) })
        : m.vehicle_details_not_available(),
      href: `/compliance?vehicle=${vehicleId}`,
      dotClass: ACCENT.teal.chip
    },
    {
      id: 'reminders',
      feature: Features.REMINDERS,
      icon: BellRing,
      label: m.nav_reminders(),
      subtitle: m.vehicle_hub_upcoming_count({ count: vehicle.upcomingRemindersCount ?? 0 }),
      href: `/reminders?vehicle=${vehicleId}`,
      dotClass: ACCENT.plum.chip
    }
  ]);
</script>

<div id="vehicle-hub-feature-links" class="bg-card h-fit space-y-3 rounded-xl border p-4">
  <div class="mb-4">
    <h2 class="text-lg font-semibold">{m.vehicle_hub_manage_title()}</h2>
    <div class="bg-primary mt-2 h-0.5 w-10 rounded-full"></div>
  </div>

  {#each links as link (link.id)}
    <FeatureGate feature={link.feature}>
      <div class="bg-muted/40 flex items-center justify-between gap-3 rounded-xl border p-2">
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-3 text-left"
          onclick={() => goto(link.href)}
        >
          <div
            class={`flex size-10 shrink-0 items-center justify-center rounded-lg ${link.dotClass}`}
          >
            <link.icon class="size-4" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{link.label}</p>
            <p class="text-muted-foreground truncate text-xs">{link.subtitle}</p>
          </div>
        </button>
        <div class="flex shrink-0 items-center gap-1.5">
          <Button variant="outline" size="sm" onclick={() => goto(link.href)}>
            {link.onAdd ? m.common_view() : m.vehicle_hub_view_details()}
          </Button>
          {#if link.onAdd}
            <Button size="sm" onclick={link.onAdd} aria-label={link.addAriaLabel}>
              <CirclePlus class="size-4" />
              {m.common_add()}
            </Button>
          {/if}
          <button
            type="button"
            class="hover:bg-secondary flex size-8 shrink-0 items-center justify-center rounded-md"
            onclick={() => goto(link.href)}
            aria-label={link.label}
          >
            <ChevronRight class="text-muted-foreground size-4" />
          </button>
        </div>
      </div>
    </FeatureGate>
  {/each}
</div>
