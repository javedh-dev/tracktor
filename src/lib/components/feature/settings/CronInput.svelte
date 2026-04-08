<script lang="ts">
  import Input from '$appui/input.svelte';
  import * as Select from '$ui/select';
  import Clock from '@lucide/svelte/icons/clock';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    value: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
  }

  let {
    value = $bindable(),
    onValueChange,
    disabled = false,
    placeholder = '* * * * *'
  }: Props = $props();

  const presets = $derived([
    { label: m.notif_cron_every_minute(), value: '* * * * *' },
    { label: m.notif_cron_every_5_min(), value: '*/5 * * * *' },
    { label: m.notif_cron_every_15_min(), value: '*/15 * * * *' },
    { label: m.notif_cron_every_30_min(), value: '*/30 * * * *' },
    { label: m.notif_cron_every_hour(), value: '0 * * * *' },
    { label: m.notif_cron_every_2_hours(), value: '0 */2 * * *' },
    { label: m.notif_cron_every_6_hours(), value: '0 */6 * * *' },
    { label: m.notif_cron_every_12_hours(), value: '0 */12 * * *' },
    { label: m.notif_cron_daily_midnight(), value: '0 0 * * *' },
    { label: m.notif_cron_daily_2am(), value: '0 2 * * *' },
    { label: m.notif_cron_daily_8am(), value: '0 8 * * *' },
    { label: m.notif_cron_daily_noon(), value: '0 12 * * *' },
    { label: m.notif_cron_weekly_monday(), value: '0 0 * * 1' },
    { label: m.notif_cron_monthly_1st(), value: '0 0 1 * *' }
  ]);

  function validateCron(expr: string): { valid: boolean; message: string } {
    if (!expr || expr.trim() === '') {
      return { valid: false, message: m.notif_cron_expression_required() };
    }

    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { valid: false, message: m.notif_cron_must_have_5_parts() };
    }

    const [minute, hour, day, month, weekday] = parts;

    const validPattern = /^[\d*/,-]+$/;
    if (
      !validPattern.test(minute) ||
      !validPattern.test(hour) ||
      !validPattern.test(day) ||
      !validPattern.test(month) ||
      !validPattern.test(weekday)
    ) {
      return { valid: false, message: m.notif_cron_invalid_chars() };
    }

    return { valid: true, message: m.notif_cron_valid() };
  }

  function getNextExecutionHint(expr: string): string {
    const preset = presets.find((p) => p.value === expr);
    if (preset) {
      return preset.label;
    }

    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return m.notif_cron_invalid();

    const [minute, hour, day, month, weekday] = parts;

    if (minute === '*' && hour === '*') {
      return m.notif_cron_every_minute();
    }
    if (minute.startsWith('*/') && hour === '*') {
      return m.notif_cron_every_n_minutes({ n: minute.slice(2) });
    }
    if (hour === '*') {
      return m.notif_cron_hourly_at_minute({ n: minute });
    }
    if (day === '*' && month === '*' && weekday === '*') {
      return m.notif_cron_daily_at({ time: `${hour}:${minute.padStart(2, '0')}` });
    }

    return m.notif_cron_custom();
  }

  let validation = $derived(validateCron(value));
  let hint = $derived(validation.valid ? getNextExecutionHint(value) : validation.message);

  let selectedPreset = $state<string | undefined>(undefined);

  $effect(() => {
    if (selectedPreset) {
      value = selectedPreset;
    }
  });

  $effect(() => {
    onValueChange?.(value);
  });
</script>

<div class="grow space-y-2">
  <div class="flex gap-2">
    <Select.Root bind:value={selectedPreset} type="single" {disabled}>
      <Select.Trigger class="w-35">
        <Clock class="mr-2 h-4 w-4" />
        {m.notif_cron_presets()}
      </Select.Trigger>
      <Select.Content>
        {#each presets as preset}
          <Select.Item value={preset.value}>
            {preset.label}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <div class="flex-1">
      <Input
        bind:value
        {placeholder}
        {disabled}
        class="mono font-mono"
        aria-label="Cron expression"
      />
    </div>
  </div>

  <div class="flex items-center gap-2 text-xs">
    {#if validation.valid}
      <Check class="h-3 w-3 text-green-600 dark:text-green-400" />
      <span class="text-muted-foreground">{hint}</span>
    {:else}
      <X class="text-destructive h-3 w-3" />
      <span class="text-destructive">{hint}</span>
    {/if}
  </div>
</div>
