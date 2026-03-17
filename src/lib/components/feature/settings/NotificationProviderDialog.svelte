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
    onFormTypeChange: (value: NotificationProviderType | undefined) => void;
    formChannels: ProviderChannel[];
    onToggleChannel: (channel: ProviderChannel, checked: boolean) => void;
    formIsEnabled: boolean;
    onFormIsEnabledChange: (checked: boolean) => void;
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
    formType,
    onFormTypeChange,
    formChannels,
    onToggleChannel,
    formIsEnabled,
    onFormIsEnabledChange,
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
</script>

<Dialog.Root {open} {onOpenChange}>
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
          <Input
            value={formName}
            oninput={(event) => onFormNameChange(event.currentTarget.value)}
            placeholder="Daily digest email"
          />
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
          onConfigChange={onEmailConfigChange}
        />
      {:else if formType === 'webhook'}
        <WebhookProviderForm
          config={editingProvider?.type === 'webhook'
            ? (editingProvider.config as WebhookProviderConfig)
            : undefined}
          isEditing={!!editingProvider}
          onConfigChange={onWebhookConfigChange}
        />
      {:else if formType === 'gotify'}
        <GotifyProviderForm
          config={editingProvider?.type === 'gotify'
            ? (editingProvider.config as GotifyProviderConfig)
            : undefined}
          isEditing={!!editingProvider}
          onConfigChange={onGotifyConfigChange}
        />
      {/if}

      {#if formType}
        <NotificationProviderChannels
          {channelOptions}
          selectedChannels={formChannels}
          {onToggleChannel}
          enabled={formIsEnabled}
          onEnabledChange={onFormIsEnabledChange}
        />
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={onCancel} disabled={savingProvider}>Cancel</Button>
      <Button onclick={onSave} disabled={savingProvider}>
        {#if savingProvider}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {editingProvider ? 'Update' : 'Create'} Provider
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
