<script lang="ts">
  import type { LayoutProps } from './$types';
  import * as Sidebar from '$ui/sidebar/index.js';
  import AppSidebar from '$layout/AppSidebar.svelte';
  import AppSheet from '$layout/AppSheet.svelte';
  import ThemeToggle from '$appui/ThemeToggle.svelte';
  import Notifications from '$layout/Notifications.svelte';
  import { configStore } from '$lib/stores/config.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { env } from '$lib/config/env';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import { demo_banner, default_login } from '$lib/paraglide/messages/_index.js';

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

{#if demoMode}
  <div
    id="demo-mode-banner"
    class="demo-mode-banner bg-secondary/95 flex flex-col justify-center p-2 lg:flex-row dark:border-b-amber-900"
  >
    <LabelWithIcon
      icon={TriangleAlert}
      iconClass="h-5 w-5"
      style="text-amber-500 dark:text-amber-700 gap-1 flex-col lg:flex-row text-center lg:text-sm text-xs"
    >
      {demo_banner()}

      {#if !env.DISABLE_AUTH}
        <strong>{default_login()}</strong>
      {/if}
    </LabelWithIcon>
  </div>
{/if}

<Sidebar.SidebarProvider bind:open={sidebarOpen}>
  <AppSidebar />
  <Sidebar.SidebarInset>
    <div id="app-topbar" class="bg-background flex items-center gap-2 border-b px-4 py-2">
      <Sidebar.SidebarTrigger />
      <div class="flex flex-1 items-center justify-end gap-2">
        <Notifications />
        <ThemeToggle />
      </div>
    </div>
    <div id="app-content" class="flex-1">
      {@render children()}
    </div>
  </Sidebar.SidebarInset>
</Sidebar.SidebarProvider>

<AppSheet />
