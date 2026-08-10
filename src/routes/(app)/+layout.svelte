<script lang="ts">
  import type { LayoutProps } from './$types';
  import * as Sidebar from '$ui/sidebar/index.js';
  import AppSidebar from '$layout/AppSidebar.svelte';
  import AppSheet from '$layout/AppSheet.svelte';
  import Notifications from '$layout/Notifications.svelte';
  import { configStore } from '$lib/stores/config.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { env } from '$lib/config/env';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import { demo_banner } from '$lib/paraglide/messages/_index.js';

  let { data, children }: LayoutProps = $props();

  let sidebarOpen = $state(true);

  $effect.pre(() => {
    if (data.rawConfigs) {
      configStore.setConfigs(data.rawConfigs);
    }
    if (data.vehicles) {
      vehicleStore.setVehicles(data.vehicles);
    }
    if (data.user) {
      authStore.user = data.user;
      authStore.isLoggedIn = true;
    }
  });

  let demoMode = env.DEMO_MODE;
</script>

<Sidebar.SidebarProvider bind:open={sidebarOpen}>
  <AppSidebar appVersion={data.appVersion} />
  <Sidebar.SidebarInset>
    <div id="app-topbar" class="bg-background flex flex-wrap items-center gap-2 border-y px-4 py-2">
      <Sidebar.SidebarTrigger />
      {#if demoMode}
        <div
          id="demo-mode-banner"
          class="bg-warning/10 text-warning flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        >
          <TriangleAlert class="size-3.5 shrink-0" />
          <span>{demo_banner()}</span>
        </div>
      {/if}
      <div class="flex flex-1 items-center justify-end gap-2">
        <Notifications />
      </div>
    </div>
    <div id="app-content" class="mx-auto w-full flex-1 p-4 lg:container lg:p-6">
      {@render children()}
    </div>
  </Sidebar.SidebarInset>
</Sidebar.SidebarProvider>

<AppSheet />
