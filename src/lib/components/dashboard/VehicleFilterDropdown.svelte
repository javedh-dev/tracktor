<script lang="ts">
  import * as DropdownMenu from '$ui/dropdown-menu/index.js';
  import { Button } from '$ui/button/index.js';
  import Car from '@lucide/svelte/icons/car';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import Check from '@lucide/svelte/icons/check';
  import type { Vehicle } from '$lib/domain/vehicle';
  import { cn } from '$lib/utils';

  let {
    vehicles,
    selectedIds = $bindable([])
  }: {
    vehicles: Vehicle[];
    selectedIds?: string[];
  } = $props();

  const vehicleLabel = (vehicle: Vehicle) => `${vehicle.make} ${vehicle.model}`;

  const triggerLabel = $derived.by(() => {
    if (selectedIds.length === 0) return 'All Vehicles';
    if (selectedIds.length === 1) {
      const vehicle = vehicles.find((v) => v.id === selectedIds[0]);
      return vehicle ? vehicleLabel(vehicle) : 'All Vehicles';
    }
    return `${selectedIds.length} vehicles`;
  });

  function toggle(vehicleId: string) {
    selectedIds = selectedIds.includes(vehicleId)
      ? selectedIds.filter((id) => id !== vehicleId)
      : [...selectedIds, vehicleId];
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" size="sm" {...props} class="h-7 gap-1.5 px-2.5 text-xs">
        <Car class="size-3.5" />
        <span class="max-w-28 truncate">{triggerLabel}</span>
        <ChevronDown class="size-3.5 opacity-50" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" class="min-w-56">
    <DropdownMenu.Item class="gap-2" onclick={() => (selectedIds = [])}>
      <Check class={cn('size-4 shrink-0', selectedIds.length > 0 && 'text-transparent')} />
      <span>All Vehicles</span>
    </DropdownMenu.Item>
    {#if vehicles.length > 0}
      <DropdownMenu.Separator />
      {#each vehicles as vehicle (vehicle.id)}
        {#if vehicle.id}
          <DropdownMenu.CheckboxItem
            checked={selectedIds.includes(vehicle.id)}
            onCheckedChange={() => toggle(vehicle.id!)}
          >
            {vehicleLabel(vehicle)}
          </DropdownMenu.CheckboxItem>
        {/if}
      {/each}
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
