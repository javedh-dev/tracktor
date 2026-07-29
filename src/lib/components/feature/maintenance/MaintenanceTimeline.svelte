<script lang="ts">
  import type { MaintenanceLog } from '$lib/domain';
  import { formatCurrency, formatDate, formatDistance } from '$lib/helper/format.helper';

  let { logs }: { logs: MaintenanceLog[] } = $props();
</script>

{#if logs.length === 0}
  <div class="text-muted-foreground flex h-32 items-center justify-center text-sm">
    No service history yet
  </div>
{:else}
  <ol class="space-y-6">
    {#each logs as log (log.id)}
      <li class="relative flex gap-4 pl-1">
        <div class="flex flex-col items-center">
          <span class="bg-primary size-2.5 shrink-0 rounded-full"></span>
          <span class="bg-border mt-1 w-px flex-1"></span>
        </div>
        <div class="min-w-0 flex-1 pb-1">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-sm font-medium">{log.serviceCenter}</p>
            <span
              class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300"
            >
              Completed
            </span>
          </div>
          <p class="text-muted-foreground text-xs">
            {formatDate(log.date)} · at {formatDistance(log.odometer)}
          </p>
          {#if log.cost}
            <p class="mt-0.5 text-sm font-semibold">{formatCurrency(log.cost)}</p>
          {/if}
        </div>
      </li>
    {/each}
  </ol>
{/if}
