<script lang="ts">
  import Input from '$appui/input.svelte';
  import { Label } from '$ui/label';
  import { Checkbox } from '$ui/checkbox';
  import type { EmailProviderConfig } from '$lib/domain/notification-provider';
  import * as m from '$lib/paraglide/messages';

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

  $effect(() => {
    if (config) {
      formHost = config.host || '';
      formPort = config.port || 587;
      formSecure = config.secure || false;
      formUsername = config.auth?.user || '';
      formFrom = config.from || '';
      formFromName = config.fromName || '';
      formRecepient = config.recepient || '';
    }
  });

  $effect(() => {
    const nextConfig: Partial<EmailProviderConfig> = {
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
    };

    onConfigChange(nextConfig);
  });
</script>

<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">{m.notif_email_smtp_settings()}</h4>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>{m.notif_email_host()}</Label>
      <Input bind:value={formHost} placeholder="smtp.gmail.com" />
    </div>

    <div class="space-y-2">
      <Label>{m.notif_email_port()}</Label>
      <Input bind:value={formPort} type="number" placeholder="587" />
    </div>
  </div>

  <div class="flex items-center justify-between">
    <div class="space-y-0.5">
      <Label>{m.notif_email_use_ssl()}</Label>
      <p class="text-muted-foreground text-xs">{m.notif_email_use_ssl_desc()}</p>
    </div>
    <Checkbox bind:checked={formSecure} />
  </div>
</div>

<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">{m.notif_email_auth()}</h4>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>{m.notif_email_username()}</Label>
      <Input bind:value={formUsername} type="email" placeholder="your@email.com" />
    </div>

    <div class="space-y-2">
      <Label>{isEditing ? m.notif_email_password_keep() : m.notif_email_password()}</Label>
      <Input bind:value={formPassword} type="password" placeholder="••••••••" />
    </div>
  </div>
</div>

<div class="border-border space-y-4 rounded-lg border p-4">
  <h4 class="text-sm font-semibold">{m.notif_email_sender_info()}</h4>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>{m.notif_email_from()}</Label>
      <Input bind:value={formFrom} type="email" placeholder="noreply@example.com" />
    </div>

    <div class="space-y-2">
      <Label>{m.notif_email_from_name()}</Label>
      <Input bind:value={formFromName} placeholder={m.notif_email_from_name_placeholder()} />
    </div>
  </div>

  <div class="space-y-2">
    <Label>{m.notif_email_recipient()}</Label>
    <Input bind:value={formRecepient} type="email" placeholder="support@example.com" />
    <p class="text-muted-foreground text-xs">{m.notif_email_recipient_desc()}</p>
  </div>
</div>
