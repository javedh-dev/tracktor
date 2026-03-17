<script lang="ts">
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  interface Props {
    count?: number;
    containerId?: string;
    containerClass?: string;
    cardClass?: string;
  }

  let {
    count = 2,
    containerId,
    containerClass = 'space-y-4 pt-4',
    cardClass = 'bg-background rounded-lg border p-4 shadow-sm lg:p-6'
  }: Props = $props();
</script>

<div id={containerId} class={containerClass}>
  {#each Array.from({ length: count }) as _, index (index)}
    <div class={cardClass}>
      <div class="mb-4 flex items-center justify-between">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-8 w-8 rounded-full" />
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton class="h-5 w-full max-w-[200px]" />
        <Skeleton class="h-5 w-full max-w-40" />
        <Skeleton class="h-5 w-full max-w-48" />
        <Skeleton class="h-5 w-full max-w-48" />
      </div>
    </div>
  {/each}
</div>
