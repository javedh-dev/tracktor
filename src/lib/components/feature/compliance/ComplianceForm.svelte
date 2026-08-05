<script lang="ts">
  import { withBase } from '$lib/utils';
  import * as Form from '$ui/form/index.js';
  import * as Select from '$ui/select/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import { Textarea } from '$ui/textarea';
  import { formatDate, parseDate } from '$lib/helper/format.helper';
  import { saveComplianceWithAttachment } from '$lib/services/compliance.service';
  import { complianceStore } from '$stores/compliance.svelte';
  import { createSheetForm } from '$lib/composables/sheet-form.svelte';
  import * as m from '$lib/paraglide/messages';
  import {
    complianceSchema,
    COMPLIANCE_TYPES,
    COMPLIANCE_RECURRENCE_TYPES,
    getComplianceRecurrenceTypeLabel,
    getComplianceTypeLabel,
    getComplianceTypeIcon,
    getComplianceDocumentNumberLabel,
    getComplianceIssuerLabel
  } from '$lib/domain/compliance';
  import { FileDropZone, AutocompleteInput } from '$lib/components/app';
  import { getComplianceIssuerSuggestions } from '$lib/services/autocomplete.service';
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

  let issuerSuggestions = $state<string[]>([]);
  let loadingSuggestions = $state(false);

  const existingAttachmentUrl = $derived(
    data?.attachment ? withBase(`/api/files/${data.attachment}`) : undefined
  );

  const sf = createSheetForm({
    schema: complianceSchema,
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        sf.processing = true;
        saveComplianceWithAttachment(
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
            toast.success(m[data ? 'compliance_toast_updated' : 'compliance_toast_saved']());
            sf.attachment = undefined;
            sheetStore.closeSheet(() => complianceStore.reloadDocuments());
          } else {
            toast.error(m.compliance_toast_error_prefix() + res.error);
          }
          sf.processing = false;
        });
      } else {
        toast.error(m.compliance_form_error_fix());
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
    } else {
      formData.update((fd: any) => ({ ...fd, type: fd.type || 'insurance' }));
    }
    if (suppliedVehicleId) sf.setVehicleId(suppliedVehicleId);
  });

  $effect(() => {
    loadingSuggestions = true;
    getComplianceIssuerSuggestions($formData.type).then((suggestions) => {
      issuerSuggestions = suggestions;
      loadingSuggestions = false;
    });
  });
</script>

<form id="compliance-form" use:enhance onsubmit={(e) => e.preventDefault()}>
  <fieldset class="flex flex-col gap-4" disabled={sf.processing}>
    {#if !suppliedVehicleId}
      <VehicleSelectField {form} {formData} vehicles={vehicleStore.vehicles ?? []} />
    {/if}
    <Form.Field {form} name="type" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          {@const TypeIcon = getComplianceTypeIcon($formData.type)}
          <FormLabel description={m.compliance_form_type_desc()} required
            >{m.compliance_form_type_label()}</FormLabel
          >
          <Select.Root bind:value={$formData.type} type="single">
            <Select.Trigger {...props} class="w-full">
              <div class="flex items-center justify-start">
                <TypeIcon class="mr-2 h-4 w-4" />
                <span>{getComplianceTypeLabel($formData.type, m)}</span>
              </div>
            </Select.Trigger>
            <Select.Content>
              {#each Object.keys(COMPLIANCE_TYPES) as value}
                {@const ItemIcon = getComplianceTypeIcon(value)}
                <Select.Item {value}>
                  <ItemIcon class="mr-2 h-4 w-4" />
                  {getComplianceTypeLabel(value, m)}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    {#if $formData.type === 'other'}
      <Form.Field {form} name="otherLabel" class="w-full">
        <Form.Control>
          {#snippet children({ props })}
            <FormLabel description={m.compliance_form_other_label_desc()} required
              >{m.compliance_form_other_label_label()}</FormLabel
            >
            <Input {...props} bind:value={$formData.otherLabel} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    {/if}

    <Form.Field {form} name="attachment" class="w-full">
      <Form.Control>
        <FormLabel description={m.compliance_form_attachment_desc()}
          >{m.compliance_form_attachment_label()}</FormLabel
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

    <Form.Field {form} name="issuer" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.compliance_form_issuer_desc()}
            >{getComplianceIssuerLabel($formData.type, m)}</FormLabel
          >
          <AutocompleteInput
            {...props}
            bind:value={$formData.issuer}
            icon={Building2}
            suggestions={issuerSuggestions}
            loading={loadingSuggestions}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="documentNumber" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.compliance_form_document_number_desc()}
            >{getComplianceDocumentNumberLabel($formData.type, m)}</FormLabel
          >
          <Input {...props} bind:value={$formData.documentNumber} icon={IdCard} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="startDate" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.compliance_form_start_date_desc()}
            >{m.compliance_form_start_date_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.startDate} icon={Calendar1} type="calendar" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <RecurrenceFields
      {form}
      formData={sf.formData}
      recurrenceTypes={COMPLIANCE_RECURRENCE_TYPES}
      getLabel={getComplianceRecurrenceTypeLabel}
      endDateField="endDate"
      intervalShowMode="yearly_monthly"
      endDateShowMode="none"
      {m}
      recurrenceTypeLabel={m.compliance_form_recurrence_type_label()}
      recurrenceTypeDesc={m.compliance_form_recurrence_type_desc()}
      intervalLabel={m.recurrence_renew_every()}
      intervalDesc={m.compliance_form_recurrence_interval_desc()}
      endDateLabel={m.compliance_form_end_date_label()}
      endDateDesc={m.compliance_form_end_date_desc()}
    />

    <Form.Field {form} name="cost" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.compliance_form_cost_desc()}
            >{m.compliance_form_cost_label()}</FormLabel
          >
          <Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".001" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="notes" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.compliance_form_notes_desc()}
            >{m.compliance_form_notes_label()}</FormLabel
          >
          <Textarea
            {...props}
            placeholder={m.compliance_form_notes_placeholder()}
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
