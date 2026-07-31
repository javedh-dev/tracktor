<script lang="ts">
  import { goto } from '$app/navigation';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import VehicleHubHero from '$feature/vehicle/VehicleHubHero.svelte';
  import VehicleHubStats from '$feature/vehicle/VehicleHubStats.svelte';
  import VehicleHubFeatureLinks from '$feature/vehicle/VehicleHubFeatureLinks.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const vehicle = $derived(data.vehicle);
</script>

<div class="space-y-6">
  <button
    type="button"
    class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
    onclick={() => goto('/vehicles')}
  >
    <ArrowLeft class="size-4" />
    {m.vehicle_hub_back_to_vehicles()}
  </button>

  <VehicleHubHero {vehicle} />
  <VehicleHubStats {vehicle} />

  <div>
    <h2 class="mb-3 text-lg font-semibold">{m.vehicle_hub_manage_title()}</h2>
    <VehicleHubFeatureLinks vehicleId={vehicle.id ?? ''} />
  </div>
</div>
