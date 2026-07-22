<script lang="ts">
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Plus from '@lucide/svelte/icons/plus';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  import type {
    CreateNotificationProvider,
    NotificationProviderWithParsedConfig,
    UpdateNotificationProvider
  } from '$lib/domain/notification-provider';
  import * as providerService from '$lib/services/notification-provider.service';
  import * as m from '$lib/paraglide/messages';
  import Button from '$ui/button/button.svelte';
  import SettingFormSection from './SettingFormSection.svelte';
  import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';

  import NotificationDeliveryPanel from './NotificationDeliveryPanel.svelte';
  import NotificationProviderDialog from './NotificationProviderDialog.svelte';
  import NotificationProvidersEmptyState from './NotificationProvidersEmptyState.svelte';
  import ProviderCard from './ProviderCard.svelte';
  import TestProviderDialog from './TestProviderDialog.svelte';

  type ProviderChannel = 'reminder' | 'alert' | 'information';
  type ProviderWithChannels = NotificationProviderWithParsedConfig & {
    channels: ProviderChannel[];
  };

  interface Props {
    notificationProcessingEnabled: boolean;
    processingSchedule: string;
    onProcessingScheduleChange?: (value: string) => void;
    disabled?: boolean;
  }

  let {
    notificationProcessingEnabled = $bindable(true),
    processingSchedule = '0 9 * * *',
    onProcessingScheduleChange,
    disabled = false
  }: Props = $props();

  let providers = $state<ProviderWithChannels[]>([]);
  let loading = $state(true);
  let dialogOpen = $state(false);
  let editingProvider = $state<ProviderWithChannels | null>(null);
  let saving = $state(false);
  let sendingNotifications = $state(false);
  let togglingProviderId = $state<string | null>(null);
  let testDialogOpen = $state(false);
  let testingProvider = $state<ProviderWithChannels | null>(null);
  let deleteDialogOpen = $state(false);
  let deletingProvider = $state<ProviderWithChannels | null>(null);

  onMount(async () => {
    await loadProviders();
  });

  async function loadProviders() {
    try {
      loading = true;
      providers = (await providerService.getProviders()) as ProviderWithChannels[];
    } catch {
      toast.error(m.notif_load_failed());
    } finally {
      loading = false;
    }
  }

  function openCreateDialog() {
    editingProvider = null;
    dialogOpen = true;
  }

  function openEditDialog(provider: ProviderWithChannels) {
    editingProvider = provider;
    dialogOpen = true;
  }

  async function handleSaveFromDialog(
    payload: CreateNotificationProvider | UpdateNotificationProvider
  ) {
    try {
      saving = true;
      if (editingProvider) {
        await providerService.updateProvider(
          editingProvider.id,
          payload as UpdateNotificationProvider
        );
        toast.success(m.notif_provider_updated());
      } else {
        await providerService.createProvider(payload as CreateNotificationProvider);
        toast.success(m.notif_provider_created());
      }
      dialogOpen = false;
      await loadProviders();
    } catch (error) {
      toast.error((error as Error).message || m.notif_save_provider_failed());
    } finally {
      saving = false;
    }
  }

  function handleDelete(provider: ProviderWithChannels) {
    deletingProvider = provider;
    deleteDialogOpen = true;
  }

  async function confirmDelete() {
    if (!deletingProvider) return;
    try {
      await providerService.deleteProvider(deletingProvider.id);
      toast.success(m.notif_provider_deleted());
      await loadProviders();
    } catch {
      toast.error(m.notif_provider_delete_failed());
    } finally {
      deleteDialogOpen = false;
      deletingProvider = null;
    }
  }

  function handleTest(provider: ProviderWithChannels) {
    testingProvider = provider;
    testDialogOpen = true;
  }

  async function handleToggleProvider(provider: ProviderWithChannels) {
    try {
      togglingProviderId = provider.id;
      await providerService.updateProvider(provider.id, {
        isEnabled: provider.isEnabled
      });
      providers = providers.map((entry) =>
        entry.id === provider.id ? { ...entry, isEnabled: provider.isEnabled } : entry
      );
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || m.notif_update_provider_failed());
    } finally {
      togglingProviderId = null;
    }
  }

  async function handleSendAllNotifications() {
    try {
      sendingNotifications = true;
      const result = await providerService.sendAllNotificationsToEnabledProviders();
      const successCount = result.results.filter((entry) => entry.success).length;

      toast.success(
        m.notif_send_all_success({
          notifCount: String(result.notificationCount),
          successCount: String(successCount),
          providerCount: String(result.providerCount)
        })
      );
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || m.notif_send_all_failed());
    } finally {
      sendingNotifications = false;
    }
  }
</script>

<div class="space-y-4">
  <SettingFormSection
    title={m.notif_scheduled_delivery()}
    subtitle={m.notif_scheduled_delivery_desc()}
  >
    <NotificationDeliveryPanel
      bind:processingEnabled={notificationProcessingEnabled}
      {processingSchedule}
      {onProcessingScheduleChange}
      {disabled}
      {sendingNotifications}
      onSendAllNotifications={handleSendAllNotifications}
    />
  </SettingFormSection>

  <SettingFormSection title={m.notif_providers()} subtitle={m.notif_providers_desc()}>
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-muted-foreground text-sm">
          {m.notif_providers_channels_info()}
        </p>
      </div>
      <Button onclick={openCreateDialog} size="sm" {disabled}>
        <Plus class="mr-2 h-4 w-4" />
        {m.notif_add_provider()}
      </Button>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 animate-spin" />
      </div>
    {:else if providers.length === 0}
      <NotificationProvidersEmptyState />
    {:else}
      <div class="grid gap-3 md:grid-cols-2">
        {#each providers as provider (provider.id)}
          <ProviderCard
            {provider}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            onTest={handleTest}
            onToggleEnabled={handleToggleProvider}
            toggling={togglingProviderId === provider.id}
            testing={testDialogOpen && testingProvider?.id === provider.id}
          />
        {/each}
      </div>
    {/if}
  </SettingFormSection>
</div>

<NotificationProviderDialog
  open={dialogOpen}
  onOpenChange={(open) => (dialogOpen = open)}
  {editingProvider}
  {saving}
  onSave={handleSaveFromDialog}
/>

<DeleteConfirmation onConfirm={confirmDelete} bind:open={deleteDialogOpen} />

<TestProviderDialog
  provider={testingProvider}
  bind:open={testDialogOpen}
  onOpenChange={(open) => {
    testDialogOpen = open;
    if (!open) {
      testingProvider = null;
    }
  }}
/>
