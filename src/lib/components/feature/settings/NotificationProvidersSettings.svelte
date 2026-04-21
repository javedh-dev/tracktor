<script lang="ts">
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Plus from '@lucide/svelte/icons/plus';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  import type {
    CreateNotificationProvider,
    EmailProviderConfig,
    GotifyProviderConfig,
    NotificationProviderType,
    NotificationProviderWithParsedConfig,
    UpdateNotificationProvider,
    WebhookProviderConfig
  } from '$lib/domain/notification-provider';
  import * as providerService from '$lib/services/notification-provider.service';
  import * as m from '$lib/paraglide/messages';
  import Button from '$ui/button/button.svelte';
  import SettingFormSection from './SettingFormSection.svelte';

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

  const channelOptions: Array<{
    value: ProviderChannel;
    label: string;
    description: string;
  }> = $derived([
    {
      value: 'reminder',
      label: m.notif_channel_reminder(),
      description: m.notif_channel_reminder_desc()
    },
    {
      value: 'alert',
      label: m.notif_channel_alert(),
      description: m.notif_channel_alert_desc()
    },
    {
      value: 'information',
      label: m.notif_channel_information(),
      description: m.notif_channel_information_desc()
    }
  ]);

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
      toast.error(m.notif_load_failed());
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    formName = '';
    formType = undefined;
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
    const providerType = formType ?? editingProvider?.type;

    if (providerType === 'email') {
      return { type: 'email' as const, ...(emailConfig as EmailProviderConfig) };
    }

    if (providerType === 'webhook') {
      return { type: 'webhook' as const, ...(webhookConfig as WebhookProviderConfig) };
    }

    if (providerType === 'gotify') {
      return { type: 'gotify' as const, ...(gotifyConfig as GotifyProviderConfig) };
    }

    return null;
  }

  async function handleSave() {
    const config = resolveProviderConfig();
    const providerType = formType ?? editingProvider?.type;

    if (!providerType || !config) {
      toast.error(m.notif_select_provider_type());
      return;
    }

    if (formChannels.length === 0) {
      toast.error(m.notif_select_channel());
      return;
    }

    try {
      savingProvider = true;

      if (editingProvider) {
        const updatePayload: UpdateNotificationProvider = {
          name: formName,
          config: config,
          channels: formChannels,
          isEnabled: editingProvider?.isEnabled ?? true
        };

        await providerService.updateProvider(editingProvider.id, updatePayload);
        toast.success(m.notif_provider_updated());
      } else {
        const createPayload: CreateNotificationProvider = {
          name: formName,
          type: providerType,
          config: config,
          channels: formChannels,
          isEnabled: true
        };

        await providerService.createProvider(createPayload);
        toast.success(m.notif_provider_created());
      }

      dialogOpen = false;
      await loadProviders();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || m.notif_save_provider_failed());
    } finally {
      savingProvider = false;
    }
  }

  async function handleDelete(provider: ProviderWithChannels) {
    if (!confirm(m.notif_confirm_delete({ name: provider.name }))) {
      return;
    }

    try {
      await providerService.deleteProvider(provider.id);
      toast.success(m.notif_provider_deleted());
      await loadProviders();
    } catch {
      toast.error(m.notif_provider_delete_failed());
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
  {formName}
  onFormNameChange={(value) => (formName = value)}
  bind:formType
  {emailConfig}
  onEmailConfigChange={(config) => (emailConfig = config)}
  {webhookConfig}
  onWebhookConfigChange={(config) => (webhookConfig = config)}
  {gotifyConfig}
  onGotifyConfigChange={(config) => (gotifyConfig = config)}
  {formChannels}
  onToggleChannel={toggleChannel}
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
