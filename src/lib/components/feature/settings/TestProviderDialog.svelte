<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Mail from '@lucide/svelte/icons/mail';
  import Webhook from '@lucide/svelte/icons/webhook';
  import { toast } from 'svelte-sonner';

  import Button from '$ui/button/button.svelte';
  import * as Dialog from '$ui/dialog';
  import { Label } from '$ui/label';
  import { Textarea } from '$ui/textarea';
  import Input from '$appui/input.svelte';
  import type { NotificationProviderWithParsedConfig } from '$lib/domain/notification-provider';
  import { testProvider } from '$lib/services/notification-provider.service';
  import * as m from '$lib/paraglide/messages';

  type ProviderWithChannels = NotificationProviderWithParsedConfig & {
    channels: Array<'reminder' | 'alert' | 'information'>;
  };

  interface Props {
    provider: ProviderWithChannels | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { provider, open = $bindable(false), onOpenChange }: Props = $props();

  let testMessage = $state('');
  let testEmail = $state('');
  let testing = $state(false);

  $effect(() => {
    if (!open) {
      testMessage = '';
      testEmail = '';
      testing = false;
    }
  });

  const getProviderIcon = () => {
    if (!provider) return Mail;

    switch (provider.type) {
      case 'email':
        return Mail;
      case 'webhook':
        return Webhook;
      case 'gotify':
        return Bell;
      default:
        return Mail;
    }
  };

  async function handleTest() {
    if (!provider) return;

    try {
      testing = true;

      const result = await testProvider(provider.id, {
        testMessage,
        testEmail
      });

      if (result.success) {
        toast.success(m.notif_test_success());
        onOpenChange(false);
        return;
      }

      toast.error(result.error || m.notif_test_failed());
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || m.notif_test_failed());
    } finally {
      testing = false;
    }
  }

  const ProviderIcon = $derived(getProviderIcon());
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>{m.notif_test_title()}</Dialog.Title>
      <Dialog.Description>
        {#if provider}
          {m.notif_test_send_desc({ name: provider.name })}
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-4">
      {#if provider}
        <div class="border-border flex items-center gap-3 rounded-lg border p-3">
          <div class="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <ProviderIcon class="h-5 w-5" />
          </div>
          <div>
            <p class="font-medium">{provider.name}</p>
            <p class="text-muted-foreground text-xs">
              {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
            </p>
          </div>
        </div>

        {#if provider.type === 'email'}
          <div class="space-y-2">
            <Label>{m.notif_test_email_label()}</Label>
            <Input
              bind:value={testEmail}
              type="email"
              placeholder={m.notif_test_email_placeholder()}
            />
            <p class="text-muted-foreground text-xs">
              {m.notif_test_email_desc()}
            </p>
          </div>
        {/if}

        <div class="space-y-2">
          <Label>{m.notif_test_message_label()}</Label>
          <Textarea
            bind:value={testMessage}
            placeholder={m.notif_test_message_placeholder()}
            disabled={testing}
            rows={3}
          />
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => onOpenChange(false)} disabled={testing}>
        {m.common_cancel()}
      </Button>
      <Button onclick={handleTest} disabled={testing || !provider}>
        {#if testing}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {m.notif_test_send()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
