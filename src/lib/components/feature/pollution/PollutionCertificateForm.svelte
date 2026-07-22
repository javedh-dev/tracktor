<script lang="ts">
  import { withBase } from '$lib/utils';
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import { Textarea } from '$ui/textarea';
  import { formatDate, parseDate } from '$lib/helper/format.helper';
  import { savePollutionCertificateWithAttachment } from '$lib/services/pucc.service';
  import { puccStore } from '$stores/pucc.svelte';
  import { createSheetForm } from '$lib/composables/sheet-form.svelte';
  import {
    pollutionCertificateSchema,
    PUCC_RECURRENCE_TYPES,
    getPuccRecurrenceTypeLabel
  } from '$lib/domain/pucc';
  import { FileDropZone, AutocompleteInput } from '$lib/components/app';
  import { getTestingCenterSuggestions } from '$lib/services/autocomplete.service';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import IdCard from '@lucide/svelte/icons/id-card';
  import TestTubeDiagonal from '@lucide/svelte/icons/test-tube-diagonal';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import RecurrenceFields from '$lib/components/feature/shared/RecurrenceFields.svelte';
  import * as m from '$lib/paraglide/messages';

  import { toast } from 'svelte-sonner';
  import { sheetStore } from '$stores/sheet.svelte';

  let { data } = $props();

  let testingCenterSuggestions = $state<string[]>([]);
  let loadingSuggestions = $state(false);

  const existingAttachmentUrl = $derived(
    data?.attachment ? withBase(`/api/files/${data.attachment}`) : undefined
  );

  const sf = createSheetForm({
    schema: pollutionCertificateSchema,
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        sf.processing = true;
        savePollutionCertificateWithAttachment(
          {
            ...f.data,
            issueDate: parseDate(f.data.issueDate),
            expiryDate:
              f.data.recurrenceType !== 'none' || !f.data.expiryDate
                ? null
                : parseDate(f.data.expiryDate)
          },
          sf.attachment,
          sf.removeExistingAttachment
        ).then((res) => {
          if (res.status == 'OK') {
            toast.success(m[data ? 'pollution_toast_updated' : 'pollution_toast_saved']());
            sf.attachment = undefined;
            sheetStore.closeSheet(puccStore.refreshPuccs);
          } else {
            toast.error(m.pollution_toast_error_prefix() + res.error);
          }
          sf.processing = false;
        });
      }
    }
  });

  const { form, enhance } = sf;
  const formData: any = sf.formData;

  $effect(() => {
    sf.resetAttachment();
    if (data) {
      formData.set({
        ...data,
        issueDate: formatDate(data.issueDate),
        expiryDate: data.expiryDate ? formatDate(data.expiryDate) : '',
        attachment: null
      });
    }
    sf.setVehicleId();
  });

  $effect(() => {
    loadingSuggestions = true;
    getTestingCenterSuggestions().then((suggestions) => {
      testingCenterSuggestions = suggestions;
      loadingSuggestions = false;
    });
  });
</script>

<form id="pollution-certificate-form" use:enhance onsubmit={(e) => e.preventDefault()}>
  <fieldset class="flex flex-col gap-4" disabled={sf.processing}>
    <Form.Field {form} name="attachment" class="w-full">
      <Form.Control>
        <FormLabel description={m.pollution_form_attachment_desc()}
          >{m.pollution_form_attachment_label()}</FormLabel
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

    <Form.Field {form} name="certificateNumber" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.pollution_form_certificate_number_desc()}
            >{m.pollution_form_certificate_number_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.certificateNumber} icon={IdCard} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="issueDate" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.pollution_form_issue_date_desc()}
            >{m.pollution_form_issue_date_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.issueDate} icon={Calendar1} type="calendar" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <RecurrenceFields
      {form}
      formData={sf.formData}
      recurrenceTypes={PUCC_RECURRENCE_TYPES}
      getLabel={getPuccRecurrenceTypeLabel}
      endDateField="expiryDate"
      intervalShowMode="yearly_monthly"
      endDateShowMode="none"
      {m}
      recurrenceTypeLabel={m.pollution_form_recurrence_type_label()}
      recurrenceTypeDesc={m.pollution_form_recurrence_type_desc()}
      intervalLabel={m.recurrence_renew_every()}
      intervalDesc={m.pollution_form_recurrence_interval_desc()}
      endDateLabel={m.pollution_form_expiry_date_label()}
      endDateDesc={m.pollution_form_expiry_date_desc()}
    />

    <Form.Field {form} name="testingCenter" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.pollution_form_testing_center_desc()}
            >{m.pollution_form_testing_center_label()}</FormLabel
          >
          <AutocompleteInput
            {...props}
            bind:value={$formData.testingCenter}
            icon={TestTubeDiagonal}
            suggestions={testingCenterSuggestions}
            loading={loadingSuggestions}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="notes" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.pollution_form_notes_desc()}
            >{m.pollution_form_notes_label()}</FormLabel
          >
          <Textarea
            {...props}
            placeholder={m.pollution_form_notes_placeholder()}
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
