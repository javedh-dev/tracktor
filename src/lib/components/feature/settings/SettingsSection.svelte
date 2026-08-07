<script lang="ts">
  import type { Component, Snippet } from 'svelte';

  interface Props {
    id: string;
    icon: Component<{ class?: string }>;
    iconClass?: string;
    title: string;
    description?: string;
    children: Snippet;
  }

  let {
    id,
    icon: Icon,
    iconClass = 'bg-primary/10 text-primary',
    title,
    description,
    children
  }: Props = $props();
</script>

<section {id} data-settings-section={id} class="bg-card scroll-mt-24 rounded-xl border p-4 sm:p-6">
  <div class="mb-4 flex items-start gap-3">
    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg {iconClass}">
      <Icon class="size-5" />
    </span>
    <div class="space-y-0.5">
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if description}
        <p class="text-muted-foreground text-sm">{description}</p>
      {/if}
    </div>
  </div>
  {@render children()}
</section>
