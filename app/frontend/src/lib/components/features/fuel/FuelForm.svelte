<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/format.helper';
	import { saveFuelLog } from '$lib/services/fuel.service';
	import { fuelLogModelStore } from '$lib/stores/fuel-log';
	import { fuelLogStore, type FuelLogStore } from '$lib/stores/fuelLogStore';
	import { vehiclesStore } from '$lib/stores/vehicle';
	import { fuelSchema, type FuelLog } from '$lib/domain/fuel';
	import Banknote from '@lucide/svelte/icons/banknote';
	import Calendar1 from '@lucide/svelte/icons/calendar-1';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Fuel from '@lucide/svelte/icons/fuel';

	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';

	let open = $state(false);
	let logToEdit: FuelLog | undefined = $state();
	let vehicleId: string | undefined = $state();

	fuelLogStore.subscribe((data) => {
		open = data.openSheet;
		logToEdit = getSelectedLog(data);
		vehicleId = data.vehicleId;
	});

	const form = superForm(defaults(zod4(fuelSchema)), {
		validators: zod4(fuelSchema),
		SPA: true,
		validationMethod: 'onsubmit',
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				saveFuelLog({ ...f.data, date: parseDate(f.data.date) }).then((res) => {
					if (res.status == 'OK') {
						vehiclesStore.fetchVehicles(localStorage.getItem('userPin') || '');
						toast.success(`FuelLog ${logToEdit ? 'updated' : 'saved'} successfully...!!!`);
						fuelLogStore.openSheet(false);
					} else {
						toast.error(`Error while saving : ${res.error}`);
					}
				});
			}
		}
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		if (logToEdit) {
			formData.set({ ...logToEdit, date: formatDate(logToEdit.date) });
		}
		formData.update((data) => {
			return { ...data, vehicleId: vehicleId || '' };
		});
	});

	function getSelectedLog(data: FuelLogStore): FuelLog | undefined {
		if (data.editMode) {
			return data.fuelLogs.find((log) => log.id == data.selectedId);
		}
	}
</script>

<AppSheet {open} close={() => fuelLogModelStore.hide()} title="Add Fuel Log">
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4">
			<!-- <div class="flex w-full flex-row gap-4"> -->
			<Form.Field {form} name="date" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Date of fuel refill">Date</Form.Label>
						<Input
							{...props}
							bind:value={$formData.date}
							icon={Calendar1}
							type="calendar"
							disabled
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="odometer" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Current vehicle odometer reading">Odometer</Form.Label>
						<Input {...props} bind:value={$formData.odometer} icon={CircleGauge} type="number" />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<!-- </div> -->
			<!-- <div class="flex w-full flex-row gap-4"> -->
			<Form.Field {form} name="fuelAmount" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Volume of fuel">Volume</Form.Label>
						<Input
							{...props}
							bind:value={$formData.fuelAmount}
							icon={Fuel}
							type="number"
							step=".01"
						/>
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="cost" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Cost of refill">Cost</Form.Label>
						<Input
							{...props}
							bind:value={$formData.cost}
							icon={Banknote}
							type="number"
							step=".01"
						/>
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<!-- </div> -->
			<div class="flex w-full flex-row justify-around gap-4">
				<Form.Field {form} name="filled" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex flex-row items-center gap-2">
								<Checkbox {...props} bind:checked={$formData.filled} />
								<Form.Label class="font-normal" description="Is tank filled to top?">
									Full Tank
								</Form.Label>
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
								<Form.Label class="font-normal" description="Were any of last entries missed?">
									Missed Last
								</Form.Label>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Form.Field {form} name="notes" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="More details">Notes</Form.Label>
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
			<Form.Button>Submit</Form.Button>
		</div>
	</form>
</AppSheet>
