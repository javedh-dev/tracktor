<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { Textarea } from '$ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { saveInsuranceWithAttachment } from '$lib/services/insurance.service';
	import { insuranceStore } from '$stores/insurance.svelte';
	import { insuranceSchema, INSURANCE_RECURRENCE_TYPES } from '$lib/domain/insurance';
	import * as Select from '$ui/select/index.js';
	import Repeat from '@lucide/svelte/icons/repeat';
	import { FileDropZone } from '$lib/components/app';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import IdCard from '@lucide/svelte/icons/id-card';
	import Building2 from '@lucide/svelte/icons/building-2';
	import SubmitButton from '$appui/SubmitButton.svelte';
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

	const form = superForm(defaults(zod4(insuranceSchema)), {
		validators: zod4(insuranceSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				saveInsuranceWithAttachment(
					{
						...f.data,
						startDate: parseDate(f.data.startDate),
						endDate:
							f.data.recurrenceType !== 'none' || !f.data.endDate ? null : parseDate(f.data.endDate)
					},
					attachment,
					removeExistingAttachment
				).then((res) => {
					if (res.status == 'OK') {
						toast.success(`Insurance ${data ? 'updated' : 'saved'} successfully...!!!`);
						attachment = undefined;
						sheetStore.closeSheet(() => insuranceStore.refreshInsurances());
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
					processing = false;
				});
			} else {
				toast.error('Please fix the errors in the form before submitting.');
				f.errors._errors?.forEach((err) => toast.error(err));
				console.error('Form validation errors:', f.errors);
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (data) {
			formData.set({
				...data,
				startDate: formatDate(data.startDate),
				endDate: data.endDate ? formatDate(data.endDate) : '',
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

<form id="insurance-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<Form.Field {form} name="attachment" class="w-full">
			<Form.Control>
				<FormLabel description="Upload policy document">Attachment</FormLabel>
				<FileDropZone
					bind:file={attachment}
					existingFileUrl={existingAttachmentUrl}
					bind:removeExisting={removeExistingAttachment}
					variant="attachment"
					accept="application/pdf,image/*"
				/>
			</Form.Control>
		</Form.Field>
		<Form.Field {form} name="provider" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Insurance provider name">Provider</FormLabel>
					<Input {...props} bind:value={$formData.provider} icon={Building2} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="policyNumber" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Insurance policy number">Policy Number</FormLabel>
					<Input {...props} bind:value={$formData.policyNumber} icon={IdCard} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="startDate" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Insurance start date">Start Date</FormLabel>
					<Input {...props} bind:value={$formData.startDate} icon={Calendar1} type="calendar" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

        <Form.Field {form} name="recurrenceType" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="How should this insurance renew?">Recurrence</FormLabel>
					<Select.Root bind:value={$formData.recurrenceType} type="single">
						<Select.Trigger {...props} class="w-full">
							<div class="flex items-center gap-2">
								<Repeat class="h-4 w-4" />
								<span>
									{INSURANCE_RECURRENCE_TYPES[
										$formData.recurrenceType as keyof typeof INSURANCE_RECURRENCE_TYPES
									] || 'Select recurrence'}
								</span>
							</div>
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(INSURANCE_RECURRENCE_TYPES) as [value, label]}
								<Select.Item {value}>{label}</Select.Item>
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
						<FormLabel description="Renewal frequency">
							Renew every {$formData.recurrenceInterval || 1}
							{$formData.recurrenceType === 'yearly' ? 'year(s)' : 'month(s)'}
						</FormLabel>
						<Input {...props} bind:value={$formData.recurrenceInterval} type="number" min="1" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		{#if $formData.recurrenceType === 'none'}
			<Form.Field {form} name="endDate" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description="Insurance end date">End Date</FormLabel>
						<Input {...props} bind:value={$formData.endDate} icon={Calendar1} type="calendar" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="cost" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Insurance cost">Cost</FormLabel>
					<Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".01" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="notes" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Additional notes">Notes</FormLabel>
					<Textarea
						{...props}
						placeholder="Add more details. If any..."
						class="resize-none"
						bind:value={$formData.notes}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<SubmitButton {processing} class="w-full">Submit</SubmitButton>
	</fieldset>
</form>
