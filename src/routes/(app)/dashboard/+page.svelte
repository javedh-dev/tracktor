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
  import { dashboardStore } from '$stores/dashboard.svelte';
  import { dashboardLayoutStore } from '$stores/dashboard-layout.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import VehicleForm from '$feature/vehicle/VehicleForm.svelte';
  import AddWidgetPanel from '$feature/dashboard/AddWidgetPanel.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import Button from '$ui/button/button.svelte';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';

  onMount(() => {
    dashboardStore.fetchSummary();
    dashboardLayoutStore.fetchLayout();
  });

  const summary = $derived(dashboardStore.summary);
  const loading = $derived(dashboardStore.loading);

  const greeting = $derived.by(() => {
    if (!authStore.user?.username) return 'Welcome';
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeGreeting}, ${authStore.user.username}`;
  });
</script>

<div class="min-h-full space-y-6">
  <PageHeader title="Dashboard" description={greeting}>
    <Button variant="outline" onclick={() => sheetStore.openSheet(AddWidgetPanel, 'Add Widget')}>
      <LabelWithIcon icon={LayoutGrid} label="Add Widget" />
    </Button>
    <Button
      variant="default"
      onclick={() => sheetStore.openSheet(VehicleForm, m.app_add_vehicle())}
    >
      <LabelWithIcon icon={CirclePlus} label={m.app_add_vehicle()} />
    </Button>
  </PageHeader>

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
    heading="Get detailed insights"
    description="View comprehensive reports and analytics for your fleet"
    buttonLabel="View Reports"
    buttonIcon={ChartBar}
    onButtonClick={() => goto('/reports')}
  />
</div>
