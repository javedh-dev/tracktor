<script lang="ts">
  import ResourceState from '$appui/ResourceState.svelte';

  interface Props {
    processing: boolean;
    error: string | undefined;
    data: unknown[] | undefined | null;
    emptyMessage: string;
    children?: import('svelte').Snippet;
    skeleton?: import('svelte').Snippet;
  }

  let { processing, error, data, emptyMessage, children, skeleton }: Props = $props();
</script>

{#if processing}
  {#if skeleton}
    {@render skeleton()}
  {/if}
{:else if error}
  <ResourceState state="error" message={error} />
{:else if !data || data.length === 0}
  <ResourceState state="empty" message={emptyMessage} />
{:else}
  {@render children?.()}
{/if}
