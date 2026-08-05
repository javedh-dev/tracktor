<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showLabel?: boolean;
    label?: string;
    children?: Snippet;
  }

  let {
    value,
    size = 120,
    strokeWidth = 10,
    color = 'var(--primary)',
    backgroundColor = 'var(--muted)',
    showLabel = true,
    label = undefined,
    children = undefined
  }: Props = $props();

  const center = $derived(size / 2);
  const radius = $derived(center - strokeWidth / 2);
  const circumference = $derived(2 * Math.PI * radius);

  const dashOffset = $derived(circumference * (1 - Math.min(Math.max(value, 0), 100) / 100));
</script>

<div
  class={cn('relative inline-flex items-center justify-center')}
  style="width: {size}px; height: {size}px;"
  role="progressbar"
  aria-valuenow={Math.min(Math.max(value, 0), 100)}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <svg width={size} height={size} class="-rotate-90">
    <!-- Background ring -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={backgroundColor}
      stroke-width={strokeWidth}
    />

    <!-- Progress ring -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      class="transition-all duration-700 ease-out"
    />
  </svg>

  <!-- Center content -->
  {#if children}
    <div class="absolute inset-0 flex items-center justify-center">
      {@render children()}
    </div>
  {:else if showLabel}
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span
        class="text-foreground text-lg leading-none font-bold"
        style="font-size: {size * 0.22}px;"
      >
        {Math.round(value)}%
      </span>
      {#if label}
        <span class="text-muted-foreground mt-0.5 text-xs leading-none font-medium">
          {label}
        </span>
      {/if}
    </div>
  {/if}
</div>
