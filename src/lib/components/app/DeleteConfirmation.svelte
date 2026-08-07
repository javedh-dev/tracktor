<script lang="ts">
  import { scale } from 'svelte/transition';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Button from '../ui/button/button.svelte';
  import * as m from '$lib/paraglide/messages';

  let { onConfirm, open = $bindable() } = $props();
</script>

{#if open}
  <div
    id="delete-confirmation-overlay"
    class="delete-confirmation-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  >
    <div
      id="delete-confirmation-dialog"
      in:scale={{ duration: 500 }}
      class="delete-confirmation-dialog bg-card flex max-h-[90vh] max-w-xl min-w-sm flex-col items-center justify-center overflow-y-auto rounded-lg p-8 shadow-2xl"
    >
      <span id="delete-confirmation-icon" class="bg-destructive/10 rounded-lg p-3">
        <Trash2 class="text-destructive h-6 w-6" />
      </span>
      <h3 id="delete-confirmation-title" class="text-foreground mt-4 text-2xl">
        {m.delete_dialog_title()}
      </h3>
      <h5 id="delete-confirmation-message" class="">
        {m.delete_dialog_message()}
      </h5>
      <div id="delete-confirmation-actions" class="mt-8 flex w-full justify-around gap-4">
        <Button
          id="delete-confirmation-cancel"
          variant="secondary"
          type="button"
          onclick={() => (open = false)}>{m.common_cancel()}</Button
        >
        <Button id="delete-confirmation-confirm" variant="default" type="button" onclick={onConfirm}
          >{m.common_confirm()}</Button
        >
      </div>
    </div>
  </div>
{/if}
