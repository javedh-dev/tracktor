<script lang="ts">
  import Button from '$ui/button/button.svelte';
  import X from '@lucide/svelte/icons/x';
  import * as m from '$lib/paraglide/messages';
  import type { Snippet } from 'svelte';

  let { onClose, children }: { onClose: () => void; children: Snippet } = $props();
</script>

<aside
  id="app-table-detail-panel"
  class="bg-card w-full min-w-0 rounded-2xl border p-4 lg:sticky lg:top-4"
>
  <div class="mb-3 flex items-center justify-between">
    <h3 class="text-sm font-semibold">{m.common_details()}</h3>
    <Button variant="ghost" size="icon-sm" onclick={onClose}>
      <X class="h-4 w-4" />
      <span class="sr-only">{m.common_close()}</span>
    </Button>
  </div>
  {@render children()}
</aside>
