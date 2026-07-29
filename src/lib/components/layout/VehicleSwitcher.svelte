<script lang="ts">
  import * as DropdownMenu from '$ui/dropdown-menu/index.js';
  import * as Sidebar from '$ui/sidebar/index.js';
  import { useSidebar } from '$ui/sidebar/index.js';
  import Car from '@lucide/svelte/icons/car';
  import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
  import Check from '@lucide/svelte/icons/check';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import Settings2 from '@lucide/svelte/icons/settings-2';

  import { vehicleStore } from '$stores/vehicle.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';

  const sidebar = useSidebar();

  const vehicles = $derived(vehicleStore.vehicles ?? []);
  const activeVehicle = $derived(
    vehicles.find((v) => v.id === vehicleStore.selectedId) ?? vehicles[0]
  );

  function vehicleName(vehicle: NonNullable<typeof activeVehicle>) {
    return `${vehicle.make} ${vehicle.model}`;
  }

  function openAddVehicle() {
    sheetStore.openSheet(VehicleForm, m.app_add_vehicle());
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    {#if activeVehicle}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class="w-full" data-slot="vehicle-switcher-trigger">
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            data-active={undefined}
            tooltipContent={vehicleName(activeVehicle)}
          >
            <div
              class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg"
            >
              <Car class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{vehicleName(activeVehicle)}</span>
              <span class="text-muted-foreground truncate text-xs">
                {activeVehicle.licensePlate ?? '--'}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </Sidebar.MenuButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
          align="start"
          side={sidebar.isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          <DropdownMenu.Label class="text-muted-foreground text-xs">
            Your Vehicles
          </DropdownMenu.Label>
          {#each vehicles as vehicle (vehicle.id)}
            <DropdownMenu.Item
              class="gap-2 p-2"
              onclick={() => (vehicleStore.selectedId = vehicle.id!)}
            >
              <div class="flex size-6 items-center justify-center rounded-md border">
                <Car class="size-3.5 shrink-0" />
              </div>
              <span class="flex-1 truncate">{vehicleName(vehicle)}</span>
              {#if vehicle.id === activeVehicle.id}
                <Check class="text-muted-foreground size-4 shrink-0" />
              {/if}
            </DropdownMenu.Item>
          {/each}
          <DropdownMenu.Separator />
          <DropdownMenu.Item class="gap-2 p-2" onclick={() => goto('/vehicles')}>
            <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Settings2 class="size-4" />
            </div>
            <span class="text-muted-foreground font-medium">Manage vehicles</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="gap-2 p-2" onclick={openAddVehicle}>
            <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <CirclePlus class="size-4" />
            </div>
            <span class="text-muted-foreground font-medium">{m.app_add_vehicle()}</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else}
      <Sidebar.MenuButton
        size="lg"
        onclick={openAddVehicle}
        data-active={undefined}
        tooltipContent={m.app_add_vehicle()}
      >
        <div
          class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg"
        >
          <CirclePlus class="size-4" />
        </div>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-medium">{m.app_add_vehicle()}</span>
          <span class="text-muted-foreground truncate text-xs">Get started</span>
        </div>
      </Sidebar.MenuButton>
    {/if}
  </Sidebar.MenuItem>
</Sidebar.Menu>
