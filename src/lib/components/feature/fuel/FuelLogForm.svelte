<script lang="ts">
  import { withBase } from '$lib/utils';
  import Checkbox from '$ui/checkbox/checkbox.svelte';
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import { Textarea } from '$ui/textarea';
  import {
    formatDate,
    getCurrencySymbol,
    getFuelUnit,
    parseDate,
    roundNumber
  } from '$lib/helper/format.helper';
  import { saveFuelLogWithAttachment } from '$lib/services/fuel.service';
  import { fuelLogStore } from '$stores/fuel-log.svelte';
  import { FileDropZone } from '$lib/components/app';
  import { fuelSchema } from '$lib/domain/fuel';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import CircleGauge from '@lucide/svelte/icons/circle-gauge';
  import Fuel from '@lucide/svelte/icons/fuel';
  import SubmitButton from '$appui/SubmitButton.svelte';

  import { toast } from 'svelte-sonner';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod4 } from 'sveltekit-superforms/adapters';
  import { sheetStore } from '$stores/sheet.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import {
    form_date,
    form_date_desc,
    form_odometer,
    form_odometer_desc,
    form_volume_fuel,
    form_volume_energy,
    form_rate,
    form_cost,
    form_cost_desc,
    form_cost_desc_ev,
    form_full_charge,
    form_full_tank,
    form_full_charge_desc,
    form_full_tank_desc,
    form_missed_last,
    form_missed_last_desc,
    form_notes,
    form_notes_placeholder,
    form_attachment,
    common_submit,
    fuel_toast_saved,
    fuel_toast_updated,
    fuel_toast_error_prefix
  } from '$lib/paraglide/messages/_index.js';

  let { data } = $props();
  type CalculatedField = 'fuelAmount' | 'rate' | 'cost';
  const calculatedFields: CalculatedField[] = ['fuelAmount', 'rate', 'cost'];

  let attachment = $state<File>();
  let removeExistingAttachment = $state(false);
  let processing = $state(false);
  let derivedField = $state<CalculatedField | null>(null);
  // Get the selected vehicle to determine fuel type and units
  const selectedVehicle = $derived(
    vehicleStore.vehicles?.find((v) => v.id === vehicleStore.selectedId)
  );
  // const fuelUnit = $derived(selectedVehicle?.fuelType ? FUEL_UNITS[selectedVehicle.fuelType] : 'L');
  const volumeLabel = $derived(
    selectedVehicle?.fuelType === 'electric' ? form_volume_energy() : form_volume_fuel()
  );
  const rateDescription = $derived(
    `${getCurrencySymbol()} / ${getFuelUnit(selectedVehicle?.fuelType as string)}`
  );

  // For showing existing attachment when editing
  const existingAttachmentUrl = $derived(
    data?.attachment ? withBase(`/api/files/${data.attachment}`) : undefined
  );

  const form = superForm(defaults(zod4(fuelSchema)), {
    validators: zod4(fuelSchema),
    SPA: true,
    resetForm: false,
    validationMethod: 'onsubmit',
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        processing = true;
        saveFuelLogWithAttachment(
          { ...f.data, date: parseDate(f.data.date) },
          attachment,
          removeExistingAttachment
        ).then((res) => {
          if (res.status == 'OK') {
            toast.success(data ? fuel_toast_updated() : fuel_toast_saved());
            attachment = undefined;
            sheetStore.closeSheet(() => fuelLogStore.refreshFuelLogs());
          } else {
            toast.error(`${fuel_toast_error_prefix()}${res.error}`);
          }
          processing = false;
        });
      }
    }
  });

  const { form: formData, enhance } = form;

  const hasPositiveNumber = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

  const roundTo = (value: number, decimals: number): number => Number(value.toFixed(decimals));

  function getCalculatedValue(
    field: CalculatedField,
    values: Record<CalculatedField, number | null>
  ): number {
    if (field === 'cost') {
      return roundTo((values.fuelAmount || 0) * (values.rate || 0), 2);
    }

    if (field === 'fuelAmount') {
      return hasPositiveNumber(values.rate) ? roundTo((values.cost || 0) / values.rate, 3) : 0;
    }

    return hasPositiveNumber(values.fuelAmount)
      ? roundTo((values.cost || 0) / values.fuelAmount, 3)
      : 0;
  }

  function updateCalculatedField(source: CalculatedField) {
    const { fuelAmount, rate, cost } = $formData;
    const values = { fuelAmount, rate, cost };

    if (derivedField) {
      const currentDerivedField = derivedField;

      if (source === derivedField) {
        return;
      }

      const sourceFields = calculatedFields.filter((field) => field !== currentDerivedField);
      if (sourceFields.every((field) => hasPositiveNumber(values[field]))) {
        formData.update((fd) => ({
          ...fd,
          [currentDerivedField]: getCalculatedValue(currentDerivedField, values)
        }));
      } else {
        formData.update((fd) => ({ ...fd, [currentDerivedField]: 0 }));
        derivedField = null;
      }

      return;
    }

    const missingField = calculatedFields.find((field) => !hasPositiveNumber(values[field]));
    if (!missingField) {
      return;
    }

    const sourceFields = calculatedFields.filter((field) => field !== missingField);
    if (!sourceFields.every((field) => hasPositiveNumber(values[field]))) {
      return;
    }

    derivedField = missingField;
    formData.update((fd) => ({ ...fd, [missingField]: getCalculatedValue(missingField, values) }));
  }

  function queueCalculatedFieldUpdate(source: CalculatedField) {
    queueMicrotask(() => updateCalculatedField(source));
  }

  $effect(() => {
    if (data) {
      formData.set({
        ...data,
        date: formatDate(data.date),
        fuelAmount:
          data.fuelAmount !== null && data.fuelAmount !== undefined
            ? roundNumber(data.fuelAmount)
            : null,
        rate: data.rate !== null && data.rate !== undefined ? roundTo(data.rate, 3) : null,
        cost: data.cost !== null && data.cost !== undefined ? roundNumber(data.cost) : null,
        odometer: data.odometer,
        attachment: null // Don't include attachment in form data, handle separately
      });
      // Reset attachment state when editing existing record
      attachment = undefined;
      removeExistingAttachment = false;
    } else {
      // Initialize form with empty/default values for new entry
      formData.set({
        id: null,
        vehicleId: vehicleStore.selectedId || '',
        date: formatDate(new Date()),
        odometer: null,
        filled: true,
        missedLast: false,
        fuelAmount: null,
        rate: null,
        cost: 0,
        notes: null,
        attachment: null
      });
    }
    derivedField = null;
    formData.update((fd) => {
      return {
        ...fd,
        vehicleId: vehicleStore.selectedId || ''
      };
    });
  });
