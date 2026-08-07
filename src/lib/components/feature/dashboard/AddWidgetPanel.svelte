<script lang="ts">
  import { WIDGET_REGISTRY } from '$dashboard/widget-registry';
  import { dashboardLayoutStore } from '$stores/dashboard-layout.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import CirclePlus from '@lucide/svelte/icons/circle-plus';
  import type { WidgetType } from '$lib/domain/dashboard';

  const availableWidgets = $derived(
    dashboardLayoutStore.availableWidgetTypes.map((type) => WIDGET_REGISTRY[type])
  );

  function handleAdd(type: WidgetType) {
    const def = WIDGET_REGISTRY[type];
    dashboardLayoutStore.addWidget(type, def.defaultColSpan, def.defaultRowSpan);
    sheetStore.closeSheet();
  }
</script>

<div class="space-y-2 pt-4">
  {#if availableWidgets.length === 0}
    <p class="text-muted-foreground py-6 text-center text-sm">
      All available widgets are already on your dashboard.
    </p>
  {:else}
    {#each availableWidgets as widget (widget.type)}
      <button
        type="button"
        onclick={() => handleAdd(widget.type)}
        class="hover:border-primary flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium">{widget.title}</p>
          <p class="text-muted-foreground truncate text-xs">{widget.description}</p>
        </div>
        <CirclePlus class="text-muted-foreground size-4 shrink-0" />
      </button>
    {/each}
  {/if}
</div>
