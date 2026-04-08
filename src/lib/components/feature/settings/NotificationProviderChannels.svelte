<script lang="ts">
  import { Checkbox } from '$ui/checkbox';
  import * as m from '$lib/paraglide/messages';

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
  }

  let { channelOptions, selectedChannels, onToggleChannel }: Props = $props();
</script>

<div class="space-y-2 rounded-lg border p-2.5">
  <div>
    <h4 class="font-medium">{m.notif_channel_subscriptions()}</h4>
    <p class="text-muted-foreground text-xs">
      {m.notif_channel_subscriptions_desc()}
    </p>
  </div>

  <div class="grid gap-1.5 sm:grid-cols-2">
    {#each channelOptions as channel}
      <label class="flex items-center justify-between gap-2 rounded-md border px-2.5 py-2">
        <div class="min-w-0 space-y-0.5">
          <p class="text-[13px] font-medium">{channel.label}</p>
          <p class="text-muted-foreground truncate text-[10px]">{channel.description}</p>
        </div>
        <Checkbox
          checked={selectedChannels.includes(channel.value)}
          onCheckedChange={(checked) => onToggleChannel(channel.value, Boolean(checked))}
        />
      </label>
    {/each}
  </div>
</div>
