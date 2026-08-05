<script lang="ts">
  import ActivityFeed from '$dashboard/ActivityFeed.svelte';
  import type { DashboardSummary } from '$lib/domain/dashboard';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();
</script>

<div class="h-full overflow-y-auto">
  <ActivityFeed entries={summary?.activity ?? []} {loading} />
</div>
