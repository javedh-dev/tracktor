<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Plus from '@lucide/svelte/icons/plus';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  import type {
    EmailProviderConfig,
    GotifyProviderConfig,
    NotificationProviderType,
    NotificationProviderWithParsedConfig,
    WebhookProviderConfig
  } from '$lib/domain/notification-provider';
  import * as providerService from '$lib/services/notification-provider.service';
  import Button from '$ui/button/button.svelte';

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
    processingSchedule: string;
    onProcessingScheduleChange?: (value: string) => void;
    disabled?: boolean;
  }

  let {
    processingSchedule = '0 9 * * *',
    onProcessingScheduleChange,
    disabled = false
  }: Props = $props();

  const channelOptions: Array<{
    value: ProviderChannel;
    label: string;
    description: string;
  }> = [
    {
      value: 'reminder',
      label: 'Reminder',
      description: 'Due dates and reminder-style notifications'
    },
    {
      value: 'alert',
      label: 'Alert',
      description: 'Urgent or expiring items that need attention'
    },
    {
      value: 'information',
      label: 'Information',
      description: 'General informational updates'
    }
  ];

  let providers = $state<ProviderWithChannels[]>([]);
  let loading = $state(true);
  let dialogOpen = $state(false);
  let editingProvider = $state<ProviderWithChannels | null>(null);
  let savingProvider = $state(false);
  let sendingNotifications = $state(false);
  let togglingProviderId = $state<string | null>(null);
  let testDialogOpen = $state(false);
  let testingProvider = $state<ProviderWithChannels | null>(null);

  let formName = $state('');
  let formType = $state<NotificationProviderType>();
  let formIsEnabled = $state(true);
  let formChannels = $state<ProviderChannel[]>(['reminder', 'alert', 'information']);
  let emailConfig = $state({});
  let webhookConfig = $state({});
  let gotifyConfig = $state({});

  onMount(async () => {
    await loadProviders();
  });

  async function loadProviders() {
    try {
      loading = true;
      providers = (await providerService.getProviders()) as ProviderWithChannels[];
    } catch {
      toast.error('Failed to load notification providers');
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    formName = '';
    formType = undefined;
    formIsEnabled = true;
    formChannels = ['reminder', 'alert', 'information'];
    emailConfig = {};
    webhookConfig = {};
    gotifyConfig = {};
  }

  function openCreateDialog() {
    editingProvider = null;
    resetForm();
    dialogOpen = true;
  }

  function openEditDialog(provider: ProviderWithChannels) {
    editingProvider = provider;
    formName = provider.name;
    formType = provider.type;
    formIsEnabled = provider.isEnabled;
    formChannels = [...provider.channels];

    if (provider.type === 'email') {
      emailConfig = provider.config as EmailProviderConfig;
    } else if (provider.type === 'webhook') {
      webhookConfig = provider.config as WebhookProviderConfig;
    } else if (provider.type === 'gotify') {
      gotifyConfig = provider.config as GotifyProviderConfig;
    }

    dialogOpen = true;
  }

  function toggleChannel(channel: ProviderChannel, checked: boolean) {
    if (checked) {
      formChannels = Array.from(new Set([...formChannels, channel])) as ProviderChannel[];
      return;
    }

    formChannels = formChannels.filter((value) => value !== channel);
  }

  function resolveProviderConfig() {
    if (formType === 'email') {
      return { type: 'email' as const, ...emailConfig };
    }

    if (formType === 'webhook') {
      return { type: 'webhook' as const, ...webhookConfig };
    }

    if (formType === 'gotify') {
      return { type: 'gotify' as const, ...gotifyConfig };
    }

    return null;
  }

  async function handleSave() {
    const config = resolveProviderConfig();

    if (!formType || !config) {
      toast.error('Please select a provider type');
      return;
    }

    if (formChannels.length === 0) {
      toast.error('Select at least one notification channel');
      return;
    }

    try {
      savingProvider = true;
      const providerConfig = config as any;

      if (editingProvider) {
        await providerService.updateProvider(editingProvider.id, {
          name: formName,
          config: providerConfig,
          channels: formChannels,
          isEnabled: formIsEnabled
        } as any);
        toast.success('Provider updated successfully');
      } else {
        await providerService.createProvider({
          name: formName,
          type: formType,
          config: providerConfig,
          channels: formChannels,
          isEnabled: formIsEnabled
        } as any);
        toast.success('Provider created successfully');
      }

      dialogOpen = false;
      await loadProviders();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to save provider');
    } finally {
      savingProvider = false;
    }
  }

  async function handleDelete(provider: ProviderWithChannels) {
    if (!confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      return;
    }

    try {
      await providerService.deleteProvider(provider.id);
      toast.success('Provider deleted successfully');
      await loadProviders();
    } catch {
      toast.error('Failed to delete provider');
    }
  }

  function handleTest(provider: ProviderWithChannels) {
    testingProvider = provider;
    testDialogOpen = true;
  }

  async function handleToggleProvider(provider: ProviderWithChannels) {
    try {
      togglingProviderId = provider.id;
      await providerService.updateProvider(provider.id, { isEnabled: provider.isEnabled } as any);
      providers = providers.map((entry) =>
        entry.id === provider.id ? { ...entry, isEnabled: provider.isEnabled } : entry
      );
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update provider');
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
        `Sent ${result.notificationCount} notifications to ${successCount}/${result.providerCount} enabled provider${result.providerCount === 1 ? '' : 's'}`
      );
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to send notifications');
    } finally {
      sendingNotifications = false;
    }
  }
</script>

<div class="space-y-6">
  <NotificationDeliveryPanel
    {processingSchedule}
    {onProcessingScheduleChange}
    {disabled}
    {sendingNotifications}
    onSendAllNotifications={handleSendAllNotifications}
  />

  <div class="flex items-center justify-between gap-4">
    <div>
      <h3 class="text-lg font-semibold">Notification providers</h3>
      <p class="text-muted-foreground text-sm">
        Each provider can subscribe to Reminder, Alert, and Information channels.
      </p>
    </div>
    <Button onclick={openCreateDialog} size="sm" {disabled}>
      <Plus class="mr-2 h-4 w-4" />
      Add Provider
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
</div>

<NotificationProviderDialog
  open={dialogOpen}
  onOpenChange={(open) => (dialogOpen = open)}
  {editingProvider}
  {formName}
  onFormNameChange={(value) => (formName = value)}
  {formType}
  onFormTypeChange={(value) => (formType = value)}
  {formChannels}
  onToggleChannel={toggleChannel}
  {formIsEnabled}
  onFormIsEnabledChange={(checked) => (formIsEnabled = checked)}
  {emailConfig}
  onEmailConfigChange={(config) => (emailConfig = config)}
  {webhookConfig}
  onWebhookConfigChange={(config) => (webhookConfig = config)}
  {gotifyConfig}
  onGotifyConfigChange={(config) => (gotifyConfig = config)}
  {channelOptions}
  {savingProvider}
  onCancel={() => (dialogOpen = false)}
  onSave={handleSave}
/>

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
