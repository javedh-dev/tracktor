<script lang="ts">
  import Input from '$appui/input.svelte';
  import { Label } from '$ui/label';
  import type { GotifyProviderConfig } from '$lib/domain/notification-provider';

  interface Props {
    config?: GotifyProviderConfig;
    isEditing?: boolean;
    onConfigChange: (config: Partial<GotifyProviderConfig>) => void;
  }

  let { config, isEditing = false, onConfigChange }: Props = $props();

  let formServerUrl = $state('');
  let formAppToken = $state('');
  let formPriority = $state(5);

  // Sync form state when config changes
  $effect(() => {
    if (config) {
      formServerUrl = config.serverUrl || '';
      formPriority = config.priority || 5;
    }
  });

  // Notify parent of config changes
  $effect(() => {
    onConfigChange({
      serverUrl: formServerUrl,
      appToken: formAppToken,
      priority: formPriority
    });
  });
</script>

<!-- Gotify Settings -->
<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">Gotify Server Configuration</h4>

  <div class="space-y-2">
    <Label>Server URL</Label>
    <Input bind:value={formServerUrl} type="url" placeholder="https://gotify.example.com" />
    <p class="text-muted-foreground text-xs">URL of your Gotify server instance</p>
  </div>

  <div class="space-y-2">
    <Label>App Token {isEditing ? '(leave blank to keep current)' : ''}</Label>
    <Input bind:value={formAppToken} type="password" placeholder="••••••••" />
    <p class="text-muted-foreground text-xs">
      Application token from your Gotify app (not the client token)
    </p>
  </div>

  <div class="space-y-2">
    <Label>Priority (0-10)</Label>
    <Input bind:value={formPriority} type="number" min="0" max="10" placeholder="5" />
    <p class="text-muted-foreground text-xs">
      Message priority level. Higher priority = more prominent notification
    </p>
  </div>
</div>
