<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion';
  import * as Separator from '$ui/separator';

  interface Props {
    title: string;
    description?: string;
    children: () => any;
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

  <Accordion.Root type="multiple" class="w-full ps-4">
    {@render children()}
  </Accordion.Root>
</div>
