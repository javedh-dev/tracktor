<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Mail from '@lucide/svelte/icons/mail';
  import Webhook from '@lucide/svelte/icons/webhook';
  import Input from '$appui/input.svelte';
  import Button from '$ui/button/button.svelte';
  import * as Dialog from '$ui/dialog';
  import { Label } from '$ui/label';
  import * as Select from '$ui/select';
  import type {
    CreateNotificationProvider,
    EmailProviderConfig,
    GotifyProviderConfig,
    NotificationProviderType,
    NotificationProviderWithParsedConfig,
    UpdateNotificationProvider,
    WebhookProviderConfig
  } from '$lib/domain/notification-provider';
  import * as m from '$lib/paraglide/messages';
  import { toast } from 'svelte-sonner';
  import EmailProviderForm from './EmailProviderForm.svelte';
  import GotifyProviderForm from './GotifyProviderForm.svelte';
  import NotificationProviderChannels from './NotificationProviderChannels.svelte';
  import WebhookProviderForm from './WebhookProviderForm.svelte';

  type ProviderChannel = 'reminder' | 'alert' | 'information';
  type ProviderWithChannels = NotificationProviderWithParsedConfig & {
    channels: ProviderChannel[];
  };

  interface ChannelOption {
    value: ProviderChannel;
    label: string;
    description: string;
  }

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProvider: ProviderWithChannels | null;
    saving: boolean;
    onSave: (payload: CreateNotificationProvider | UpdateNotificationProvider) => void;
  }

  let { open, onOpenChange, editingProvider, saving, onSave }: Props = $props();

  const channelOptions: ChannelOption[] = $derived([
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

  let formName = $state('');
  let formType = $state<NotificationProviderType>();
  let formChannels = $state<ProviderChannel[]>(['reminder', 'alert', 'information']);
  let emailConfig = $state<Partial<EmailProviderConfig>>({});
  let webhookConfig = $state<Partial<WebhookProviderConfig>>({});
  let gotifyConfig = $state<Partial<GotifyProviderConfig>>({});

  $effect(() => {
    if (editingProvider) {
      formName = editingProvider.name;
      formType = editingProvider.type;
      formChannels = [...editingProvider.channels];
      if (editingProvider.type === 'email') {
        emailConfig = editingProvider.config as EmailProviderConfig;
      } else if (editingProvider.type === 'webhook') {
        webhookConfig = editingProvider.config as WebhookProviderConfig;
      } else if (editingProvider.type === 'gotify') {
        gotifyConfig = editingProvider.config as GotifyProviderConfig;
      }
    } else {
      formName = '';
      formType = undefined;
      formChannels = ['reminder', 'alert', 'information'];
      emailConfig = {};
      webhookConfig = {};
      gotifyConfig = {};
    }
  });

  function toggleChannel(channel: ProviderChannel, checked: boolean) {
    if (checked) {
      formChannels = Array.from(new Set([...formChannels, channel])) as ProviderChannel[];
    } else {
      formChannels = formChannels.filter((v) => v !== channel);
    }
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

  function handleSave() {
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
    if (editingProvider) {
      const payload: UpdateNotificationProvider = {
        name: formName,
        config,
        channels: formChannels,
        isEnabled: editingProvider.isEnabled ?? true
      };
      onSave(payload);
    } else {
      const payload: CreateNotificationProvider = {
        name: formName,
        type: providerType,
        config,
        channels: formChannels,
        isEnabled: true
      };
      onSave(payload);
    }
  }
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-150">
    <Dialog.Header>
      <Dialog.Title
        >{editingProvider ? m.notif_dialog_edit_title() : m.notif_dialog_add_title()}</Dialog.Title
      >
      <Dialog.Description>
        {m.notif_dialog_desc()}
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-5 py-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>{m.notif_provider_name()}</Label>
          <Input bind:value={formName} placeholder={m.notif_provider_name_placeholder()} />
        </div>

        <div class="space-y-2">
          <Label>{m.notif_provider_type()}</Label>
          <Select.Root bind:value={formType} type="single" disabled={!!editingProvider}>
            <Select.Trigger class="w-full justify-between border">
              <span class="flex items-center gap-2">
                {#if formType === 'email'}
                  <Mail class="h-4 w-4" />
                  {m.notif_provider_type_email()}
                {:else if formType === 'webhook'}
                  <Webhook class="h-4 w-4" />
                  {m.notif_provider_type_webhook()}
                {:else if formType === 'gotify'}
                  <Bell class="h-4 w-4" />
                  {m.notif_provider_type_gotify()}
                {:else}
                  {m.notif_provider_type_select()}
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="email">
                <span class="flex items-center gap-2">
                  <Mail class="h-4 w-4" />
                  {m.notif_provider_type_email()}
                </span>
              </Select.Item>
              <Select.Item value="webhook">
                <span class="flex items-center gap-2">
                  <Webhook class="h-4 w-4" />
                  {m.notif_provider_type_webhook()}
                </span>
              </Select.Item>
              <Select.Item value="gotify">
                <span class="flex items-center gap-2">
                  <Bell class="h-4 w-4" />
                  {m.notif_provider_type_gotify()}
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
            : (emailConfig as EmailProviderConfig)}
          isEditing={!!editingProvider}
          onConfigChange={(config) => (emailConfig = config)}
        />
      {:else if formType === 'webhook'}
        <WebhookProviderForm
          config={editingProvider?.type === 'webhook'
            ? (editingProvider.config as WebhookProviderConfig)
            : (webhookConfig as WebhookProviderConfig)}
          isEditing={!!editingProvider}
          onConfigChange={(config) => (webhookConfig = config)}
        />
      {:else if formType === 'gotify'}
        <GotifyProviderForm
          config={editingProvider?.type === 'gotify'
            ? (editingProvider.config as GotifyProviderConfig)
            : (gotifyConfig as GotifyProviderConfig)}
          isEditing={!!editingProvider}
          onConfigChange={(config) => (gotifyConfig = config)}
        />
      {/if}

      {#if formType}
        <NotificationProviderChannels
          {channelOptions}
          selectedChannels={formChannels}
          onToggleChannel={toggleChannel}
        />
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => onOpenChange(false)} disabled={saving}
        >{m.notif_dialog_cancel()}</Button
      >
      <Button onclick={handleSave} disabled={saving}>
        {#if saving}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {editingProvider ? m.notif_dialog_update() : m.notif_dialog_create()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
