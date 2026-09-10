<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$dashboard/PageHeader.svelte';
  import DashboardGrid from '$dashboard/DashboardGrid.svelte';
  import WidgetCard from '$dashboard/WidgetCard.svelte';
  import CtaBanner from '$dashboard/CtaBanner.svelte';
  import { WIDGET_REGISTRY } from '$dashboard/widget-registry';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import LayoutGrid from '@lucide/svelte/icons/layout-grid';
  import ChartBar from '@lucide/svelte/icons/chart-bar';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { dashboardLayoutStore } from '$stores/dashboard-layout.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import AddWidgetPanel from '$feature/dashboard/AddWidgetPanel.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import {
    dashboard_add_widget,
    dashboard_title,
    dashboard_good_morning,
    dashboard_good_afternoon,
    dashboard_good_evening,
    dashboard_reset_to_default,
    dashboard_reset_confirm_title,
    dashboard_reset_confirm_message,
    dashboard_reset_confirm_reset,
    dashboard_cta_heading,
    dashboard_cta_description,
    dashboard_cta_button_label
  } from '$lib/paraglide/messages/_index.js';

  let resetDialogOpen = $state(false);

  onMount(() => {
    dashboardStore.fetchSummary();
    dashboardLayoutStore.fetchLayout();
  });

  const summary = $derived(dashboardStore.summary);
  const loading = $derived(dashboardStore.loading);

  const greeting = $derived.by(() => {
    if (!authStore.user?.username) return 'Welcome';
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12
        ? dashboard_good_morning()
        : hour < 18
          ? dashboard_good_afternoon()
          : dashboard_good_evening();
    return `${timeGreeting}, ${authStore.user.username}`;
  });
</script>

<div class="min-h-full space-y-6">
  <PageHeader title={dashboard_title()} description={greeting}>
    <Button variant="outline" onclick={() => (resetDialogOpen = true)}>
      <LabelWithIcon icon={RotateCcw} label={dashboard_reset_to_default()} />
    </Button>
    <Button
      variant="outline"
      onclick={() => sheetStore.openSheet(AddWidgetPanel, dashboard_add_widget())}
    >
      <LabelWithIcon icon={LayoutGrid} label={dashboard_add_widget()} />
    </Button>
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(VehicleForm, m.app_add_vehicle())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.app_add_vehicle()} />
    </Button>
  </PageHeader>

  <DeleteConfirmation
    bind:open={resetDialogOpen}
    icon={RotateCcw}
    title={dashboard_reset_confirm_title()}
    message={dashboard_reset_confirm_message()}
    confirmLabel={dashboard_reset_confirm_reset()}
    onConfirm={() => {
      dashboardLayoutStore.resetToDefault();
      resetDialogOpen = false;
    }}
  />

  <DashboardGrid
    items={dashboardLayoutStore.items}
    onCommit={(items) => dashboardLayoutStore.commitLayout(items)}
  >
    {#snippet children(item)}
      {@const def = WIDGET_REGISTRY[item.type]}
      <WidgetCard
        layout={item}
        title={def.title}
        icon={def.icon}
        iconColor={def.iconColor}
        onRemove={() => dashboardLayoutStore.removeWidget(item.id)}
      >
        <def.component {summary} {loading} {...def.extraProps} />
      </WidgetCard>
    {/snippet}
  </DashboardGrid>

  <!-- Bottom CTA -->
  <CtaBanner
    heading={dashboard_cta_heading()}
    description={dashboard_cta_description()}
    buttonLabel={dashboard_cta_button_label()}
    buttonIcon={ChartBar}
    onButtonClick={() => goto('/reports')}
  />
</div>
