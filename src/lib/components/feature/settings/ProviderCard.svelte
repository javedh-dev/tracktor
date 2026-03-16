<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell';
  import Edit from '@lucide/svelte/icons/pencil';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Mail from '@lucide/svelte/icons/mail';
  import Send from '@lucide/svelte/icons/send';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Webhook from '@lucide/svelte/icons/webhook';

  import { Badge } from '$ui/badge';
  import Button from '$ui/button/button.svelte';
  import * as Card from '$ui/card';
  import type {
    NotificationProviderConfig,
    NotificationProviderWithParsedConfig
  } from '$lib/domain/notification-provider';

  type ProviderChannel = 'reminder' | 'alert' | 'information';
  type ProviderWithChannels = NotificationProviderWithParsedConfig & {
    channels: ProviderChannel[];
  };

  interface Props {
    provider: ProviderWithChannels;
    onEdit?: (provider: ProviderWithChannels) => void;
    onDelete?: (provider: ProviderWithChannels) => void;
    onTest?: (provider: ProviderWithChannels) => void;
    testing?: boolean;
  }

  let { provider, onEdit, onDelete, onTest, testing = false }: Props = $props();

  const channelLabelMap = {
    reminder: 'Reminder',
    alert: 'Alert',
    information: 'Information'
  } as const satisfies Record<ProviderChannel, string>;

  const getProviderIcon = (type: string) => {
    switch (type) {
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

  const getProviderDetails = () => {
    const config: NotificationProviderConfig = provider.config;

    switch (config.type) {
      case 'email':
        return {
          primary: `${config.host}:${config.port}`,
          secondary: config.secure ? 'SSL/TLS' : 'No SSL',
          from: config.fromName ? `${config.fromName} <${config.from}>` : config.from,
          extra: config.recepient ? `Recipient: ${config.recepient}` : null
        };
      case 'webhook':
        return {
          primary: new URL(config.url).hostname,
          secondary: config.method,
          from: config.url,
          extra: config.authType !== 'none' ? `Auth: ${config.authType}` : null
        };
      case 'gotify':
        return {
          primary: new URL(config.serverUrl).hostname,
          secondary: `Priority: ${config.priority}`,
          from: config.serverUrl,
          extra: null
        };
      default:
        return {
          primary: 'Unknown',
          secondary: '',
          from: '',
          extra: null
        };
    }
  };

  const providerChannels = $derived(provider.channels as ProviderChannel[]);
  const details = $derived(getProviderDetails());
  const ProviderIcon = $derived(getProviderIcon(provider.type));
</script>

<Card.Root class="hover:border-primary/50 transition-colors">
  <Card.Content>
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <ProviderIcon class="h-5 w-5" />
        </div>

        <div class="min-w-0 flex-1 space-y-3">
          <div class="flex items-center gap-2">
            <h3 class="truncate font-semibold">{provider.name}</h3>
            {#if !provider.isEnabled}
              <Badge variant="outline" class="shrink-0">Disabled</Badge>
            {/if}
          </div>

          <div class="text-muted-foreground space-y-1 text-sm">
            <p class="truncate">{details.primary}</p>
            <p class="truncate text-xs">{details.secondary}</p>
            <p class="truncate text-xs">Destination: {details.from}</p>
            {#if details.extra}
              <p class="truncate text-xs">{details.extra}</p>
            {/if}
          </div>

          <div class="flex flex-wrap gap-2">
            {#each providerChannels as channel}
              <Badge variant="secondary">{channelLabelMap[channel]}</Badge>
            {/each}
          </div>
        </div>
      </div>

      <div class="flex shrink-0 gap-1">
        {#if onTest}
          <Button
            variant="ghost"
            size="icon"
            onclick={() => onTest?.(provider)}
            disabled={testing || !provider.isEnabled}
            title="Test provider"
          >
            {#if testing}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
              <Send class="h-4 w-4" />
            {/if}
          </Button>
        {/if}

        {#if onEdit}
          <Button
            variant="ghost"
            size="icon"
            onclick={() => onEdit?.(provider)}
            title="Edit provider"
          >
            <Edit class="h-4 w-4" />
          </Button>
        {/if}

        {#if onDelete}
          <Button
            variant="ghost"
            size="icon"
            onclick={() => onDelete?.(provider)}
            title="Delete provider"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        {/if}
      </div>
    </div>
  </Card.Content>
</Card.Root>
