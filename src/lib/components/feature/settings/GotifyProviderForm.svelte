<script lang="ts">
  import Input from '$appui/input.svelte';
  import { Label } from '$ui/label';
  import type { GotifyProviderConfig } from '$lib/domain/notification-provider';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    config?: GotifyProviderConfig;
    isEditing?: boolean;
    onConfigChange: (config: Partial<GotifyProviderConfig>) => void;
  }

  let { config, isEditing = false, onConfigChange }: Props = $props();

  let formServerUrl = $state('');
  let formAppToken = $state('');
  let formPriority = $state(5);

  $effect(() => {
    if (config) {
      formServerUrl = config.serverUrl || '';
      formPriority = config.priority || 5;
    }
  });

  $effect(() => {
    onConfigChange({
      serverUrl: formServerUrl,
      appToken: formAppToken,
      priority: formPriority
    });
  });
</script>

<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">{m.notif_gotify_config()}</h4>

  <div class="space-y-2">
    <Label>{m.notif_gotify_url()}</Label>
    <Input bind:value={formServerUrl} type="url" placeholder="https://gotify.example.com" />
    <p class="text-muted-foreground text-xs">{m.notif_gotify_url_desc()}</p>
  </div>

  <div class="space-y-2">
    <Label>{isEditing ? m.notif_gotify_token_keep() : m.notif_gotify_token()}</Label>
    <Input bind:value={formAppToken} type="password" placeholder="••••••••" />
    <p class="text-muted-foreground text-xs">{m.notif_gotify_token_desc()}</p>
  </div>

  <div class="space-y-2">
    <Label>{m.notif_gotify_priority()}</Label>
    <Input bind:value={formPriority} type="number" min="0" max="10" placeholder="5" />
    <p class="text-muted-foreground text-xs">{m.notif_gotify_priority_desc()}</p>
  </div>
</div>
