<script lang="ts">
  import { Badge } from '$ui/badge';
  import Button from '$ui/button/button.svelte';
  import * as Card from '$ui/card';
  import Edit from '@lucide/svelte/icons/pencil';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Send from '@lucide/svelte/icons/send';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import type {
    NotificationProviderConfig,
    NotificationProviderWithParsedConfig
  } from '$lib/domain/notification-provider';
  import Switch from '$lib/components/ui/switch/switch.svelte';

  type ProviderChannel = 'reminder' | 'alert' | 'information';
  type ProviderWithChannels = NotificationProviderWithParsedConfig & {
    channels: ProviderChannel[];
  };

  interface Props {
    provider: ProviderWithChannels;
    onEdit?: (provider: ProviderWithChannels) => void;
    onDelete?: (provider: ProviderWithChannels) => void;
    onTest?: (provider: ProviderWithChannels) => void;
    onToggleEnabled?: (provider: ProviderWithChannels, enabled: boolean) => void;
    toggling?: boolean;
    testing?: boolean;
  }

  let {
    provider,
    onEdit,
    onDelete,
    onTest,
    onToggleEnabled,
    toggling = false,
    testing = false
  }: Props = $props();

  const channelLabelMap = {
    reminder: 'Reminder',
    alert: 'Alert',
    information: 'Information'
  } as const satisfies Record<ProviderChannel, string>;

  function getProviderUrl(config: NotificationProviderConfig): string {
    switch (config.type) {
      case 'email':
        return config.from;
      case 'webhook':
        return config.url;
      case 'gotify':
        return config.serverUrl;
      default:
        return '';
    }
  }

  const providerChannels = $derived(provider.channels as ProviderChannel[]);
  const providerUrl = $derived(getProviderUrl(provider.config));
</script>

<Card.Root
  class="border-border/80 bg-background overflow-hidden rounded-xl border py-4 shadow-none"
>
  <Card.Content class="px-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold">{provider.name}</p>
        {#if providerUrl}
          <p class="text-muted-foreground mt-1 truncate text-xs">{providerUrl}</p>
        {/if}

        <div class="mt-3 flex flex-wrap gap-2">
          {#each providerChannels as channel}
            <Badge variant="secondary" class="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
              {channelLabelMap[channel]}
            </Badge>
          {/each}
        </div>
      </div>

      <div class="flex flex-col justify-between gap-3 sm:items-end">
        <div class="flex items-center gap-2 self-start sm:self-end">
          <span class="text-muted-foreground text-xs">Enabled</span>
          <Switch checked={provider.isEnabled} disabled={toggling} />
        </div>

        <div class="flex items-end gap-1 self-start sm:self-end">
          {#if onTest}
            <Button
              variant="ghost"
              size="icon"
              onclick={() => onTest(provider)}
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
              onclick={() => onEdit(provider)}
              title="Edit provider"
            >
              <Edit class="h-4 w-4" />
            </Button>
          {/if}

          {#if onDelete}
            <Button
              variant="ghost"
              size="icon"
              onclick={() => onDelete(provider)}
              title="Delete provider"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </Card.Content>
</Card.Root>
