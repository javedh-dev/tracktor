<script lang="ts">
  import { withBase, cn } from '$lib/utils';
  import Button from '$ui/button/button.svelte';
  import Skeleton from '$ui/skeleton/skeleton.svelte';
  import Download from '@lucide/svelte/icons/download';
  import ExternalLink from '@lucide/svelte/icons/external-link';
  import * as m from '$lib/paraglide/messages';

  let { fileName }: { fileName: string } = $props();

  const fileUrl = $derived(withBase(`/api/files/${fileName}`));
  const previewUrl = $derived(`${fileUrl}?preview=true`);
  const isPdf = $derived(fileName.toLowerCase().endsWith('.pdf'));
  const isImage = $derived(
    ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) => fileName.toLowerCase().endsWith(ext))
  );

  let loaded = $state(false);
  $effect(() => {
    fileName;
    loaded = false;
  });
</script>

<div id="attachment-preview" class="overflow-hidden rounded-lg border">
  {#if isImage}
    <div class="bg-muted/40 relative">
      {#if !loaded}
        <Skeleton class="h-48 w-full rounded-none" />
      {/if}
      <img
        src={previewUrl}
        alt={fileName}
        class={cn('max-h-64 w-full object-contain', !loaded && 'absolute inset-0 opacity-0')}
        onload={() => (loaded = true)}
      />
    </div>
  {:else if isPdf}
    <div class="relative">
      {#if !loaded}
        <Skeleton class="h-64 w-full rounded-none" />
      {/if}
      <iframe
        src={previewUrl}
        title={fileName}
        class={cn('h-64 w-full border-none', !loaded && 'absolute inset-0 opacity-0')}
        onload={() => (loaded = true)}
      ></iframe>
    </div>
  {:else}
    <div class="bg-muted/40 flex flex-col items-center gap-2 p-6 text-center">
      <ExternalLink class="text-muted-foreground h-8 w-8" />
      <p class="text-muted-foreground text-xs">{m.file_preview_not_available()}</p>
    </div>
  {/if}
  <div class="bg-background/60 flex items-center justify-between gap-2 border-t px-3 py-2">
    <span class="truncate text-xs font-medium">{fileName}</span>
    <Button href={fileUrl} download={fileName} variant="ghost" size="icon-sm">
      <Download class="h-3.5 w-3.5" />
      <span class="sr-only">{m.file_preview_aria_download()}</span>
    </Button>
  </div>
</div>
