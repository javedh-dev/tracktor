<script lang="ts">
  import * as Tooltip from '$ui/tooltip/index.js';
  import Info from '@lucide/svelte/icons/info';

  interface LegendEntry {
    color: string;
    label: string;
    /** Pre-formatted trailing detail, e.g. "Avg 45.2". */
    detail?: string;
  }

  let { items }: { items: LegendEntry[] } = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        aria-label="Show legend"
        class="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-5 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2"
      >
        <Info class="size-4" />
      </button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content side="bottom" align="end" class="max-w-none flex-col items-stretch gap-1.5">
    {#each items as item (item.label)}
      <div class="flex items-center gap-2 text-xs whitespace-nowrap">
        <span
          class="inline-block size-2 shrink-0 rounded-full"
          style="background-color: {item.color}"
        ></span>
        <span class="font-medium">{item.label}</span>
        {#if item.detail}
          <span class="ml-auto opacity-70">{item.detail}</span>
        {/if}
      </div>
    {/each}
  </Tooltip.Content>
</Tooltip.Root>
