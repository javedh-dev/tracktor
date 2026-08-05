<script lang="ts">
  import type { Snippet } from 'svelte';

  const {
    title,
    subtitle,
    children
  }: {
    title?: string;
    subtitle?: string;
    children: Snippet;
  } = $props();
</script>

<div class="space-y-4 border-t pt-4 first:border-t-0 first:pt-0">
  {#if title}
    <div>
      <h3 class="text-sm font-semibold">{title}</h3>
      {#if subtitle}<p class="text-muted-foreground text-xs">{subtitle}</p>{/if}
    </div>
  {/if}
  {@render children()}
</div>
