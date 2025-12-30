<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { Textarea } from '$ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { savePollutionCertificateWithAttachment } from '$lib/services/pucc.service';
	import { puccStore } from '$stores/pucc.svelte';
	import {
		pollutionCertificateSchema,
		PUCC_RECURRENCE_TYPES,
		getPuccRecurrenceTypeLabel
	} from '$lib/domain/pucc';
	import * as Select from '$ui/select/index.js';
	import Repeat from '@lucide/svelte/icons/repeat';
	import { FileDropZone } from '$lib/components/app';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import IdCard from '@lucide/svelte/icons/id-card';
	import TestTubeDiagonal from '@lucide/svelte/icons/test-tube-diagonal';
	import SubmitButton from '$appui/SubmitButton.svelte';
	import * as m from '$lib/paraglide/messages';

	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { sheetStore } from '$stores/sheet.svelte';
	import { vehicleStore } from '$stores/vehicle.svelte';

	let { data } = $props();

	let attachment = $state<File>();
	let removeExistingAttachment = $state(false);
	let processing = $state(false);

	// For showing existing attachment when editing
	const existingAttachmentUrl = $derived(
		data?.attachment ? `/api/files/${data.attachment}` : undefined
	);

	const form = superForm(defaults(zod4(pollutionCertificateSchema)), {
		validators: zod4(pollutionCertificateSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				savePollutionCertificateWithAttachment(
					{
						...f.data,
						issueDate: parseDate(f.data.issueDate),
						expiryDate:
							f.data.recurrenceType !== 'none' || !f.data.expiryDate
								? null
								: parseDate(f.data.expiryDate)
					},
					attachment,
					removeExistingAttachment
				).then((res) => {
					if (res.status == 'OK') {
						toast.success(
							m[puccStore.editMode ? 'pollution_toast_updated' : 'pollution_toast_saved']()
						);
						attachment = undefined;
						sheetStore.closeSheet(puccStore.refreshPuccs);
					} else {
						toast.error(m.pollution_toast_error_prefix() + res.error);
					}
					processing = false;
				});
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (data) {
			formData.set({
				...data,
				issueDate: formatDate(data.issueDate),
				expiryDate: data.expiryDate ? formatDate(data.expiryDate) : '',
				attachment: null
			});
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

<form id="pollution-certificate-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<Form.Field {form} name="attachment" class="w-full">
			<Form.Control>
				<FormLabel description={m.pollution_form_attachment_desc()}
					>{m.pollution_form_attachment_label()}</FormLabel
				>
				<FileDropZone
					bind:file={attachment}
					existingFileUrl={existingAttachmentUrl}
					bind:removeExisting={removeExistingAttachment}
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

		<Form.Field {form} name="recurrenceType" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.pollution_form_recurrence_type_desc()}
						>{m.pollution_form_recurrence_type_label()}</FormLabel
					>
					<Select.Root bind:value={$formData.recurrenceType} type="single">
						<Select.Trigger {...props} class="w-full">
							<div class="flex items-center gap-2">
								<Repeat class="h-4 w-4" />
								<span>
									{$formData.recurrenceType
										? getPuccRecurrenceTypeLabel($formData.recurrenceType, m)
										: 'Select recurrence'}
								</span>
							</div>
						</Select.Trigger>
						<Select.Content>
							{#each Object.keys(PUCC_RECURRENCE_TYPES) as value}
								<Select.Item {value}>{getPuccRecurrenceTypeLabel(value, m)}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.recurrenceType === 'yearly' || $formData.recurrenceType === 'monthly'}
			<Form.Field {form} name="recurrenceInterval" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.pollution_form_recurrence_interval_desc()}>
							{m.recurrence_renew_every()}
							{$formData.recurrenceInterval || 1}
							{$formData.recurrenceType === 'yearly'
								? m.recurrence_interval_years()
								: m.recurrence_interval_months()}
						</FormLabel>
						<Input {...props} bind:value={$formData.recurrenceInterval} type="number" min="1" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		{#if $formData.recurrenceType === 'none'}
			<Form.Field {form} name="expiryDate" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.pollution_form_expiry_date_desc()}
							>{m.pollution_form_expiry_date_label()}</FormLabel
						>
						<Input {...props} bind:value={$formData.expiryDate} icon={Calendar1} type="calendar" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="testingCenter" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.pollution_form_testing_center_desc()}
						>{m.pollution_form_testing_center_label()}</FormLabel
					>
					<Input {...props} bind:value={$formData.testingCenter} icon={TestTubeDiagonal} />
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
		<SubmitButton {processing} class="w-full">{m.common_submit()}</SubmitButton>
	</fieldset>
</form>
