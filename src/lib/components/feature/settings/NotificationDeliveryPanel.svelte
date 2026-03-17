<script lang="ts">
  import Clock3 from '@lucide/svelte/icons/clock-3';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Send from '@lucide/svelte/icons/send';
  import CronInput from '$feature/settings/CronInput.svelte';
  import { env } from '$lib/config/env';
  import Button from '$ui/button/button.svelte';
  import { Label } from '$ui/label';

  interface Props {
    processingSchedule: string;
    onProcessingScheduleChange?: (value: string) => void;
    disabled?: boolean;
    sendingNotifications?: boolean;
    onSendAllNotifications: () => void;
  }

  let {
    processingSchedule,
    onProcessingScheduleChange,
    disabled = false,
    sendingNotifications = false,
    onSendAllNotifications
  }: Props = $props();
</script>

<div class="space-y-3 rounded-lg border p-4">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h3 class="text-lg font-semibold">Scheduled delivery</h3>
      <p class="text-muted-foreground text-sm">
        In-app notifications stay real-time. This schedule only controls provider delivery.
      </p>
    </div>
    <div class="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
      <Clock3 class="h-5 w-5" />
    </div>
  </div>

  <div class="space-y-2">
    <Label for="notification-processing-schedule">Processing schedule</Label>
    <CronInput
      value={processingSchedule}
      onValueChange={(value) => onProcessingScheduleChange?.(value)}
      {disabled}
      placeholder="0 9 * * *"
    />
  </div>

  {#if env.DEMO_MODE}
    <div class="flex justify-end">
      <Button
        variant="outline"
        onclick={onSendAllNotifications}
        disabled={disabled || sendingNotifications}
      >
        {#if sendingNotifications}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {:else}
          <Send class="mr-2 h-4 w-4" />
        {/if}
        Send All Notifications Now
      </Button>
    </div>
  {/if}
</div>
