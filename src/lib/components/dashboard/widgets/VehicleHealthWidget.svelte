<script lang="ts">
  import ProgressRing from '$dashboard/ProgressRing.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();

  const healthPercentage = $derived(
    summary && summary.fleet.totalVehicles > 0
      ? Math.round((summary.compliance.vehicleHealth.good / summary.fleet.totalVehicles) * 100)
      : 0
  );

  // The ring takes whatever the breakdown list leaves over, so the widget tracks its grid rect
  // instead of overflowing a short card with a fixed 128px circle.
  let ringSpace = $state(0);
  let boxWidth = $state(0);
  const ringSize = $derived(Math.max(56, Math.min(ringSpace, boxWidth, 144)));
</script>

<div bind:clientWidth={boxWidth} class="flex h-full flex-col items-center justify-center gap-3">
  <div bind:clientHeight={ringSpace} class="flex min-h-0 flex-1 items-center justify-center">
    <ProgressRing
      value={healthPercentage}
      size={ringSize}
      strokeWidth={Math.max(6, ringSize * 0.095)}
      label="Overall Health"
    />
  </div>
  {#if summary && !loading}
    <div class="w-full shrink-0 space-y-1.5">
      <div class="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
        <span class="flex items-center gap-2 font-medium">
          <span class="inline-block size-2.5 rounded-full bg-green-500"></span>
          Good
        </span>
        <span class="font-mono font-semibold tabular-nums"
          >{summary.compliance.vehicleHealth.good}</span
        >
      </div>
      <div class="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
        <span class="flex items-center gap-2 font-medium">
          <span class="inline-block size-2.5 rounded-full bg-amber-500"></span>
          Attention
        </span>
        <span class="font-mono font-semibold tabular-nums"
          >{summary.compliance.vehicleHealth.attention}</span
        >
      </div>
      <div class="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
        <span class="flex items-center gap-2 font-medium">
          <span class="inline-block size-2.5 rounded-full bg-red-500"></span>
          Needs Action
        </span>
        <span class="font-mono font-semibold tabular-nums"
          >{summary.compliance.vehicleHealth.needsAction}</span
        >
      </div>
    </div>
  {:else}
    <div class="text-muted-foreground text-sm">Loading...</div>
  {/if}
</div>
