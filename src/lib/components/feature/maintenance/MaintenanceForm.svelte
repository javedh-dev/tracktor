<script lang="ts">
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
	import { FileDropZone } from '$lib/components/app';

	let { data } = $props();

	let attachment = $state<File>();
	let removeExistingAttachment = $state(false);
	let processing = $state(false);

	// For showing existing attachment when editing
	const existingAttachmentUrl = $derived(
		data?.attachment ? `/api/files/${data.attachment}` : undefined
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
						toast.success(`Maintenance Log ${data ? 'updated' : 'saved'} successfully...!!!`);
						attachment = undefined;
						sheetStore.closeSheet(maintenanceStore.refreshMaintenanceLogs);
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
					processing = false;
				});
			} else {
				toast.error(
					'Please fix the errors in the form before submitting.' + JSON.stringify(f.errors)
				);
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
</script>

<form id="maintenance-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<!-- <div class="flex w-full flex-row gap-4"> -->
		<Form.Field {form} name="attachment" class="w-full">
			<Form.Control>
				<FormLabel description="Upload receipt or maintenance document">Attachment</FormLabel>
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
					<FormLabel description="Maintenance Date">Date</FormLabel>
					<Input {...props} bind:value={$formData.date} icon={Calendar1} type="calendar" disabled />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="odometer" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Current vehicle odometer reading">Odometer</FormLabel>
					<Input {...props} bind:value={$formData.odometer} icon={CircleGauge} type="number" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="serviceCenter" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Name of Service center">Service Center</FormLabel>
					<Input {...props} bind:value={$formData.serviceCenter} icon={Hammer} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="cost" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Cost of Maintenance">Cost</FormLabel>
					<Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".01" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="notes" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="More details">Notes</FormLabel>
					<Textarea
						{...props}
						placeholder="Add more details. If any..."
						class="resize-none"
						bind:value={$formData.notes}
					/>
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<SubmitButton {processing} class="w-full">Submit</SubmitButton>
	</fieldset>
</form>
