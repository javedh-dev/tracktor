<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion';
  import * as Separator from '$ui/separator';
  import type { Snippet } from 'svelte';

  const expandedValues = ['General', 'Units', 'Feature Flags', 'Scheduled delivery', 'Providers'];

  interface Props {
    title: string;
    description?: string;
    children: Snippet;
  }

  let { title, description, children }: Props = $props();
</script>

<div class="space-y-2">
  <div>
    <h2 class="text-primary text-2xl font-semibold">{title}</h2>
    {#if description}
      <p class="text-muted-foreground text-sm">{description}</p>
    {/if}
  </div>
  <Separator.Root class="mb-4" />

  <Accordion.Root type="multiple" value={expandedValues} class="w-full sm:ps-4">
    {@render children()}
  </Accordion.Root>
</div>