</script>

<form id="fuel-log-form" use:enhance onsubmit={(e) => e.preventDefault()}>
  <fieldset class="flex flex-col gap-4" disabled={processing}>
    <Form.Field {form} name="date" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={form_date_desc()}>{form_date()}</FormLabel>
          <Input {...props} bind:value={$formData.date} icon={Calendar1} type="calendar" disabled />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="odometer" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={form_odometer_desc()}>{form_odometer()}</FormLabel>
          <Input
            {...props}
            bind:value={$formData.odometer}
            icon={CircleGauge}
            type="number"
            step=".01"
          />
        {/snippet}
      </Form.Control>
      <!-- <Form.Description>Model of the vehicle</Form.Description> -->
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="fuelAmount" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel
            description={selectedVehicle?.fuelType === 'electric'
              ? form_volume_energy()
              : form_volume_fuel()}
            >{volumeLabel} ({getFuelUnit(selectedVehicle?.fuelType as string)})</FormLabel
          >
          <Input
            {...props}
            bind:value={$formData.fuelAmount}
            icon={Fuel}
            disabled={derivedField === 'fuelAmount'}
            oninput={() => queueCalculatedFieldUpdate('fuelAmount')}
            type="number"
            step=".001"
            placeholder={`${volumeLabel} (${getFuelUnit(selectedVehicle?.fuelType as string)})`}
          />
        {/snippet}
      </Form.Control>
      <!-- <Form.Description>Model of the vehicle</Form.Description> -->
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="rate" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={rateDescription}>{form_rate()}</FormLabel>
          <Input
            {...props}
            bind:value={$formData.rate}
            icon={Banknote}
            disabled={derivedField === 'rate'}
            oninput={() => queueCalculatedFieldUpdate('rate')}
            type="number"
            step=".001"
            placeholder={rateDescription}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="cost" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel
            description={selectedVehicle?.fuelType === 'electric'
              ? form_cost_desc_ev()
              : form_cost_desc()}>{form_cost()}</FormLabel
          >
          <Input
            {...props}
            bind:value={$formData.cost}
            icon={Banknote}
            disabled={derivedField === 'cost'}
            oninput={() => queueCalculatedFieldUpdate('cost')}
            type="number"
            step=".001"
          />
        {/snippet}
      </Form.Control>
      <!-- <Form.Description>Model of the vehicle</Form.Description> -->
      <Form.FieldErrors />
    </Form.Field>
    <div class="flex w-full flex-row justify-around gap-4">
      <Form.Field {form} name="filled" class="w-full">
        <Form.Control>
          {#snippet children({ props })}
            <div class="flex flex-row items-center gap-2">
              <Checkbox {...props} bind:checked={$formData.filled} />
              <FormLabel
                class="font-normal"
                description={selectedVehicle?.fuelType === 'electric'
                  ? form_full_charge_desc()
                  : form_full_tank_desc()}
              >
                {selectedVehicle?.fuelType === 'electric' ? form_full_charge() : form_full_tank()}
              </FormLabel>
            </div>
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="missedLast" class="w-full">
        <Form.Control>
          {#snippet children({ props })}
            <div class="flex flex-row items-center gap-2">
              <Checkbox {...props} bind:checked={$formData.missedLast} />
              <FormLabel class="font-normal" description={form_missed_last_desc()}>
                {form_missed_last()}
              </FormLabel>
            </div>
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </div>
    <Form.Field {form} name="notes" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={form_notes_placeholder()}>{form_notes()}</FormLabel>
          <Textarea
            {...props}
            placeholder={form_notes_placeholder()}
            class="resize-none"
            bind:value={$formData.notes}
          />
        {/snippet}
      </Form.Control>
      <!-- <Form.Description>Model of the vehicle</Form.Description> -->
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="attachment" class="w-full">
      <Form.Control>
        <FormLabel description={form_attachment()}>{form_attachment()}</FormLabel>
        <FileDropZone
          bind:file={attachment}
          existingFileUrl={existingAttachmentUrl}
          bind:removeExisting={removeExistingAttachment}
          variant="attachment"
          accept="application/pdf,image/*"
        />
      </Form.Control>
    </Form.Field>
    <SubmitButton {processing} class="w-full">{common_submit()}</SubmitButton>
  </fieldset>
</form>
