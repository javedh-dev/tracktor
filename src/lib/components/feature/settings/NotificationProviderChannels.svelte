<script lang="ts">
  import { Checkbox } from '$ui/checkbox';

  type ProviderChannel = 'reminder' | 'alert' | 'information';

  interface ChannelOption {
    value: ProviderChannel;
    label: string;
    description: string;
  }

  interface Props {
    channelOptions: ChannelOption[];
    selectedChannels: ProviderChannel[];
    onToggleChannel: (channel: ProviderChannel, checked: boolean) => void;
    enabled: boolean;
    onEnabledChange: (checked: boolean) => void;
  }

  let { channelOptions, selectedChannels, onToggleChannel, enabled, onEnabledChange }: Props =
    $props();
</script>

<div class="space-y-4 rounded-lg border p-4">
  <div>
    <h4 class="font-medium">Channel subscriptions</h4>
    <p class="text-muted-foreground text-sm">
      Pick which notification channels this provider should receive.
    </p>
  </div>

  <div class="space-y-3">
    {#each channelOptions as channel}
      <label class="flex items-start justify-between gap-3 rounded-md border p-3">
        <div class="space-y-1">
          <p class="font-medium">{channel.label}</p>
          <p class="text-muted-foreground text-xs">{channel.description}</p>
        </div>
        <Checkbox
          checked={selectedChannels.includes(channel.value)}
          onCheckedChange={(checked) => onToggleChannel(channel.value, Boolean(checked))}
        />
      </label>
    {/each}
  </div>

  <div class="flex items-center justify-between">
    <div class="space-y-0.5">
      <p class="text-sm font-medium">Enable Provider</p>
      <p class="text-muted-foreground text-xs">
        Allow this provider to receive scheduled notifications.
      </p>
    </div>
    <Checkbox checked={enabled} onCheckedChange={(checked) => onEnabledChange(Boolean(checked))} />
  </div>
</div>
