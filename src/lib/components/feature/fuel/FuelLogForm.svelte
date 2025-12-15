<script lang="ts">
	import Checkbox from '$ui/checkbox/checkbox.svelte';
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { Textarea } from '$ui/textarea';
	import { formatDate, getFuelUnit, parseDate, roundNumber } from '$lib/helper/format.helper';
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

	let { data } = $props();

	let attachment = $state<File>();
	let removeExistingAttachment = $state(false);
	let processing = $state(false);

	// Get the selected vehicle to determine fuel type and units
	const selectedVehicle = $derived(
		vehicleStore.vehicles?.find((v) => v.id === vehicleStore.selectedId)
	);
	// const fuelUnit = $derived(selectedVehicle?.fuelType ? FUEL_UNITS[selectedVehicle.fuelType] : 'L');
	const volumeLabel = $derived(selectedVehicle?.fuelType === 'ev' ? 'Energy' : 'Volume');

	// For showing existing attachment when editing
	const existingAttachmentUrl = $derived(
		data?.attachment ? `/api/files/${data.attachment}` : undefined
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
						toast.success(`FuelLog ${data ? 'updated' : 'saved'} successfully...!!!`);
						attachment = undefined;
						sheetStore.closeSheet(() => fuelLogStore.refreshFuelLogs());
					} else {
						toast.error(`Error while saving : ${res.error}`);
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
				date: formatDate(data.date),
				fuelAmount: roundNumber(data.fuelAmount),
				cost: roundNumber(data.cost),
				attachment: null // Don't include attachment in form data, handle separately
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

<form use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<Form.Field {form} name="attachment" class="w-full">
			<Form.Control>
				<FormLabel description="Upload receipt or fuel log document">Attachment</FormLabel>
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
					<FormLabel description="Date of fuel refill">Date</FormLabel>
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
		<Form.Field {form} name="fuelAmount" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel
						description={selectedVehicle?.fuelType === 'ev' ? 'Energy consumed' : 'Volume of fuel'}
						>{volumeLabel} ({getFuelUnit(selectedVehicle?.fuelType as string)})</FormLabel
					>
					<Input
						{...props}
						bind:value={$formData.fuelAmount}
						icon={Fuel}
						type="number"
						step=".01"
						placeholder={`Enter ${volumeLabel.toLowerCase()} in ${getFuelUnit(selectedVehicle?.fuelType as string)}`}
					/>
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="cost" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel
						description={selectedVehicle?.fuelType === 'ev' ? 'Cost of charging' : 'Cost of refill'}
						>Cost</FormLabel
					>
					<Input {...props} bind:value={$formData.cost} icon={Banknote} type="number" step=".01" />
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
								description={selectedVehicle?.fuelType === 'ev'
									? 'Is battery fully charged?'
									: 'Is tank filled to top?'}
							>
								{selectedVehicle?.fuelType === 'ev' ? 'Full Charge' : 'Full Tank'}
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
							<FormLabel class="font-normal" description="Were any of last entries missed?">
								Missed Last
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
