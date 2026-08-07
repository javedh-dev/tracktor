<script lang="ts">
  import ResourceState from '$appui/ResourceState.svelte';

  interface Props {
    processing: boolean;
    error: string | undefined;
    data: unknown[] | undefined | null;
    emptyMessage: string;
    children?: import('svelte').Snippet;
    skeleton?: import('svelte').Snippet;
    /** Rendered above the skeleton/error/empty states only — `children` is expected to carry its own actions. */
    actions?: import('svelte').Snippet;
  }

  let { processing, error, data, emptyMessage, children, skeleton, actions }: Props = $props();
</script>

{#if processing}
  {#if actions}
    <div class="mb-4 flex justify-end gap-2">{@render actions()}</div>
  {/if}
  {#if skeleton}
    {@render skeleton()}
  {/if}
{:else if error}
  {#if actions}
    <div class="mb-4 flex justify-end gap-2">{@render actions()}</div>
  {/if}
  <ResourceState state="error" message={error} />
{:else if !data || data.length === 0}
  {#if actions}
    <div class="mb-4 flex justify-end gap-2">{@render actions()}</div>
  {/if}
  <ResourceState state="empty" message={emptyMessage} />
{:else}
  {@render children?.()}
{/if}
