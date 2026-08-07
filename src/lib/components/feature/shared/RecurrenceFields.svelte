<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import * as Select from '$ui/select/index.js';
  import Repeat from '@lucide/svelte/icons/repeat';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import type { SuperForm } from 'sveltekit-superforms';

  interface Props {
    form: SuperForm<any>;
    formData: any;
    recurrenceTypes: Record<string, string>;
    getLabel: (type: string, m: any) => string;
    endDateField: string;
    intervalShowMode: 'yearly_monthly' | 'not_none';
    endDateShowMode: 'none' | 'not_none';
    m: any;
    recurrenceTypeLabel: string;
    recurrenceTypeDesc: string;
    intervalLabel: string;
    intervalDesc: string;
    endDateLabel: string;
    endDateDesc: string;
  }

  let {
    form,
    formData,
    recurrenceTypes,
    getLabel,
    endDateField,
    intervalShowMode,
    endDateShowMode,
    m,
    recurrenceTypeLabel,
    recurrenceTypeDesc,
    intervalLabel,
    intervalDesc,
    endDateLabel,
    endDateDesc
  }: Props = $props();

  const showInterval = $derived(
    intervalShowMode === 'not_none'
      ? $formData.recurrenceType && $formData.recurrenceType !== 'none'
      : $formData.recurrenceType === 'yearly' || $formData.recurrenceType === 'monthly'
  );

  const showEndDate = $derived(
    endDateShowMode === 'not_none'
      ? $formData.recurrenceType && $formData.recurrenceType !== 'none'
      : $formData.recurrenceType === 'none'
  );

  const intervalUnitLabel = $derived.by(() => {
    const t = $formData.recurrenceType as string;
    if (t === 'yearly') return m.recurrence_interval_years();
    if (t === 'monthly') return m.recurrence_interval_months();
    if (t === 'weekly') return m.recurrence_interval_weeks();
    if (t === 'daily') return m.recurrence_interval_days();
    return '';
  });
</script>

<Form.Field {form} name="recurrenceType" class="w-full">
  <Form.Control>
    {#snippet children({ props })}
      <FormLabel description={recurrenceTypeDesc}>{recurrenceTypeLabel}</FormLabel>
      <Select.Root bind:value={$formData.recurrenceType} type="single">
        <Select.Trigger {...props} class="w-full">
          <div class="flex items-center gap-2">
            <Repeat class="h-4 w-4" />
            <span>
              {$formData.recurrenceType
                ? getLabel($formData.recurrenceType, m)
                : m.common_select_placeholder({ name: recurrenceTypeLabel })}
            </span>
          </div>
        </Select.Trigger>
        <Select.Content>
          {#each Object.keys(recurrenceTypes) as value}
            <Select.Item {value}>{getLabel(value, m)}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

{#if showInterval}
  <Form.Field {form} name="recurrenceInterval" class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={intervalDesc}>
          {intervalLabel}
          {$formData.recurrenceInterval || 1}
          {intervalUnitLabel}
        </FormLabel>
        <Input {...props} bind:value={$formData.recurrenceInterval} type="number" min="1" />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{/if}

{#if showEndDate}
  <Form.Field {form} name={endDateField} class="w-full">
    <Form.Control>
      {#snippet children({ props })}
        <FormLabel description={endDateDesc}>{endDateLabel}</FormLabel>
        <Input {...props} bind:value={$formData[endDateField]} icon={Calendar1} type="calendar" />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{/if}
