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
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { maintenanceStore } from '$stores/maintenance.svelte';
	import { saveMaintenanceLogWithAttachment } from '$lib/services/maintenance.service';
	import { sheetStore } from '$stores/sheet.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { FileDropZone, AutocompleteInput } from '$lib/components/app';
	import { getServiceCenterSuggestions } from '$lib/services/autocomplete.service';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	let attachment = $state<File>();
	let removeExistingAttachment = $state(false);
	let processing = $state(false);
	let serviceCenterSuggestions = $state<string[]>([]);
	let loadingSuggestions = $state(false);

	// For showing existing attachment when editing
	const existingAttachmentUrl = $derived(
		data?.attachment ? withBase(`/api/files/${data.attachment}`) : undefined
	);

	const form = superForm(defaults(zod4(maintenanceSchema)), {
		validators: zod4(maintenanceSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				saveMaintenanceLogWithAttachment(
					{ ...f.data, date: parseDate(f.data.date) },
					attachment,
					removeExistingAttachment
				).then((res) => {
					if (res.status == 'OK') {
						toast.success(data ? m.maintenance_toast_updated() : m.maintenance_toast_saved());
						attachment = undefined;
						sheetStore.closeSheet(maintenanceStore.refreshMaintenanceLogs);
					} else {
						toast.error(`${m.maintenance_toast_error_prefix()}${res.error}`);
					}
					processing = false;
				});
			} else {
				toast.error(`${m.maintenance_form_error_fix()} ${JSON.stringify(f.errors)}`);
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (data) {
			formData.set({ ...data, date: formatDate(data.date), attachment: null });
			// Reset attachment state when editing existing record
			attachment = undefined;
			removeExistingAttachment = false;
		}
		formData.update((fd) => {
			return {
				...fd,
				vehicleId: vehicleStore.selectedId || ''
			};
		});
	});

	// Load autocomplete suggestions
	$effect(() => {
		loadingSuggestions = true;
		getServiceCenterSuggestions().then((suggestions) => {
			serviceCenterSuggestions = suggestions;
			loadingSuggestions = false;
		});
	});
</script>

<form id="maintenance-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<!-- <div class="flex w-full flex-row gap-4"> -->
		<Form.Field {form} name="attachment" class="w-full">
			<Form.Control>
				<FormLabel description={m.maintenance_form_attachment_desc()}>
					{m.maintenance_form_attachment_label()}
				</FormLabel>
				<FileDropZone
					bind:file={attachment}
					existingFileUrl={existingAttachmentUrl}
					bind:removeExisting={removeExistingAttachment}
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
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
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
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="cost" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.maintenance_form_cost_desc()}>
						{m.maintenance_form_cost_label()}
					</FormLabel>
					<Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".01" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
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
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<SubmitButton {processing} class="w-full">{m.common_submit()}</SubmitButton>
	</fieldset>
</form>
