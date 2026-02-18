<script lang="ts">
  import Input from '$appui/input.svelte';
  import { Label } from '$ui/label';
  import { Checkbox } from '$ui/checkbox';
  import type { EmailProviderConfig } from '$lib/domain/notification-provider';

  interface Props {
    config?: EmailProviderConfig;
    isEditing?: boolean;
    onConfigChange: (config: Partial<EmailProviderConfig>) => void;
  }

  let { config, isEditing = false, onConfigChange }: Props = $props();

  let formHost = $state('');
  let formPort = $state(587);
  let formSecure = $state(false);
  let formUsername = $state('');
  let formPassword = $state('');
  let formFrom = $state('');
  let formFromName = $state('');
  let formRecepient = $state('');

  // Sync form state when config changes
  $effect(() => {
    if (config) {
      formHost = config.host || '';
      formPort = config.port || 587;
      formSecure = config.secure || false;
      formUsername = config.auth?.user || '';
      formFrom = config.from || '';
      formFromName = config.fromName || '';
      formRecepient = (config as any).recepient || '';
    }
  });

  // Notify parent of config changes
  $effect(() => {
    onConfigChange({
      host: formHost,
      port: formPort,
      secure: formSecure,
      auth: {
        user: formUsername,
        pass: formPassword
      },
      from: formFrom,
      fromName: formFromName || undefined,
      recepient: formRecepient || undefined
    } as any);
  });
</script>

<!-- SMTP Settings -->
<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">SMTP Server Settings</h4>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>Host</Label>
      <Input bind:value={formHost} placeholder="smtp.gmail.com" />
    </div>

    <div class="space-y-2">
      <Label>Port</Label>
      <Input bind:value={formPort} type="number" placeholder="587" />
    </div>
  </div>

  <div class="flex items-center justify-between">
    <div class="space-y-0.5">
      <Label>Use SSL/TLS</Label>
      <p class="text-muted-foreground text-xs">Enable secure connection</p>
    </div>
    <Checkbox bind:checked={formSecure} />
  </div>
</div>

<!-- Authentication -->
<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">Authentication</h4>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>Username / Email</Label>
      <Input bind:value={formUsername} type="email" placeholder="your@email.com" />
    </div>

    <div class="space-y-2">
      <Label>Password {isEditing ? '(leave blank to keep current)' : ''}</Label>
      <Input bind:value={formPassword} type="password" placeholder="••••••••" />
    </div>
  </div>
</div>

<!-- Sender Settings -->
<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">Sender/Recipient Information</h4>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>From Email</Label>
      <Input bind:value={formFrom} type="email" placeholder="noreply@example.com" />
    </div>

    <div class="space-y-2">
      <Label>From Name (Optional)</Label>
      <Input bind:value={formFromName} placeholder="Tracktor Notifications" />
    </div>
  </div>

  <div class="space-y-2">
    <Label>Recepient Email</Label>
    <Input bind:value={formRecepient} type="email" placeholder="support@example.com" />
    <p class="text-muted-foreground text-xs">Email address of the recipient</p>
  </div>
</div>
