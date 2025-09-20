<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/formatting';
	import { savePollutionCertificate } from '$lib/services/pucc.service';
	import { puccModelStore } from '$lib/stores/pucc';
	import { vehiclesStore } from '$lib/stores/vehicle';
	import { pollutionCertificateSchema, type PollutionCertificate } from '$lib/types/pucc';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import IdCard from '@lucide/svelte/icons/calendar-1';
	import TestTubeDiagonal from '@lucide/svelte/icons/test-tube-diagonal';

	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';

	let open = $state(false);
	let certificateToEdit: PollutionCertificate | undefined = $state();
	let vehicleId: string | undefined = $state();
	let editMode = $state(false);

	puccModelStore.subscribe((data) => {
		open = data.show;
		certificateToEdit = data.entryToEdit;
		vehicleId = data.vehicleId;
		editMode = data.editMode;
	});

	const form = superForm(defaults(zod4(pollutionCertificateSchema)), {
		validators: zod4(pollutionCertificateSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				savePollutionCertificate({
					...f.data,
					issueDate: parseDate(f.data.issueDate),
					expiryDate: parseDate(f.data.expiryDate)
				}).then((res) => {
					if (res.status == 'OK') {
						vehiclesStore.fetchVehicles(localStorage.getItem('userPin') || '');
						toast.success(
							`Pollution Certificate ${certificateToEdit ? 'updated' : 'saved'} successfully...!!!`
						);
						puccModelStore.hide();
					}
				});
			} else {
				toast.error('Please fix the errors in the form.');
				console.error(JSON.stringify(f.data, null, 2));
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (certificateToEdit) {
			formData.set({
				...certificateToEdit,
				issueDate: formatDate(certificateToEdit.issueDate),
				expiryDate: formatDate(certificateToEdit.expiryDate)
			});
		}
		formData.update((data) => {
			return { ...data, vehicleId: vehicleId || '' };
		});
	});
</script>

<AppSheet
	{open}
	close={() => puccModelStore.hide()}
	title={editMode ? 'Edit Pollution Certificate' : 'Add Pollution Certificate'}
>
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4">
			<Form.Field {form} name="certificateNumber" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Pollution certificate number">Certificate Number</Form.Label>
						<Input {...props} bind:value={$formData.certificateNumber} icon={IdCard} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex w-full flex-row gap-4">
				<Form.Field {form} name="issueDate" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label description="Certificate issue date">Issue Date</Form.Label>
							<Input {...props} bind:value={$formData.issueDate} icon={Calendar1} type="calendar" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="expiryDate" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label description="Certificate expiry date">Expiry Date</Form.Label>
							<Input
								{...props}
								bind:value={$formData.expiryDate}
								icon={Calendar1}
								type="calendar"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Form.Field {form} name="testingCenter" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Testing center name">Testing Center</Form.Label>
						<Input {...props} bind:value={$formData.testingCenter} icon={TestTubeDiagonal} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="notes" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Additional notes">Notes</Form.Label>
						<Textarea
							{...props}
							placeholder="Add additional notes..."
							class="resize-none"
							bind:value={$formData.notes}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Button>Submit</Form.Button>
		</div>
	</form>
</AppSheet>
