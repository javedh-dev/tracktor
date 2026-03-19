<script lang="ts">
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
  import Button from '$ui/button/button.svelte';
  import * as DropdownMenu from '$ui/dropdown-menu';
  import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';

  interface ActionItem {
    id: string;
    label: string;
    onclick: () => void;
    variant?: 'default' | 'destructive';
  }

  interface Props {
    menuId: string;
    triggerId: string;
    contentId: string;
    editItemId: string;
    deleteItemId: string;
    openLabel: string;
    editLabel: string;
    deleteLabel: string;
    onEdit: () => void;
    onDelete: (closeDialog: () => void) => void;
    extraItems?: ActionItem[];
  }

  let {
    menuId,
    triggerId,
    contentId,
    editItemId,
    deleteItemId,
    openLabel,
    editLabel,
    deleteLabel,
    onEdit,
    onDelete,
    extraItems = []
  }: Props = $props();

  let showDeleteDialog = $state(false);

  const actionItems = $derived([
    ...extraItems,
    { id: editItemId, label: editLabel, onclick: onEdit },
    {
      id: deleteItemId,
      label: deleteLabel,
      onclick: () => (showDeleteDialog = true),
      variant: 'destructive' as const
    }
  ]);
</script>

<div id={menuId} class="flex flex-row justify-end">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      id={triggerId}
      class="data-[state=open]:bg-muted text-muted-foreground flex size-8"
    >
      {#snippet child({ props })}
        <Button variant="ghost" size="icon" {...props}>
          <EllipsisVertical />
          <span class="sr-only">{openLabel}</span>
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content id={contentId} align="end" class="w-32">
      {#each actionItems as item (item.id)}
        <DropdownMenu.Item id={item.id} variant={item.variant} onclick={item.onclick}>
          {item.label}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<DeleteConfirmation
  onConfirm={() => onDelete(() => (showDeleteDialog = false))}
  bind:open={showDeleteDialog}
/>
