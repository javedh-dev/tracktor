<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import type { WidgetLayoutItem } from '$lib/domain/dashboard';
  import { widgetGridVars } from './widget-size';
  import { getGridInteraction } from './grid-interaction.svelte';
  import X from '@lucide/svelte/icons/x';

  let {
    layout,
    title,
    icon: Icon,
    iconColor = 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/30',
    draggable = true,
    onRemove,
    children
  }: {
    layout: WidgetLayoutItem;
    title: string;
    icon?: Component<{ class?: string }>;
    iconColor?: string;
    draggable?: boolean;
    onRemove: () => void;
    children: Snippet;
  } = $props();

  const interaction = getGridInteraction();

  let cardEl = $state<HTMLDivElement>();

  const interactive = $derived(draggable && interaction.enabled);
  const active = $derived(interaction.isActive(layout.id));
  const float = $derived(active ? interaction.float : null);

  // While active the card leaves grid flow and is placed in raw pixels, so grid placement has to be
  // cleared — an abs-positioned grid item with a definite area would resolve left/top against that
  // area instead of the grid itself.
  const style = $derived(
    float
      ? `position: absolute; grid-column: auto; grid-row: auto; left: ${float.left}px; top: ${float.top}px; width: ${float.width}px; height: ${float.height}px;`
      : widgetGridVars(layout)
  );

  // FLIP: grid placement isn't animatable, so widgets displaced by a drag are tweened manually from
  // where they were to where they landed. Keyed on the rect so it only runs when the cell changes.
  const rectKey = $derived(
    `${layout.colStart}:${layout.rowStart}:${layout.colSpan}:${layout.rowSpan}`
  );
  let priorPosition: { left: number; top: number } | undefined;

  $effect.pre(() => {
    rectKey;
    float; // keeps the floating card's last painted box fresh, so the drop settles from where it was
    const box = cardEl?.getBoundingClientRect();
    priorPosition = box && { left: box.left, top: box.top };
  });

  $effect(() => {
    rectKey;
    active; // a drop must settle even when the widget lands back in the cell it started from
    if (!cardEl || !priorPosition || active) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const box = cardEl.getBoundingClientRect();
    const dx = priorPosition.left - box.left;
    const dy = priorPosition.top - box.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    cardEl.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
      { duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' }
    );
  });

  function startMove(event: PointerEvent) {
    if (cardEl && interactive) interaction.start('move', layout.id, event, cardEl);
  }

  function startResize(event: PointerEvent) {
    if (cardEl) interaction.start('resize', layout.id, event, cardEl);
  }

  function handleMoveKeys(event: KeyboardEvent) {
    if (!interactive) return;
    switch (event.key) {
      case 'ArrowRight':
        interaction.nudgeMove(layout.id, 1, 0);
        break;
      case 'ArrowLeft':
        interaction.nudgeMove(layout.id, -1, 0);
        break;
      case 'ArrowDown':
        interaction.nudgeMove(layout.id, 0, 1);
        break;
      case 'ArrowUp':
        interaction.nudgeMove(layout.id, 0, -1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handleResizeKeys(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        interaction.nudgeResize(layout.id, 1, 0);
        break;
      case 'ArrowLeft':
        interaction.nudgeResize(layout.id, -1, 0);
        break;
      case 'ArrowDown':
        interaction.nudgeResize(layout.id, 0, 1);
        break;
      case 'ArrowUp':
        interaction.nudgeResize(layout.id, 0, -1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }
</script>

<div
  bind:this={cardEl}
  class={cn(
    'widget-card group/widget bg-card text-card-foreground relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-14px_rgba(0,0,0,0.22)]',
    active
      ? 'ring-primary/40 pointer-events-none z-40 shadow-2xl ring-2 select-none'
      : 'hover:border-foreground/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.32)]'
  )}
  {style}
>
  {#if Icon}
    <!-- Stat layout: one centred row that fills the card, so it stays legible at the 2-row minimum
         (72px) and just gains breathing room — plus a larger icon — as the rowSpan grows. -->
    <div
      role="button"
      tabindex={interactive ? 0 : -1}
      onpointerdown={startMove}
      onkeydown={handleMoveKeys}
      aria-label="Move {title}. Use the arrow keys to reposition it."
      class={`flex h-full min-h-0 items-center gap-3 py-2 pr-9 pl-3 ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div
        class={cn(
          'flex aspect-square h-full max-h-12 min-h-8 shrink-0 items-center justify-center rounded-lg shadow-lg ring-1 ring-white/10',
          iconColor
        )}
      >
        <Icon class="size-1/2 text-white drop-shadow-sm" />
      </div>

      <div class="flex min-w-0 flex-1 flex-col justify-center">
        <h3
          class="text-muted-foreground truncate text-[11px] leading-tight font-semibold tracking-[0.08em] uppercase"
        >
          {title}
        </h3>
        {@render children()}
      </div>
    </div>
  {:else}
    <!-- Fixed header + a body that takes whatever the grid rect leaves over, so the widget reflows
         with its rowSpan instead of sitting content-sized at the top of a taller card. -->
    <div
      role="button"
      tabindex={interactive ? 0 : -1}
      onpointerdown={startMove}
      onkeydown={handleMoveKeys}
      aria-label="Move {title}. Use the arrow keys to reposition it."
      class={`flex shrink-0 items-center px-4 pt-3 pr-9 pb-2 ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <h3
        class="text-muted-foreground min-w-0 flex-1 truncate text-[11px] font-semibold tracking-[0.08em] uppercase"
      >
        {title}
      </h3>
    </div>

    <div class="min-h-0 min-w-0 flex-1 overflow-hidden px-4 pb-4">
      {@render children()}
    </div>
  {/if}

  <!-- Sits outside the drag surface: a real button nested inside a `role="button"` is ambiguous to
       assistive tech, and keeping it out also gives the title back the width it was reserving. -->
  <button
    type="button"
    onclick={onRemove}
    aria-label="Remove {title}"
    class="text-muted-foreground hover:bg-secondary hover:text-destructive absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity group-hover/widget:opacity-100 focus-visible:opacity-100"
  >
    <X class="size-3.5" />
  </button>

  <button
    type="button"
    onpointerdown={startResize}
    onkeydown={handleResizeKeys}
    aria-label="Resize {title}"
    class="text-muted-foreground/60 hover:text-muted-foreground absolute right-0 bottom-0 flex size-5 cursor-nwse-resize items-end justify-end p-1 opacity-0 transition-opacity group-hover/widget:opacity-100 focus-visible:opacity-100"
  >
    <svg viewBox="0 0 12 12" class="size-3" fill="none" aria-hidden="true">
      <path
        d="M11 1 1 11M11 6 6 11"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  </button>
</div>

<style>
  /* Below the 12-col breakpoint the grid stacks to a single column, so colStart/rowStart are ignored. */
  .widget-card {
    grid-column: 1 / -1;
  }

  @media (min-width: 1024px) {
    .widget-card {
      grid-column: var(--wc-col-start) / span var(--wc-col-span);
      grid-row: var(--wc-row-start) / span var(--wc-row-span);
    }
  }
</style>
