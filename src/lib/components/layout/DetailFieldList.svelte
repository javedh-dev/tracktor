<script lang="ts">
  import type { Component } from 'svelte';

  interface Field {
    label: string;
    value: string;
    icon?: Component<{ class?: string }>;
    /** Stacks label above value instead of an inline row; use for values that can run long. */
    full?: boolean;
  }

  let { fields }: { fields: Field[] } = $props();
</script>

<dl class="flex flex-col divide-y text-sm">
  {#each fields as field (field.label)}
    <div
      class="py-2 first:pt-0 last:pb-0 {field.full ? '' : 'flex items-start justify-between gap-4'}"
    >
      <dt class="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm">
        {#if field.icon}
          <field.icon class="h-4 w-4" />
        {/if}
        {field.label}
      </dt>
      <dd
        class="min-w-0 font-medium wrap-break-word whitespace-pre-wrap {field.full
          ? 'mt-1'
          : 'flex-1 text-right'}"
      >
        {field.value}
      </dd>
    </div>
  {/each}
</dl>
