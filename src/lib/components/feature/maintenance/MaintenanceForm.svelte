<script lang="ts">
  import { withBase } from '$lib/utils';
  import * as Form from '$ui/form/index.js';
  import FormLabel from '$appui/FormLabel.svelte';
  import Input from '$appui/input.svelte';
  import { Textarea } from '$ui/textarea';
  import { formatDate, parseDate } from '$lib/helper/format.helper';
  import { maintenanceSchema } from '$lib/domain/maintenance';
  import Banknote from '@lucide/svelte/icons/banknote';
  import Hammer from '@lucide/svelte/icons/hammer';
  import CircleGauge from '@lucide/svelte/icons/circle-gauge';
  import Calendar1 from '@lucide/svelte/icons/calendar-1';
  import SubmitButton from '$appui/SubmitButton.svelte';
  import { toast } from 'svelte-sonner';
  import { maintenanceStore } from '$stores/maintenance.svelte';
  import { saveMaintenanceLogWithAttachment } from '$lib/services/maintenance.service';
  import { createSheetForm } from '$lib/composables/sheet-form.svelte';
  import { sheetStore } from '$stores/sheet.svelte';
  import { FileDropZone, AutocompleteInput } from '$lib/components/app';
  import { getServiceCenterSuggestions } from '$lib/services/autocomplete.service';
  import { page } from '$app/state';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
  import VehicleSelectField from '$feature/shared/VehicleSelectField.svelte';
  import * as m from '$lib/paraglide/messages';

  let { data } = $props();

  let serviceCenterSuggestions = $state<string[]>([]);
  let loadingSuggestions = $state(false);

  const existingAttachmentUrl = $derived(
    data?.attachment ? withBase(`/api/files/${data.attachment}`) : undefined
  );

  const sf = createSheetForm({
    schema: maintenanceSchema,
    onUpdated: async ({ form: f }) => {
      if (f.valid) {
        sf.processing = true;
        saveMaintenanceLogWithAttachment(
          { ...f.data, date: parseDate(f.data.date) },
          sf.attachment,
          sf.removeExistingAttachment
        ).then((res) => {
          if (res.status == 'OK') {
            toast.success(data ? m.maintenance_toast_updated() : m.maintenance_toast_saved());
            sf.attachment = undefined;
            sheetStore.closeSheet(maintenanceStore.reloadMaintenanceLogs);
          } else {
            toast.error(`${m.maintenance_toast_error_prefix()}${res.error}`);
          }
          sf.processing = false;
        });
      } else {
        toast.error(`${m.maintenance_form_error_fix()} ${JSON.stringify(f.errors)}`);
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
      formData.set({ ...data, date: formatDate(data.date), attachment: null });
    }
    if (suppliedVehicleId) sf.setVehicleId(suppliedVehicleId);
  });

  $effect(() => {
    loadingSuggestions = true;
    getServiceCenterSuggestions().then((suggestions) => {
      serviceCenterSuggestions = suggestions;
      loadingSuggestions = false;
    });
  });
</script>

<form id="maintenance-form" use:enhance onsubmit={(e) => e.preventDefault()}>
  <fieldset class="flex flex-col gap-4" disabled={sf.processing}>
    {#if !suppliedVehicleId}
      <VehicleSelectField {form} {formData} vehicles={vehicleStore.vehicles ?? []} />
    {/if}
    <Form.Field {form} name="attachment" class="w-full">
      <Form.Control>
        <FormLabel description={m.maintenance_form_attachment_desc()}>
          {m.maintenance_form_attachment_label()}
        </FormLabel>
        <FileDropZone
          bind:file={sf.attachment}
          existingFileUrl={existingAttachmentUrl}
          bind:removeExisting={sf.removeExistingAttachment}
          variant="attachment"
          accept="application/pdf,image/*"
        />
      </Form.Control>
    </Form.Field>
    <Form.Field {form} name="date" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.maintenance_form_date_desc()}>
            {m.maintenance_form_date_label()}
          </FormLabel>
          <Input {...props} bind:value={$formData.date} icon={Calendar1} type="calendar" disabled />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="odometer" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.maintenance_form_odometer_desc()}>
            {m.maintenance_form_odometer_label()}
          </FormLabel>
          <Input {...props} bind:value={$formData.odometer} icon={CircleGauge} type="number" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="serviceCenter" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.maintenance_form_service_center_desc()}>
            {m.maintenance_form_service_center_label()}
          </FormLabel>
          <AutocompleteInput
            {...props}
            bind:value={$formData.serviceCenter}
            icon={Hammer}
            suggestions={serviceCenterSuggestions}
            loading={loadingSuggestions}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="cost" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.maintenance_form_cost_desc()}>
            {m.maintenance_form_cost_label()}
          </FormLabel>
          <Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".001" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="notes" class="w-full">
      <Form.Control>
        {#snippet children({ props })}
          <FormLabel description={m.maintenance_form_notes_desc()}>
            {m.maintenance_form_notes_label()}
          </FormLabel>
          <Textarea
            {...props}
            placeholder={m.maintenance_form_notes_placeholder()}
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
