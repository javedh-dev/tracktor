<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/formatting';
	import { saveFuelLog } from '$lib/services/fuel.service';
	import { fuelLogModelStore } from '$lib/stores/fuel-log';
	import { vehiclesStore } from '$lib/stores/vehicle';
	import { fuelSchema, type FuelLog } from '$lib/types/fuel';
	import { Banknote, Calendar1, CircleGauge, Fuel } from '@lucide/svelte/icons';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';

	let open = $state(false);
	let logToEdit: FuelLog | undefined = $state();
	let vehicleId: string | undefined = $state();

	fuelLogModelStore.subscribe((data) => {
		open = data.show;
		logToEdit = data.logToEdit;
		vehicleId = data.vehicleId;
	});

	const form = superForm(defaults(zod4(fuelSchema)), {
		validators: zod4(fuelSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				// toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
				saveFuelLog({ ...f.data, date: parseDate(f.data.date) }).then((res) => {
					if (res.status == 'OK') {
						vehiclesStore.fetchVehicles(localStorage.getItem('userPin') || '');
						toast.success(`FuelLog ${logToEdit ? 'updated' : 'saved'} successfully...!!!`);
						fuelLogModelStore.hide();
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
		if (logToEdit) {
			formData.set({ ...logToEdit, date: formatDate(logToEdit.date) });
		}
		formData.update((data) => {
			return { ...data, vehicleId: vehicleId || '' };
		});
	});
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
			<div class="flex w-full flex-row gap-4">
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
			</div>
			<Form.Field {form} name="filled">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex flex-row items-center gap-2">
							<Checkbox {...props} bind:checked={$formData.filled} />
							<Form.Label class="font-normal">Full Tank</Form.Label>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="missedLast">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex flex-row items-center gap-2">
							<Checkbox {...props} bind:checked={$formData.missedLast} />
							<Form.Label class="font-normal">Missed Last</Form.Label>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

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
