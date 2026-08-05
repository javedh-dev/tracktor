<script lang="ts">
  import type { ActivityEntry } from '$lib/domain/dashboard';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { formatCurrency, formatDate } from '$lib/helper/format.helper';

  let {
    entries,
    loading = false
  }: {
    entries: ActivityEntry[];
    loading?: boolean;
  } = $props();
</script>

{#if loading}
  <div class="space-y-3">
    {#each [0, 1, 2, 3] as i (i)}
      <div class="flex items-center gap-3">
        <Skeleton class="size-4 shrink-0 rounded" />
        <Skeleton class="h-4 flex-1" />
        <Skeleton class="h-4 w-14" />
      </div>
    {/each}
  </div>
{:else if entries.length === 0}
  <div class="text-muted-foreground flex h-full items-center justify-center text-sm">
    No recent activity
  </div>
{:else}
  <div class="divide-y">
    {#each entries as entry (entry.id)}
      <div
        class="hover:bg-muted/40 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
      >
        {#if entry.type === 'fuel'}
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"
          >
            <Fuel class="size-4" />
          </span>
        {:else}
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500"
          >
            <Wrench class="size-4" />
          </span>
        {/if}
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{entry.vehicleName}</p>
          <p class="text-muted-foreground truncate text-xs">
            {entry.description} · {formatDate(entry.date)}
          </p>
        </div>
        <span class="font-mono text-sm font-medium tabular-nums">{formatCurrency(entry.cost)}</span>
      </div>
    {/each}
  </div>
{/if}
