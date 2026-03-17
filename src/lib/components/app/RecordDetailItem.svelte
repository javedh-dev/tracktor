<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    icon: Component<{ class?: string }>;
    label: string;
    value?: string | number | null;
    class?: string;
    iconClass?: string;
    labelClass?: string;
    valueClass?: string;
    children?: Snippet;
  }

  let {
    icon: Icon,
    label,
    value = null,
    class: className = '',
    iconClass = 'h-5 w-5',
    labelClass = 'font-semibold',
    valueClass = '',
    children
  }: Props = $props();
</script>

<div class={cn('flex items-center gap-2', className)}>
  <Icon class={iconClass} />
  <span class={labelClass}>{label}:</span>
  {#if children}
    {@render children()}
  {:else}
    <span class={valueClass}>{value ?? '-'}</span>
  {/if}
</div>
