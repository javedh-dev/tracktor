<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { savePollutionCertificate } from '$lib/services/pucc.service';
	import { puccStore } from '$lib/stores/pucc.svelte';
	import { pollutionCertificateSchema } from '$lib/domain/pucc';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import IdCard from '@lucide/svelte/icons/id-card';
	import TestTubeDiagonal from '@lucide/svelte/icons/test-tube-diagonal';

	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { sheetStore } from '$lib/stores/sheet.svelte';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';

	let { data } = $props();

	const form = superForm(defaults(zod4(pollutionCertificateSchema)), {
		validators: zod4(pollutionCertificateSchema),
		SPA: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				savePollutionCertificate({
					...f.data,
					issueDate: parseDate(f.data.issueDate),
					expiryDate: parseDate(f.data.expiryDate)
				}).then((res) => {
					if (res.status == 'OK') {
						toast.success(
							`Pollution Certificate ${puccStore.editMode ? 'updated' : 'saved'} successfully...!!!`
						);
						sheetStore.closeSheet(puccStore.refreshPuccs);
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
				});
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (data)
			formData.set({
				...data,
				issueDate: formatDate(data.issueDate),
				expiryDate: formatDate(data.expiryDate)
			});
		formData.update((fd) => {
			return {
				...fd,
				vehicleId: vehicleStore.selectedId || ''
			};
		});
	});
</script>

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
					<Input {...props} bind:value={$formData.expiryDate} icon={Calendar1} type="calendar" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

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
