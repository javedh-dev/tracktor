<script lang="ts">
  import AttachmentLink from '$lib/components/app/AttachmentLink.svelte';
  let { value }: { value: string | null | undefined } = $props();
</script>

<div class="flex flex-row justify-center">
  {#if value}
    <AttachmentLink fileName={value} />
  {:else}
    <span class="text-muted-foreground">-</span>
  {/if}
</div>
