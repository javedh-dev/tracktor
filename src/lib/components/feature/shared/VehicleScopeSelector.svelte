<script lang="ts">
  import * as DropdownMenu from '$ui/dropdown-menu/index.js';
  import { Button } from '$ui/button/index.js';
  import Car from '@lucide/svelte/icons/car';
  import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
  import Check from '@lucide/svelte/icons/check';
  import Settings2 from '@lucide/svelte/icons/settings-2';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { cn } from '$lib/utils';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { readVehicleScope, setVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import * as m from '$lib/paraglide/messages';

  const vehicles = $derived(vehicleStore.vehicles ?? []);
  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));

  function vehicleLabel(vehicle: (typeof vehicles)[number]) {
    return `${vehicle.make} ${vehicle.model}`;
  }

  const triggerLabel = $derived(
    scope.isFleet
      ? m.vehicle_scope_all()
      : (scope.vehicle && vehicleLabel(scope.vehicle)) || m.vehicle_scope_all()
  );
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button id="vehicle-scope-trigger" variant="outline" {...props} class="gap-2">
        <Car class="size-4" />
        <span class="max-w-40 truncate">{triggerLabel}</span>
        <ChevronsUpDown class="size-4 opacity-50" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content id="vehicle-scope-menu" align="end" class="min-w-64">
    <DropdownMenu.Item id="vehicle-scope-all" class="gap-2" onclick={() => setVehicleScope()}>
      <Check class={cn('size-4 shrink-0', !scope.isFleet && 'text-transparent')} />
      <span>{m.vehicle_scope_all()}</span>
    </DropdownMenu.Item>
    {#if vehicles.length > 0}
      <DropdownMenu.Separator />
      {#each vehicles as vehicle (vehicle.id)}
        <DropdownMenu.Item
          id="vehicle-scope-{vehicle.id}"
          class="gap-2"
          onclick={() => setVehicleScope(vehicle.id ?? undefined)}
        >
          <Check
            class={cn(
              'size-4 shrink-0',
              (scope.isFleet || scope.vehicleId !== vehicle.id) && 'text-transparent'
            )}
          />
          <div class="flex min-w-0 flex-col">
            <span class="truncate">{vehicleLabel(vehicle)}</span>
            <span class="text-muted-foreground truncate text-xs">
              {vehicle.licensePlate ?? '--'}
            </span>
          </div>
        </DropdownMenu.Item>
      {/each}
    {/if}
    <DropdownMenu.Separator />
    <DropdownMenu.Item id="vehicle-scope-manage" class="gap-2" onclick={() => goto('/vehicles')}>
      <Settings2 class="size-4 shrink-0" />
      <span>{m.vehicle_scope_manage()}</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
