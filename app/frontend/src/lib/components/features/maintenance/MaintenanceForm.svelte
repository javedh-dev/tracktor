<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatDate, parseDate } from '$lib/helper/formatting';
	import { saveFuelLog } from '$lib/services/fuel.service';
	import { fuelLogModelStore } from '$lib/stores/fuel-log';
	import { vehicleModelStore, vehiclesStore } from '$lib/stores/vehicle';
	import { maintenenceSchema, type MaintenanceLog } from '$lib/types/maintenance';
	import { fuelSchema, type FuelLog } from '$lib/types/fuel';
	import {
		Banknote,
		Calendar1,
		CircleGauge,
		CircleSlash,
		Fuel,
		Hammer
	} from '@lucide/svelte/icons';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { maintenanceModelStore } from '$lib/stores/maintenance';
	import { saveMaintenanceLog } from '$lib/services/maintenence.service';

	let open = $state(false);
	let logToEdit: MaintenanceLog | undefined = $state();
	let vehicleId: string | undefined = $state();

	maintenanceModelStore.subscribe((data) => {
		open = data.show;
		logToEdit = data.logToEdit;
		vehicleId = data.vehicleId;
	});

	const form = superForm(defaults(zod4(maintenenceSchema)), {
		validators: zod4(maintenenceSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				saveMaintenanceLog({ ...f.data, date: parseDate(f.data.date) }).then((res) => {
					if (res.status == 'OK') {
						vehiclesStore.fetchVehicles(localStorage.getItem('userPin') || '');
						toast.success(`Maintenance Log ${logToEdit ? 'updated' : 'saved'} successfully...!!!`);
						maintenanceModelStore.hide();
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

<AppSheet {open} close={() => maintenanceModelStore.hide()} title="Add Maintenance Log">
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4">
			<!-- <div class="flex w-full flex-row gap-4"> -->
			<Form.Field {form} name="date" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Maintenance Date">Date</Form.Label>
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

			<Form.Field {form} name="serviceCenter" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Name of Service center">Service Center</Form.Label>
						<Input {...props} bind:value={$formData.serviceCenter} icon={Hammer} />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="cost" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Cost of Maintenance">Cost</Form.Label>
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
