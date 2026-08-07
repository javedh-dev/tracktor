<script lang="ts">
  import type { Component } from 'svelte';
  import { cn } from '$lib/utils';

  interface Trend {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  }

  interface Props {
    icon?: Component<{ class?: string }>;
    label?: string;
    value: string | number;
    trend?: Trend | undefined;
    color?: string;
    /** Render content only — the surrounding card chrome, icon and label are provided by the parent (WidgetCard). */
    bare?: boolean;
  }

  let { icon: Icon, label, value, trend = undefined, color, bare = false }: Props = $props();

  const trendIcon = $derived(
    trend?.direction === 'up' ? '▲' : trend?.direction === 'down' ? '▼' : '–'
  );

  const trendClass = $derived(
    trend?.direction === 'up'
      ? 'bg-success/10 text-success'
      : trend?.direction === 'down'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-muted text-muted-foreground'
  );
</script>

{#snippet trendBadge()}
  {#if trend}
    <span
      class={cn(
        'mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        trendClass
      )}
    >
      <span class="text-[10px] leading-none">{trendIcon}</span>
      <span>{trend.value}</span>
    </span>
  {/if}
{/snippet}

{#if bare}
  <!-- Fills the card body so the value stays centred as the widget's rowSpan changes; tight leading
       keeps label + value inside a 2-row (72px) stat widget. -->
  <div class="flex h-full min-w-0 flex-col justify-center gap-0.5">
    <span
      class="text-foreground truncate text-2xl leading-tight font-bold tracking-tight tabular-nums"
      >{value}</span
    >
    {@render trendBadge()}
  </div>
{:else}
  <div
    class="bg-card text-card-foreground group relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md"
  >
    {#if Icon}
      <div
        class={cn(
          'flex aspect-square h-11 shrink-0 items-center justify-center rounded-xl shadow-lg ring-1 ring-white/10',
          color
        )}
      >
        <Icon class="size-5 text-white drop-shadow-sm" />
      </div>
    {/if}

    <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
      <span
        class="text-muted-foreground truncate text-[11px] font-semibold tracking-[0.08em] uppercase"
        >{label}</span
      >
      <span class="text-foreground truncate text-xl font-bold tracking-tight tabular-nums"
        >{value}</span
      >
      {@render trendBadge()}
    </div>
  </div>
{/if}
