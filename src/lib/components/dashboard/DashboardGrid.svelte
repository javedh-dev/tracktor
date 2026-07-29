<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { WidgetLayoutItem } from '$lib/domain/dashboard';
  import { ROW_UNIT_PX, widgetGridVars } from './widget-size';
  import { GridInteraction, setGridInteraction } from './grid-interaction.svelte';

  let {
    items,
    onCommit,
    children
  }: {
    items: WidgetLayoutItem[];
    /** Called once per gesture, on drop — never mid-drag. */
    onCommit: (items: WidgetLayoutItem[]) => void;
    children: Snippet<[WidgetLayoutItem]>;
  } = $props();

  const interaction = setGridInteraction(
    new GridInteraction(
      () => items,
      (next) => onCommit(next)
    )
  );

  $effect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const sync = () => (interaction.enabled = mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  });

  const placeholder = $derived(interaction.placeholder);
  const placeholderRect = $derived(interaction.placeholderRect);
</script>

<div
  bind:this={interaction.gridEl}
  data-widget-grid
  class="widget-grid relative grid grid-cols-1 gap-4 lg:grid-cols-12"
  style={`--wg-row-unit: ${ROW_UNIT_PX}px`}
>
  <!-- Only exists at the 12-col breakpoint: below it the grid stacks and colStart/rowStart are
       meaningless, so the placeholder is kept out of the DOM rather than merely hidden.
       The area is held by a hidden grid item (the dragged card itself is out of flow, so without it
       the grid would collapse) while the visible outline is drawn separately in pixels. -->
  {#if placeholder && placeholderRect && interaction.enabled}
    <div class="widget-placeholder-slot" style={widgetGridVars(placeholder)}></div>
    <div
      class="widget-placeholder"
      style={`left: ${placeholderRect.left}px; top: ${placeholderRect.top}px; width: ${placeholderRect.width}px; height: ${placeholderRect.height}px;`}
    ></div>
  {/if}

  {#each interaction.items as item (item.id)}
    {@render children(item)}
  {/each}
</div>

<style>
  /* Stacked below the breakpoint, so rows size to content; the fixed row unit only makes sense
     once colStart/rowStart are actually honoured. */
  .widget-grid {
    grid-auto-rows: auto;
  }

  /* Hold the gesture's cursor across the whole page while the pointer is captured. */
  :global(body.grid-moving) {
    cursor: grabbing;
    user-select: none;
  }

  :global(body.grid-resizing) {
    cursor: nwse-resize;
    user-select: none;
  }

  @media (min-width: 1024px) {
    .widget-grid {
      grid-auto-rows: var(--wg-row-unit);
    }

    /* Reserves the drop area only — paints nothing, so re-flowing it per snap step can't ghost. */
    .widget-placeholder-slot {
      grid-column: var(--wc-col-start) / span var(--wc-col-span);
      grid-row: var(--wc-row-start) / span var(--wc-row-span);
      visibility: hidden;
    }
  }

  /* A hint of where the widget lands, not a second card competing with it — the dragged widget
     itself is the thing the eye should follow. Positioned in pixels against the grid's padding box
     (it has no grid placement, so that is its containing block) and given its own compositing layer,
     so moving it never touches grid layout. */
  .widget-placeholder {
    position: absolute;
    pointer-events: none;
    border-radius: 1rem;
    border: 1px dashed color-mix(in oklch, var(--muted-foreground) 32%, transparent);
    background: color-mix(in oklch, var(--muted-foreground) 4%, transparent);
    will-change: transform;
    transform: translateZ(0);
  }
</style>
