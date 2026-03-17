<script lang="ts">
  import Input from '$appui/input.svelte';
  import { Label } from '$ui/label';
  import * as Select from '$ui/select';
  import type { WebhookProviderConfig } from '$lib/domain/notification-provider';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';

  interface Props {
    config?: WebhookProviderConfig;
    isEditing?: boolean;
    onConfigChange: (config: Partial<WebhookProviderConfig>) => void;
  }

  let { config, isEditing = false, onConfigChange }: Props = $props();

  let formUrl = $state('');
  let formMethod = $state<'POST' | 'PUT' | 'PATCH'>('POST');
  let formAuthType = $state<'none' | 'basic' | 'bearer' | 'api-key'>('none');
  let formUsername = $state('');
  let formPassword = $state('');
  let formToken = $state('');
  let formApiKey = $state('');
  let formApiKeyHeader = $state('X-API-Key');
  let formHeadersText = $state('{}');

  // Sync form state when config changes
  $effect(() => {
    if (config) {
      formUrl = config.url || '';
      formMethod = config.method || 'POST';
      formAuthType = config.authType || 'none';
      formUsername = config.authCredentials?.username || '';
      formApiKeyHeader = config.authCredentials?.apiKeyHeader || 'X-API-Key';
      formHeadersText = config.headers ? JSON.stringify(config.headers, null, 2) : '{}';
    }
  });

  // Notify parent of config changes
  $effect(() => {
    const authCredentials: any = {};
    if (formAuthType === 'basic') {
      authCredentials.username = formUsername;
      authCredentials.password = formPassword;
    } else if (formAuthType === 'bearer') {
      authCredentials.token = formToken;
    } else if (formAuthType === 'api-key') {
      authCredentials.apiKey = formApiKey;
      authCredentials.apiKeyHeader = formApiKeyHeader;
    }

    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(formHeadersText);
    } catch (e) {
      console.error('Invalid JSON for headers:', e);
    }

    onConfigChange({
      url: formUrl,
      method: formMethod,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      authType: formAuthType,
      authCredentials: Object.keys(authCredentials).length > 0 ? authCredentials : undefined
    });
  });
</script>

<!-- Webhook Settings -->
<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">Webhook Configuration</h4>

  <div class="space-y-2">
    <Label>Webhook URL</Label>
    <Input bind:value={formUrl} type="url" placeholder="https://example.com/webhook" />
  </div>

  <div class="space-y-2">
    <Label>HTTP Method</Label>
    <Select.Root bind:value={formMethod} type="single">
      <Select.Trigger class="w-full">
        <span>{formMethod}</span>
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="POST">POST</Select.Item>
        <Select.Item value="PUT">PUT</Select.Item>
        <Select.Item value="PATCH">PATCH</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="space-y-2">
    <Label>Custom Headers (JSON)</Label>
    <Textarea
      bind:value={formHeadersText}
      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      placeholder={JSON.stringify({ 'Content-Type': 'application/json' }, null, 2)}
    />
    <p class="text-muted-foreground text-xs">
      Additional headers to include in the webhook request
    </p>
  </div>
</div>

<!-- Authentication -->
<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">Authentication</h4>

  <div class="space-y-2">
    <Label>Auth Type</Label>
    <Select.Root bind:value={formAuthType} type="single">
      <Select.Trigger class="w-full">
        <span>{formAuthType}</span>
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="none">None</Select.Item>
        <Select.Item value="basic">Basic Auth</Select.Item>
        <Select.Item value="bearer">Bearer Token</Select.Item>
        <Select.Item value="api-key">API Key</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  {#if formAuthType === 'basic'}
    <div class="space-y-2">
      <Label>Username</Label>
      <Input bind:value={formUsername} placeholder="username" />
    </div>

    <div class="space-y-2">
      <Label>Password {isEditing ? '(leave blank to keep current)' : ''}</Label>
      <Input bind:value={formPassword} type="password" placeholder="••••••••" />
    </div>
  {:else if formAuthType === 'bearer'}
    <div class="space-y-2">
      <Label>Bearer Token {isEditing ? '(leave blank to keep current)' : ''}</Label>
      <Input bind:value={formToken} type="password" placeholder="••••••••" />
    </div>
  {:else if formAuthType === 'api-key'}
    <div class="space-y-2">
      <Label>API Key {isEditing ? '(leave blank to keep current)' : ''}</Label>
      <Input bind:value={formApiKey} type="password" placeholder="••••••••" />
    </div>

    <div class="space-y-2">
      <Label>API Key Header Name</Label>
      <Input bind:value={formApiKeyHeader} placeholder="X-API-Key" />
    </div>
  {/if}
</div>
