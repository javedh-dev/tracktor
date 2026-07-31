<script lang="ts">
  import { withBase } from '$lib/utils';
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import { Textarea } from '$ui/textarea';
  import { formatDate, parseDate } from '$lib/helper/format.helper';
  import { saveInsuranceWithAttachment } from '$lib/services/insurance.service';
  import { insuranceStore } from '$stores/insurance.svelte';
  import { createSheetForm } from '$lib/composables/sheet-form.svelte';
  import * as m from '$lib/paraglide/messages';
  import {
    insuranceSchema,
    INSURANCE_RECURRENCE_TYPES,
    getInsuranceRecurrenceTypeLabel
  } from '$lib/domain/insurance';
  import { FileDropZone, AutocompleteInput } from '$lib/components/app';
  import { getInsuranceProviderSuggestions } from '$lib/services/autocomplete.service';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import IdCard from '@lucide/svelte/icons/id-card';
  import Building2 from '@lucide/svelte/icons/building-2';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import RecurrenceFields from '$lib/components/feature/shared/RecurrenceFields.svelte';
  import VehicleSelectField from '$feature/shared/VehicleSelectField.svelte';
  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';
  import { page } from '$app/state';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';

  let { data } = $props();

  let insuranceProviderSuggestions = $state<string[]>([]);
  let loadingSuggestions = $state(false);

  const existingAttachmentUrl = $derived(
    data?.attachment ? withBase(`/api/files/${data.attachment}`) : undefined
  );

  const sf = createSheetForm({
    schema: insuranceSchema,
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        sf.processing = true;
        saveInsuranceWithAttachment(
          {
            ...f.data,
            startDate: parseDate(f.data.startDate),
            endDate:
              f.data.recurrenceType !== 'none' || !f.data.endDate ? null : parseDate(f.data.endDate)
          },
          sf.attachment,
          sf.removeExistingAttachment
        ).then((res) => {
          if (res.status == 'OK') {
            toast.success(m[data ? 'insurance_toast_updated' : 'insurance_toast_saved']());
            sf.attachment = undefined;
            sheetStore.closeSheet(() => insuranceStore.reloadInsurances());
          } else {
            toast.error(m.insurance_toast_error_prefix() + res.error);
          }
          sf.processing = false;
        });
      } else {
        toast.error(m.insurance_form_error_fix());
        if (f.errors?._errors) {
          f.errors._errors.forEach((err: string) => toast.error(err));
        }
        console.error('Form validation errors:', f.errors);
      }
    }
  });

  const { form, enhance } = sf;
  const formData: any = sf.formData;

  const scope = $derived(readVehicleScope(page.url, vehicleStore.vehicles));
  const suppliedVehicleId = $derived(data?.vehicleId || (scope.isFleet ? '' : scope.vehicleId));

  $effect(() => {
    sf.resetAttachment();
    if (data) {
      formData.set({
        ...data,
        startDate: formatDate(data.startDate),
        endDate: data.endDate ? formatDate(data.endDate) : '',
        attachment: null
      });
    }
    if (suppliedVehicleId) sf.setVehicleId(suppliedVehicleId);
  });

  $effect(() => {
    loadingSuggestions = true;
    getInsuranceProviderSuggestions().then((suggestions) => {
      insuranceProviderSuggestions = suggestions;
      loadingSuggestions = false;
    });
  });
</script>

<form id="insurance-form" use:enhance onsubmit={(e) => e.preventDefault()}>
  <fieldset class="flex flex-col gap-4" disabled={sf.processing}>
    {#if !suppliedVehicleId}
      <VehicleSelectField {form} {formData} vehicles={vehicleStore.vehicles ?? []} />
    {/if}
    <Form.Field {form} name="attachment" class="w-full">
      <Form.Control>
        <FormLabel description={m.insurance_form_attachment_desc()}
          >{m.insurance_form_attachment_label()}</FormLabel
        >
        <FileDropZone
          bind:file={sf.attachment}
          existingFileUrl={existingAttachmentUrl}
          bind:removeExisting={sf.removeExistingAttachment}
          variant="attachment"
          accept="application/pdf,image/*"
        />
      </Form.Control>
    </Form.Field>
    <Form.Field {form} name="provider" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.insurance_form_provider_desc()}
            >{m.insurance_form_provider_label()}</FormLabel
          >
          <AutocompleteInput
            {...props}
            bind:value={$formData.provider}
            icon={Building2}
            suggestions={insuranceProviderSuggestions}
            loading={loadingSuggestions}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="policyNumber" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.insurance_form_policy_number_desc()}
            >{m.insurance_form_policy_number_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.policyNumber} icon={IdCard} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="startDate" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.insurance_form_start_date_desc()}
            >{m.insurance_form_start_date_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.startDate} icon={Calendar1} type="calendar" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <RecurrenceFields
      {form}
      formData={sf.formData}
      recurrenceTypes={INSURANCE_RECURRENCE_TYPES}
      getLabel={getInsuranceRecurrenceTypeLabel}
      endDateField="endDate"
      intervalShowMode="yearly_monthly"
      endDateShowMode="none"
      {m}
      recurrenceTypeLabel={m.insurance_form_recurrence_type_label()}
      recurrenceTypeDesc={m.insurance_form_recurrence_type_desc()}
      intervalLabel={m.recurrence_renew_every()}
      intervalDesc={m.insurance_form_recurrence_interval_desc()}
      endDateLabel={m.insurance_form_end_date_label()}
      endDateDesc={m.insurance_form_end_date_desc()}
    />

    <Form.Field {form} name="cost" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.insurance_form_cost_desc()}
            >{m.insurance_form_cost_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".001" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="notes" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.insurance_form_notes_desc()}
            >{m.insurance_form_notes_label()}</FormLabel
          >
          <Textarea
            {...props}
            placeholder={m.insurance_form_notes_placeholder()}
            class="resize-none"
            bind:value={$formData.notes}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <SubmitButton processing={sf.processing} class="w-full">{m.common_submit()}</SubmitButton>
  </fieldset>
</form>
