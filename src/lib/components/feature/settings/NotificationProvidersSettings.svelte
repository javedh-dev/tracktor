<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Mail from '@lucide/svelte/icons/mail';
  import Plus from '@lucide/svelte/icons/plus';
  import Webhook from '@lucide/svelte/icons/webhook';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  import Input from '$appui/input.svelte';
  import type {
    EmailProviderConfig,
    GotifyProviderConfig,
    NotificationProviderType,
    NotificationProviderWithParsedConfig,
    WebhookProviderConfig
  } from '$lib/domain/notification-provider';
  import * as providerService from '$lib/services/notification-provider.service';
  import { Checkbox } from '$ui/checkbox';
  import Button from '$ui/button/button.svelte';
  import * as Dialog from '$ui/dialog';
  import { Label } from '$ui/label';
  import * as Select from '$ui/select';

  import EmailProviderForm from './EmailProviderForm.svelte';
  import GotifyProviderForm from './GotifyProviderForm.svelte';
  import NotificationDeliveryPanel from './NotificationDeliveryPanel.svelte';
  import NotificationProvidersEmptyState from './NotificationProvidersEmptyState.svelte';
  import ProviderCard from './ProviderCard.svelte';
  import TestProviderDialog from './TestProviderDialog.svelte';
  import WebhookProviderForm from './WebhookProviderForm.svelte';

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
  let emailConfig = $state<Partial<EmailProviderConfig>>({});
  let webhookConfig = $state<Partial<WebhookProviderConfig>>({});
  let gotifyConfig = $state<Partial<GotifyProviderConfig>>({});

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

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-150">
    <Dialog.Header>
      <Dialog.Title>{editingProvider ? 'Edit' : 'Add'} Notification Provider</Dialog.Title>
      <Dialog.Description>
        Choose a provider type, configure its destination, and subscribe it to notification
        channels.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-5 py-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>Provider Name</Label>
          <Input bind:value={formName} placeholder="Daily digest email" />
        </div>

        <div class="space-y-2">
          <Label>Provider Type</Label>
          <Select.Root bind:value={formType} type="single" disabled={!!editingProvider}>
            <Select.Trigger class="w-full justify-between border">
              <span class="flex items-center gap-2">
                {#if formType === 'email'}
                  <Mail class="h-4 w-4" />
                  Email (SMTP)
                {:else if formType === 'webhook'}
                  <Webhook class="h-4 w-4" />
                  Webhook
                {:else if formType === 'gotify'}
                  <Bell class="h-4 w-4" />
                  Gotify
                {:else}
                  Select Provider Type
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="email">
                <span class="flex items-center gap-2">
                  <Mail class="h-4 w-4" />
                  Email (SMTP)
                </span>
              </Select.Item>
              <Select.Item value="webhook">
                <span class="flex items-center gap-2">
                  <Webhook class="h-4 w-4" />
                  Webhook
                </span>
              </Select.Item>
              <Select.Item value="gotify">
                <span class="flex items-center gap-2">
                  <Bell class="h-4 w-4" />
                  Gotify
                </span>
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {#if formType === 'email'}
        <EmailProviderForm
          config={editingProvider?.type === 'email'
            ? (editingProvider.config as EmailProviderConfig)
            : undefined}
          isEditing={!!editingProvider}
          onConfigChange={(config) => (emailConfig = config)}
        />
      {:else if formType === 'webhook'}
        <WebhookProviderForm
          config={editingProvider?.type === 'webhook'
            ? (editingProvider.config as WebhookProviderConfig)
            : undefined}
          isEditing={!!editingProvider}
          onConfigChange={(config) => (webhookConfig = config)}
        />
      {:else if formType === 'gotify'}
        <GotifyProviderForm
          config={editingProvider?.type === 'gotify'
            ? (editingProvider.config as GotifyProviderConfig)
            : undefined}
          isEditing={!!editingProvider}
          onConfigChange={(config) => (gotifyConfig = config)}
        />
      {/if}

      {#if formType}
        <div class="space-y-4 rounded-lg border p-4">
          <div>
            <h4 class="font-medium">Channel subscriptions</h4>
            <p class="text-muted-foreground text-sm">
              Pick which notification channels this provider should receive.
            </p>
          </div>

          <div class="space-y-3">
            {#each channelOptions as channel}
              <label class="flex items-start justify-between gap-3 rounded-md border p-3">
                <div class="space-y-1">
                  <p class="font-medium">{channel.label}</p>
                  <p class="text-muted-foreground text-xs">
                    {channel.description}
                  </p>
                </div>
                <Checkbox
                  checked={formChannels.includes(channel.value)}
                  onCheckedChange={(checked) => toggleChannel(channel.value, Boolean(checked))}
                />
              </label>
            {/each}
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Enable Provider</Label>
              <p class="text-muted-foreground text-xs">
                Allow this provider to receive scheduled notifications.
              </p>
            </div>
            <Checkbox bind:checked={formIsEnabled} />
          </div>
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (dialogOpen = false)} disabled={savingProvider}>
        Cancel
      </Button>
      <Button onclick={handleSave} disabled={savingProvider}>
        {#if savingProvider}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {editingProvider ? 'Update' : 'Create'} Provider
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

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
