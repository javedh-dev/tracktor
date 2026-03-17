<script lang="ts">
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  interface Props {
    rows?: number;
    rowClass?: string;
    containerId?: string;
    containerClass?: string;
  }

  let {
    rows = 5,
    rowClass = 'h-12 w-full rounded-md',
    containerId,
    containerClass = 'space-y-3'
  }: Props = $props();
</script>

<div id={containerId} class={containerClass}>
  {#each Array.from({ length: rows }) as _, index (index)}
    <Skeleton class={rowClass} />
  {/each}
</div>
