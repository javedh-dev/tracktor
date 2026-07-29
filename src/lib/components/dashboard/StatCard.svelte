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
      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
      : trend?.direction === 'down'
        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
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
    class="bg-card text-card-foreground group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
  >
    {#if Icon}
      <div
        class={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg ring-1 ring-white/10',
          color
        )}
      >
        <Icon class="size-5 text-white drop-shadow-sm" />
      </div>
    {/if}

    <div class="flex min-w-0 flex-col gap-1">
      <span class="text-muted-foreground text-sm font-medium">{label}</span>
      <span class="text-foreground text-2xl font-bold tracking-tight tabular-nums">{value}</span>
      {@render trendBadge()}
    </div>
  </div>
{/if}
