<script lang="ts">
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  interface Props {
    count?: number;
    containerId?: string;
    containerClass?: string;
    cardClass?: string;
  }

  let {
    count = 3,
    containerId,
    containerClass = 'my-4 flex gap-4 overflow-hidden',
    cardClass = 'h-72 w-80 shrink-0 rounded-2xl'
  }: Props = $props();
</script>

<div id={containerId} class={containerClass}>
  {#each Array.from({ length: count }) as _, index (index)}
    <Skeleton class={cardClass} />
  {/each}
</div>
