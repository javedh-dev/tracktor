<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from '$ui/card';
  import Button from '$ui/button/button.svelte';
  import * as Dialog from '$ui/dialog';
  import * as Select from '$ui/select';
  import Input from '$appui/input.svelte';
  import { Label } from '$ui/label';
  import { Checkbox } from '$ui/checkbox';
  import { toast } from 'svelte-sonner';
  import type {
    NotificationProviderWithParsedConfig,
    CreateNotificationProvider,
    NotificationProviderType,
    EmailProviderConfig,
    WebhookProviderConfig,
    GotifyProviderConfig
  } from '$lib/domain/notification-provider';
  import * as providerService from '$lib/services/notification-provider.service';
  import Mail from '@lucide/svelte/icons/mail';
  import Plus from '@lucide/svelte/icons/plus';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Webhook from '@lucide/svelte/icons/webhook';
  import Bell from '@lucide/svelte/icons/bell';
  import BellOff from '@lucide/svelte/icons/bell-off';
  import ProviderCard from './ProviderCard.svelte';
  import TestProviderDialog from './TestProviderDialog.svelte';
  import EmailProviderForm from './EmailProviderForm.svelte';
  import WebhookProviderForm from './WebhookProviderForm.svelte';
  import GotifyProviderForm from './GotifyProviderForm.svelte';

  let providers = $state<NotificationProviderWithParsedConfig[]>([]);
  let loading = $state(true);
  let dialogOpen = $state(false);
  let editingProvider = $state<NotificationProviderWithParsedConfig | null>(null);
  let processing = $state(false);
  let testDialogOpen = $state(false);
  let testingProvider = $state<NotificationProviderWithParsedConfig | null>(null);
  let testingProviderId = $state<string | null>(null);

  // Form state
  let formName = $state('');
  let formType = $state<NotificationProviderType>();
  let formIsEnabled = $state(true);
  let formIsDefault = $state(false);

  // Provider-specific configs
  let emailConfig = $state<Partial<EmailProviderConfig>>({});
  let webhookConfig = $state<Partial<WebhookProviderConfig>>({});
  let gotifyConfig = $state<Partial<GotifyProviderConfig>>({});

  onMount(async () => {
    await loadProviders();
  });

  async function loadProviders() {
    try {
      loading = true;
      const result = await providerService.getProviders();
      console.log('Loaded providers:', result);
      providers = result;
    } catch (error) {
      toast.error('Failed to load notification providers');
      console.error(error);
    } finally {
      loading = false;
    }
  }

  function openCreateDialog() {
    editingProvider = null;
    resetForm();
    dialogOpen = true;
  }

  function openEditDialog(provider: NotificationProviderWithParsedConfig) {
    editingProvider = provider;
    formName = provider.name;
    formType = provider.type;
    formIsEnabled = provider.isEnabled;
    formIsDefault = provider.isDefault;

    if (provider.type === 'email') {
      emailConfig = provider.config as EmailProviderConfig;
    } else if (provider.type === 'webhook') {
      webhookConfig = provider.config as WebhookProviderConfig;
    } else if (provider.type === 'gotify') {
      gotifyConfig = provider.config as GotifyProviderConfig;
    }

    dialogOpen = true;
  }

  function resetForm() {
    formName = '';
    formType = undefined;
    formIsEnabled = true;
    formIsDefault = false;
    emailConfig = {};
    webhookConfig = {};
    gotifyConfig = {};
  }

  async function handleSave() {
    try {
      processing = true;

      let config: any;
      if (formType === 'email') {
        config = { type: 'email' as const, ...emailConfig };
      } else if (formType === 'webhook') {
        config = { type: 'webhook' as const, ...webhookConfig };
      } else if (formType === 'gotify') {
        config = { type: 'gotify' as const, ...gotifyConfig };
      } else {
        toast.error('Please select a provider type');
        return;
      }

      const providerData: CreateNotificationProvider = {
        name: formName,
        type: formType,
        config,
        isEnabled: formIsEnabled,
        isDefault: formIsDefault
      };

      if (editingProvider) {
        const result = await providerService.updateProvider(editingProvider.id, {
          name: formName,
          config,
          isEnabled: formIsEnabled,
          isDefault: formIsDefault
        });
        console.log('Provider updated:', result);
        toast.success('Provider updated successfully');
      } else {
        const result = await providerService.createProvider(providerData);
        console.log('Provider created:', result);
        toast.success('Provider created successfully');
      }

      dialogOpen = false;
      await loadProviders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save provider');
      console.error(error);
    } finally {
      processing = false;
    }
  }

  async function handleDelete(provider: NotificationProviderWithParsedConfig) {
    if (!confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      return;
    }

    try {
      await providerService.deleteProvider(provider.id);
      toast.success('Provider deleted successfully');
      await loadProviders();
    } catch (error) {
      toast.error('Failed to delete provider');
      console.error(error);
    }
  }

  function handleTest(provider: NotificationProviderWithParsedConfig) {
    testingProvider = provider;
    testDialogOpen = true;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">Notification Providers</h3>
      <p class="text-muted-foreground text-sm">
        Configure email and other notification providers for sending alerts
      </p>
    </div>
    <Button onclick={openCreateDialog} size="sm">
      <Plus class="mr-2 h-4 w-4" />
      Add Provider
    </Button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin" />
    </div>
  {:else if providers.length === 0}
    <Card.Root class="border-dashed">
      <Card.Content class="flex flex-col items-center justify-center py-12">
        <BellOff class="text-muted-foreground mb-4 h-12 w-12" />
        <p class="text-muted-foreground mb-4 text-center">
          No notification providers configured yet
        </p>
        <!-- <Button onclick={openCreateDialog} size="sm">
          <Plus class="mr-2 h-4 w-4" />
          Add Your First Provider
        </Button> -->
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid gap-3">
      {#each providers as provider (provider.id)}
        <ProviderCard
          {provider}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onTest={handleTest}
          testing={testingProviderId === provider.id}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Add/Edit Provider Dialog -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-150">
    <Dialog.Header>
      <Dialog.Title>
        {editingProvider ? 'Edit' : 'Add'} Notification Provider
      </Dialog.Title>
      <Dialog.Description>
        Configure your notification provider for sending alerts
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <!-- Provider Name -->
        <div class="space-y-2">
          <Label>Provider Name</Label>
          <Input bind:value={formName} placeholder="My Notification Provider" />
        </div>

        <!-- Provider Type Selection -->
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
          {#if editingProvider}
            <p class="text-muted-foreground text-xs">
              Provider type cannot be changed after creation
            </p>
          {/if}
        </div>
      </div>
      <!-- Dynamic Provider Forms -->
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
        <!-- Provider Settings -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Enable Provider</Label>
              <p class="text-muted-foreground text-xs">Allow this provider to send notifications</p>
            </div>
            <Checkbox bind:checked={formIsEnabled} />
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Set as Default</Label>
              <p class="text-muted-foreground text-xs">Use this provider by default</p>
            </div>
            <Checkbox bind:checked={formIsDefault} />
          </div>
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (dialogOpen = false)} disabled={processing}>
        Cancel
      </Button>
      <Button onclick={handleSave} disabled={processing}>
        {#if processing}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {editingProvider ? 'Update' : 'Create'} Provider
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Test Provider Dialog -->
<TestProviderDialog
  provider={testingProvider}
  bind:open={testDialogOpen}
  onOpenChange={(open) => (testDialogOpen = open)}
/>
