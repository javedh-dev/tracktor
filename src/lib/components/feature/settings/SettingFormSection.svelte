<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion';

  const {
    title,
    subtitle,
    children
  }: { title?: string; subtitle?: string; separator?: boolean; children: () => any } = $props();
</script>

<Accordion.Item value={title} class="m-0 p-0">
  <Accordion.Trigger
    class="hover:text-primary mb-2 items-center rounded-sm py-2 hover:cursor-pointer hover:no-underline"
  >
    <div>
      {#if title}<h3 class="mb-1">{title}</h3>{/if}
      {#if subtitle}<p class="text-muted-foreground text-xs">{subtitle}</p>{/if}
    </div>
  </Accordion.Trigger>
  <Accordion.Content class="flex flex-col gap-4 p-2 text-balance">
    {@render children()}
  </Accordion.Content>
</Accordion.Item>
