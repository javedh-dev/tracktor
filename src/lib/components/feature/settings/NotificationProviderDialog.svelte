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
    EmailProviderConfig,
    GotifyProviderConfig,
    NotificationProviderType,
    NotificationProviderWithParsedConfig,
    WebhookProviderConfig
  } from '$lib/domain/notification-provider';
  import * as m from '$lib/paraglide/messages';
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
    formName: string;
    onFormNameChange: (value: string) => void;
    formType: NotificationProviderType | undefined;
    formChannels: ProviderChannel[];
    onToggleChannel: (channel: ProviderChannel, checked: boolean) => void;
    emailConfig: Partial<EmailProviderConfig>;
    onEmailConfigChange: (config: Partial<EmailProviderConfig>) => void;
    webhookConfig: Partial<WebhookProviderConfig>;
    onWebhookConfigChange: (config: Partial<WebhookProviderConfig>) => void;
    gotifyConfig: Partial<GotifyProviderConfig>;
    onGotifyConfigChange: (config: Partial<GotifyProviderConfig>) => void;
    channelOptions: ChannelOption[];
    savingProvider: boolean;
    onCancel: () => void;
    onSave: () => void;
  }

  let {
    open,
    onOpenChange,
    editingProvider,
    formName,
    onFormNameChange,
    formType = $bindable(),
    formChannels,
    onToggleChannel,
    emailConfig,
    onEmailConfigChange,
    webhookConfig,
    onWebhookConfigChange,
    gotifyConfig,
    onGotifyConfigChange,
    channelOptions,
    savingProvider,
    onCancel,
    onSave
  }: Props = $props();

  $effect(() => {
    if (!formType && editingProvider?.type) {
      formType = editingProvider.type;
    }
  });
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
          <Input
            value={formName}
            oninput={(event) => onFormNameChange(event.currentTarget.value)}
            placeholder={m.notif_provider_name_placeholder()}
          />
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
          onConfigChange={onEmailConfigChange}
        />
      {:else if formType === 'webhook'}
        <WebhookProviderForm
          config={editingProvider?.type === 'webhook'
            ? (editingProvider.config as WebhookProviderConfig)
            : (webhookConfig as WebhookProviderConfig)}
          isEditing={!!editingProvider}
          onConfigChange={onWebhookConfigChange}
        />
      {:else if formType === 'gotify'}
        <GotifyProviderForm
          config={editingProvider?.type === 'gotify'
            ? (editingProvider.config as GotifyProviderConfig)
            : (gotifyConfig as GotifyProviderConfig)}
          isEditing={!!editingProvider}
          onConfigChange={onGotifyConfigChange}
        />
      {/if}

      {#if formType}
        <NotificationProviderChannels
          {channelOptions}
          selectedChannels={formChannels}
          {onToggleChannel}
        />
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={onCancel} disabled={savingProvider}
        >{m.notif_dialog_cancel()}</Button
      >
      <Button onclick={onSave} disabled={savingProvider}>
        {#if savingProvider}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {editingProvider ? m.notif_dialog_update() : m.notif_dialog_create()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
