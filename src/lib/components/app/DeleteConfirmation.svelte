<script lang="ts">
  import type { Component } from 'svelte';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Button from '../ui/button/button.svelte';
  import * as Dialog from '$ui/dialog';
  import * as m from '$lib/paraglide/messages';

  let {
    onConfirm,
    open = $bindable(),
    title = m.delete_dialog_title(),
    message = m.delete_dialog_message(),
    icon: Icon = Trash2,
    confirmLabel = m.common_confirm()
  }: {
    onConfirm: () => void;
    open: boolean;
    title?: string;
    message?: string;
    icon?: Component<{ class?: string }>;
    confirmLabel?: string;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content id="delete-confirmation-dialog" class="sm:max-w-md">
    <Dialog.Header>
      <span
        id="delete-confirmation-icon"
        class="bg-destructive/10 flex size-10 items-center justify-center rounded-lg"
      >
        <Icon class="text-destructive size-5" />
      </span>
      <Dialog.Title id="delete-confirmation-title">{title}</Dialog.Title>
      <Dialog.Description id="delete-confirmation-message">{message}</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button
        id="delete-confirmation-cancel"
        variant="outline"
        type="button"
        onclick={() => (open = false)}
      >
        {m.common_cancel()}
      </Button>
      <Button id="delete-confirmation-confirm" variant="default" type="button" onclick={onConfirm}>
        {confirmLabel}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
