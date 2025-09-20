<script lang="ts">
	import AppSheet from '$lib/components/layout/AppSheet.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { saveVehicle } from '$lib/services/vehicle.service';
	import { vehicleModelStore, vehiclesStore } from '$lib/stores/vehicle';
	import { vehicleSchema, type Vehicle } from '$lib/types/vehicle';
	import {
		Building2,
		Calendar,
		CarFront,
		CircleGauge,
		Fingerprint,
		IdCard,
		Paintbrush
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';

	let open = $state(false);
	let vehicleToEdit: Vehicle | undefined = $state();
	let editMode = $state(false);

	vehicleModelStore.subscribe((data) => {
		open = data.show;
		vehicleToEdit = data.vehicleToEdit;
		editMode = data.editMode;
	});

	const form = superForm(defaults(zod4(vehicleSchema)), {
		validators: zod4(vehicleSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				// toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
				saveVehicle(f.data, vehicleToEdit ? 'PUT' : 'POST').then((res) => {
					if (res.status == 'OK') {
						vehiclesStore.fetchVehicles(localStorage.getItem('userPin') || '');
						toast.success(`Vehicle ${vehicleToEdit ? 'updated' : 'saved'} successfully...!!!`);
						vehicleModelStore.hide();
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
		if (vehicleToEdit) {
			formData.set(vehicleToEdit);
		}
	});
</script>

<AppSheet {open} close={() => vehicleModelStore.hide()} title="Add Vehicle">
	<form use:enhance onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4">
			<div class="flex w-full flex-row gap-4">
				<Form.Field {form} name="make" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label description="Manufacturer of the vehicle">Make</Form.Label>
							<Input {...props} bind:value={$formData.make} icon={Building2} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="model" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label description="Model of the vehicle">Model</Form.Label>
							<Input {...props} bind:value={$formData.model} icon={CarFront} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>Model of the vehicle</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<div class="flex w-full flex-row gap-4">
				<Form.Field {form} name="year" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label description="Year of Manufacturing">Year</Form.Label>
							<Input {...props} bind:value={$formData.year} icon={Calendar} type="number" />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>Model of the vehicle</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="color" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label description="Color of the vehicle">Color</Form.Label>
							<Input {...props} bind:value={$formData.color} icon={Paintbrush} type="color" />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>Model of the vehicle</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Form.Field {form} name="licensePlate" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Registration Number of vehicle">License Plate</Form.Label>
						<Input {...props} bind:value={$formData.licensePlate} icon={IdCard} />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="vin" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Vehicle Idenification Number">VIN</Form.Label>
						<Input {...props} bind:value={$formData.vin} icon={Fingerprint} />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
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
			<Form.Button>Submit</Form.Button>
		</div>
	</form>
</AppSheet>
