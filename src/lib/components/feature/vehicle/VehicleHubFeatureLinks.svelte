<script lang="ts">
  import { goto } from '$app/navigation';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Shield from '@lucide/svelte/icons/shield';
  import BadgeCheck from '@lucide/svelte/icons/badge-check';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import IconButton from '$appui/IconButton.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { Features } from '$lib/helper/feature.helper';
  import FuelLogForm from '../fuel/FuelLogForm.svelte';
  import MaintenanceForm from '../maintenance/MaintenanceForm.svelte';
  import InsuranceForm from '../insurance/InsuranceForm.svelte';
  import PollutionCertificateForm from '../pollution/PollutionCertificateForm.svelte';
  import ReminderForm from '../reminder/ReminderForm.svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    vehicleId: string;
  }

  let { vehicleId }: Props = $props();

  const links = $derived([
    {
      id: 'fuel',
      feature: Features.FUEL_LOG,
      icon: Fuel,
      label: m.nav_fuel_logs(),
      href: `/fuel?vehicle=${vehicleId}`,
      dotClass: 'bg-green-500/10 text-green-600 dark:text-green-400',
      addAriaLabel: m.vehicle_action_add_fuel_log(),
      onAdd: () =>
        sheetStore.openSheet(FuelLogForm, m.vehicle_action_add_fuel_log(), '', { vehicleId })
    },
    {
      id: 'maintenance',
      feature: Features.MAINTENANCE,
      icon: Wrench,
      label: m.nav_maintenance(),
      href: `/maintenance?vehicle=${vehicleId}`,
      dotClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      addAriaLabel: m.vehicle_action_add_maintenance_log(),
      onAdd: () =>
        sheetStore.openSheet(MaintenanceForm, m.vehicle_action_add_maintenance_log(), '', {
          vehicleId
        })
    },
    {
      id: 'insurance',
      feature: Features.INSURANCE,
      icon: Shield,
      label: m.nav_insurance(),
      href: `/insurance?vehicle=${vehicleId}`,
      dotClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      addAriaLabel: m.vehicle_action_add_insurance(),
      onAdd: () =>
        sheetStore.openSheet(InsuranceForm, m.vehicle_action_add_insurance(), '', { vehicleId })
    },
    {
      id: 'pollution',
      feature: Features.PUCC,
      icon: BadgeCheck,
      label: m.nav_pollution(),
      href: `/pollution?vehicle=${vehicleId}`,
      dotClass: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
      addAriaLabel: m.vehicle_action_add_pollution(),
      onAdd: () =>
        sheetStore.openSheet(PollutionCertificateForm, m.vehicle_action_add_pollution(), '', {
          vehicleId
        })
    },
    {
      id: 'reminders',
      feature: Features.REMINDERS,
      icon: BellRing,
      label: m.nav_reminders(),
      href: `/reminders?vehicle=${vehicleId}`,
      dotClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      addAriaLabel: m.vehicle_action_add_reminder(),
      onAdd: () =>
        sheetStore.openSheet(ReminderForm, m.vehicle_action_add_reminder(), '', { vehicleId })
    }
  ]);
</script>

<div id="vehicle-hub-feature-links" class="bg-card divide-y rounded-xl border">
  {#each links as link (link.id)}
    <FeatureGate feature={link.feature}>
      <div class="flex items-center justify-between gap-3 p-4">
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
          <span class="truncate text-sm font-medium">{link.label}</span>
        </button>
        <div class="flex shrink-0 items-center gap-1">
          <IconButton
            id="vehicle-hub-add-{link.id}"
            buttonStyles="hover:bg-secondary"
            iconStyles="text-muted-foreground hover:text-foreground"
            icon={CirclePlus}
            onclick={link.onAdd}
            ariaLabel={link.addAriaLabel}
          />
          <button
            type="button"
            class="hover:bg-secondary flex size-8 items-center justify-center rounded-md"
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
