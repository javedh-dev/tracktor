<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import StatCard from '$dashboard/StatCard.svelte';
  import Shield from '@lucide/svelte/icons/shield';
  import DollarSign from '@lucide/svelte/icons/dollar-sign';
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import FileText from '@lucide/svelte/icons/file-text';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import InsuranceTab from '$feature/insurance/InsuranceTab.svelte';
  import SearchableSelect from '$appui/SearchableSelect.svelte';
  import Tractor from '@lucide/svelte/icons/tractor';
  import { Features } from '$lib/helper/feature.helper';
  import FeatureGate from '$feature/FeatureGate.svelte';
  import { feature_insurance_disabled_title, feature_insurance_disabled_hint } from '$lib/paraglide/messages/_index.js';

  onMount(() => {
    if (vehicleStore.selectedId) {
      vehicleStore.refreshVehicles();
    }
  });

  const vehicleOptions = $derived(
    vehicleStore.vehicles?.map((v) => ({
      value: v.id,
      label: `${v.make} ${v.model}${v.licensePlate ? ` (${v.licensePlate})` : ''}`
    })) ?? []
  );

  let selectedVehicleId = $state(vehicleStore.selectedId ?? '');

  const selectedVehicle = $derived(
    vehicleStore.vehicles?.find((v) => v.id === selectedVehicleId)
  );
</script>

<FeatureGate feature={Features.INSURANCE}>
  {#snippet children()}
    <div class="space-y-6">
      <PageHeader title="Insurance" description="Manage insurance records">
        <div class="w-64">
          <SearchableSelect
            options={vehicleOptions}
            name="vehicle"
            bind:value={selectedVehicleId}
            icon={Tractor}
          />
        </div>
      </PageHeader>

      <InsuranceTab />
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">{feature_insurance_disabled_title()}</p>
        <p class="text-muted-foreground text-sm">{feature_insurance_disabled_hint()}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
