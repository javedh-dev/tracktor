<script lang="ts">
  import * as Dialog from '$ui/dialog';
  import Button from '$ui/button/button.svelte';
  import { Label } from '$ui/label';
  import { Textarea } from '$ui/textarea';
  import { toast } from 'svelte-sonner';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Mail from '@lucide/svelte/icons/mail';
  import Webhook from '@lucide/svelte/icons/webhook';
  import Bell from '@lucide/svelte/icons/bell';
  import type { NotificationProviderWithParsedConfig } from '$lib/domain/notification-provider';
  import * as providerService from '$lib/services/notification-provider.service';

  interface Props {
    provider: NotificationProviderWithParsedConfig | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { provider, open = $bindable(false), onOpenChange }: Props = $props();

  let testMessage = $state('');
  let testing = $state(false);

  // Reset form when dialog closes
  $effect(() => {
    if (!open) {
      testMessage = '';
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

      const result = await providerService.testProvider(provider.id, testMessage);

      if (result.success) {
        toast.success('Test notification sent successfully!');
        onOpenChange(false);
      } else {
        toast.error(`Failed to send test: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test notification');
      console.error(error);
    } finally {
      testing = false;
    }
  }

  const ProviderIcon = $derived(getProviderIcon());
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Test Provider</Dialog.Title>
      <Dialog.Description>
        {#if provider}
          Send a test notification using <strong>{provider.name}</strong>
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
              {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)} Provider
            </p>
          </div>
        </div>
        <div class="space-y-2">
          <Label>Test Message (Optional)</Label>
          <Textarea
            bind:value={testMessage}
            placeholder="This is a test notification from Tracktor"
            disabled={testing}
            rows={3}
          />
          <p class="text-muted-foreground text-xs">
            Custom message for the test notification (default will be used if empty)
          </p>
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => onOpenChange(false)} disabled={testing}>
        Cancel
      </Button>
      <Button onclick={handleTest} disabled={testing || !provider}>
        {#if testing}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Send Test
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
