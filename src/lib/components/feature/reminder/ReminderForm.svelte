<script lang="ts">
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import { Textarea } from '$ui/textarea';
  import {
    REMINDER_TYPES,
    REMINDER_SCHEDULES,
    REMINDER_RECURRENCE_TYPES,
    reminderFormSchema,
    getReminderScheduleLabel,
    getRecurrenceTypeLabel,
    getReminderTypeLabel
  } from '$lib/domain/reminder';
  import configs from '$stores/config.svelte';
  import { createSheetForm } from '$lib/composables/sheet-form.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import type { Reminder } from '$lib/domain/reminder';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import BellRing from '@lucide/svelte/icons/bell-ring';
  import Layers from '@lucide/svelte/icons/layers';
  import * as Select from '$ui/select/index.js';
  import { formatDate, parseDate } from '$lib/helper/format.helper';
  import { reminderStore } from '$stores/reminder.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { saveReminder } from '$lib/services/reminder.service';
  import { toast } from 'svelte-sonner';
  import * as m from '$lib/paraglide/messages';
  import RecurrenceFields from '$lib/components/feature/shared/RecurrenceFields.svelte';
  import VehicleSelectField from '$feature/shared/VehicleSelectField.svelte';
  import { page } from '$app/state';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

  let { data }: { data?: Partial<Reminder> } = $props();

  const sf = createSheetForm({
    schema: reminderFormSchema(configs.dateFormat),
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        sf.processing = true;
        saveReminder({
          ...f.data,
          dueDate: parseDate(f.data.dueDate),
          recurrenceEndDate: f.data.recurrenceEndDate ? parseDate(f.data.recurrenceEndDate) : null
        }).then((res) => {
          if (res.status === 'OK') {
            toast.success(m[data ? 'reminder_toast_updated' : 'reminder_toast_created']());
            sheetStore.closeSheet(reminderStore.reloadReminders);
          } else {
            toast.error(res.error || m.reminder_toast_error_fallback());
          }
          sf.processing = false;
        });
      }
    }
  });

  const { form, enhance } = sf;
  const formData: any = sf.formData;

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));
  const resolveVehicleId = () => data?.vehicleId || (scope.isFleet ? '' : scope.vehicleId) || '';
  const suppliedVehicleId = $derived(resolveVehicleId());

  $effect(() => {
    if (data?.id) {
      formData.update((fd: any) => ({
        ...fd,
        id: data.id || null,
        vehicleId: resolveVehicleId(),
        type: data.type || fd.type,
        dueDate: data.dueDate ? formatDate(data.dueDate) : fd.dueDate,
        remindSchedule: data.remindSchedule || fd.remindSchedule,
        recurrenceType: data.recurrenceType || fd.recurrenceType,
        recurrenceInterval: data.recurrenceInterval || fd.recurrenceInterval,
        recurrenceEndDate: data.recurrenceEndDate
          ? formatDate(data.recurrenceEndDate)
          : fd.recurrenceEndDate,
        note: data.note ?? fd.note,
        isCompleted: data.isCompleted ?? fd.isCompleted
      }));
    }
  });

  $effect(() => {
    const vehicleId = resolveVehicleId();
    if (vehicleId) {
      formData.update((fd: any) => ({ ...fd, vehicleId }));
    }
  });
</script>

<form id="reminder-form" use:enhance onsubmit={(e) => e.preventDefault()}>
  <fieldset class="flex flex-col gap-4" disabled={sf.processing}>
    {#if !suppliedVehicleId}
      <VehicleSelectField {form} {formData} vehicles={vehicleStore.vehicles ?? []} />
    {/if}
    <Form.Field {form} name="dueDate" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.reminder_form_due_date_desc()} required
            >{m.reminder_form_due_date_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.dueDate} type="calendar" icon={Calendar1} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="type" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.reminder_form_type_desc()} required
            >{m.reminder_form_type_label()}</FormLabel
          >
          <Select.Root bind:value={$formData.type} type="single">
            <Select.Trigger {...props} class="w-full">
              <div class="flex items-center gap-2">
                <Layers class="h-4 w-4" />
                <span
                  >{$formData.type
                    ? getReminderTypeLabel($formData.type, m)
                    : m.common_select_placeholder({ name: m.reminder_form_type_label() })}</span
                >
              </div>
            </Select.Trigger>
            <Select.Content>
              {#each Object.keys(REMINDER_TYPES) as value}
                <Select.Item {value}>{getReminderTypeLabel(value, m)}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="remindSchedule" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.reminder_form_schedule_desc()} required
            >{m.reminder_form_schedule_label()}</FormLabel
          >
          <Select.Root bind:value={$formData.remindSchedule} type="single">
            <Select.Trigger {...props} class="w-full">
              <div class="flex items-center gap-2">
                <BellRing class="h-4 w-4" />
                <span>
                  {$formData.remindSchedule
                    ? getReminderScheduleLabel($formData.remindSchedule, m)
                    : m.reminder_form_schedule_desc()}
                </span>
              </div>
            </Select.Trigger>
            <Select.Content>
              {#each Object.keys(REMINDER_SCHEDULES) as value}
                <Select.Item {value}>{getReminderScheduleLabel(value, m)}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <RecurrenceFields
      {form}
      formData={sf.formData}
      recurrenceTypes={REMINDER_RECURRENCE_TYPES}
      getLabel={getRecurrenceTypeLabel}
      endDateField="recurrenceEndDate"
      intervalShowMode="not_none"
      endDateShowMode="not_none"
      {m}
      recurrenceTypeLabel={m.reminder_form_recurrence_type_label()}
      recurrenceTypeDesc={m.reminder_form_recurrence_type_desc()}
      intervalLabel={m.recurrence_every()}
      intervalDesc={m.reminder_form_recurrence_interval_desc()}
      endDateLabel={m.reminder_form_recurrence_end_date_label()}
      endDateDesc={m.reminder_form_recurrence_end_date_desc()}
    />

    <Form.Field {form} name="note" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.reminder_form_note_desc()}
            >{m.reminder_form_note_label()}</FormLabel
          >
          <Textarea
            {...props}
            placeholder={m.reminder_form_note_placeholder()}
            class="resize-none"
            bind:value={$formData.note}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="isCompleted">
      <Form.Control>
        {#snippet children({ props })}
          <label class="flex items-center gap-2 text-sm font-medium">
            <Checkbox {...props} bind:checked={$formData.isCompleted} />
            <span>{m.reminder_form_is_completed_label()}</span>
          </label>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <SubmitButton processing={sf.processing} class="w-full">{m.common_submit()}</SubmitButton>
  </fieldset>
</form>
