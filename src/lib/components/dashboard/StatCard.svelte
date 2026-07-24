<script lang="ts">
  import type { Component } from 'svelte';
  import { cn } from '$lib/utils';

  interface Trend {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  }

  interface Props {
    icon: Component<{ class?: string }>;
    label: string;
    value: string | number;
    trend?: Trend | undefined;
    color: string;
  }

  let { icon: Icon, label, value, trend = undefined, color }: Props = $props();

  const trendIcon = $derived(
    trend?.direction === 'up' ? '▲' : trend?.direction === 'down' ? '▼' : '–'
  );

  const trendClass = $derived(
    trend?.direction === 'up'
      ? 'text-green-600'
      : trend?.direction === 'down'
        ? 'text-red-600'
        : 'text-muted-foreground'
  );
</script>

<div class="bg-card text-card-foreground flex items-start gap-4 rounded-xl border p-6 shadow-sm">
  <div class={cn('flex size-12 shrink-0 items-center justify-center rounded-full', color)}>
    <Icon class="size-6" />
  </div>

  <div class="flex min-w-0 flex-col gap-0.5">
    <span class="text-muted-foreground text-sm font-medium">{label}</span>
    <span class="text-foreground text-2xl font-bold tracking-tight">{value}</span>
    {#if trend}
      <span class={cn('mt-0.5 inline-flex items-center gap-1 text-xs font-medium', trendClass)}>
        <span class="text-xs">{trendIcon}</span>
        <span>{trend.value}</span>
      </span>
    {/if}
  </div>
</div>
