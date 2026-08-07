<script lang="ts">
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Send from '@lucide/svelte/icons/send';
  import CronInput from '$feature/settings/CronInput.svelte';
  import { env } from '$lib/config/env';
  import Button from '$ui/button/button.svelte';
  import { Switch } from '$ui/switch';
  import { Label } from '$ui/label';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    processingEnabled: boolean;
    onProcessingEnabledChange?: (value: boolean) => void;
    processingSchedule: string;
    onProcessingScheduleChange?: (value: string) => void;
    disabled?: boolean;
    sendingNotifications?: boolean;
    onSendAllNotifications: () => void;
  }

  let {
    processingEnabled = $bindable(true),
    onProcessingEnabledChange,
    processingSchedule,
    onProcessingScheduleChange,
    disabled = false,
    sendingNotifications = false,
    onSendAllNotifications
  }: Props = $props();

  $effect(() => {
    onProcessingEnabledChange?.(processingEnabled);
  });
</script>

<div class="space-y-3 pb-4">
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <Label for="notification-processing-schedule">{m.notif_processing_schedule()}</Label>
        <p class="text-muted-foreground text-xs">
          {m.notif_processing_schedule_desc()}
        </p>
      </div>
      <Switch bind:checked={processingEnabled} {disabled} />
    </div>

    <div class="flex justify-between gap-4">
      <CronInput
        value={processingSchedule}
        onValueChange={(value) => onProcessingScheduleChange?.(value)}
        disabled={disabled || !processingEnabled}
        placeholder="0 9 * * *"
      />

      {#if env.DEMO_MODE}
        <div class="flex justify-end">
          <Button
            variant="outline"
            onclick={onSendAllNotifications}
            disabled={disabled || sendingNotifications || !processingEnabled}
          >
            {#if sendingNotifications}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
              <Send class="h-4 w-4" />
            {/if}
            {m.notif_send_now()}
          </Button>
        </div>
      {/if}
    </div>
  </div>
</div>
