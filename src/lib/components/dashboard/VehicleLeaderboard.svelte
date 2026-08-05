<script lang="ts">
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { cn } from '$lib/utils';

  interface Entry {
    id: string;
    name: string;
    plate: string | null;
    formattedValue: string;
  }

  let {
    entries,
    loading = false,
    emptyLabel = 'No data yet'
  }: {
    entries: Entry[];
    loading?: boolean;
    emptyLabel?: string;
  } = $props();

  const rankClass = (rank: number) =>
    rank === 0
      ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-sm shadow-amber-500/40'
      : rank === 1
        ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 shadow-sm shadow-slate-400/30'
        : rank === 2
          ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-sm shadow-orange-500/30'
          : 'bg-secondary text-muted-foreground';
</script>

{#if loading}
  <div class="space-y-3">
    {#each [0, 1, 2, 3] as i (i)}
      <div class="flex items-center gap-3">
        <Skeleton class="size-6 shrink-0 rounded-full" />
        <Skeleton class="h-4 flex-1" />
        <Skeleton class="h-4 w-14" />
      </div>
    {/each}
  </div>
{:else if entries.length === 0}
  <div class="text-muted-foreground flex h-full items-center justify-center text-sm">
    {emptyLabel}
  </div>
{:else}
  <div class="divide-y">
    {#each entries as entry, i (entry.id)}
      <div
        class="hover:bg-muted/40 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors"
      >
        <span
          class={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            rankClass(i)
          )}
        >
          {i + 1}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{entry.name}</p>
          {#if entry.plate}
            <p class="text-muted-foreground truncate text-xs">{entry.plate}</p>
          {/if}
        </div>
        <span class="font-mono text-sm font-medium tabular-nums">{entry.formattedValue}</span>
      </div>
    {/each}
  </div>
{/if}
