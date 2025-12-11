<script lang="ts">
	import ImageDropZone from '$lib/components/ui/file-drop-zone/image-drop-zone.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { saveVehicleWithImage } from '$lib/services/vehicle.service';
	import { vehicleStore } from '$lib/stores/vehicle.svelte';
	import { vehicleSchema, FUEL_TYPES } from '$lib/domain/vehicle';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Calendar from '@lucide/svelte/icons/calendar';
	import CarFront from '@lucide/svelte/icons/car-front';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import IdCard from '@lucide/svelte/icons/id-card';
	import Paintbrush from '@lucide/svelte/icons/paintbrush';
	import Fuel from '@lucide/svelte/icons/fuel';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Jumper } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { sheetStore } from '$lib/stores/sheet.svelte';

	let { data } = $props();

	let image = $state<File>();
	let processing = $state(false);

	const form = superForm(defaults(zod4(vehicleSchema)), {
		validators: zod4(vehicleSchema),
		SPA: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				processing = true;
				saveVehicleWithImage(f.data, image, data ? 'PUT' : 'POST').then((res) => {
					if (res.status == 'OK') {
						vehicleStore.refreshVehicles();
						toast.success(`Vehicle ${data ? 'updated' : 'saved'} successfully...!!!`);
						image = undefined;
						sheetStore.closeSheet(() => vehicleStore.refreshVehicles());
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
		if (data) formData.set({ ...data, image: null });
	});
</script>

<form use:enhance onsubmit={(e) => e.preventDefault()} encType="multipart/form-data" class="w-full">
	<div class="flex flex-col gap-4">
		<Form.Field {form} name="image" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<!-- <Form.Label description="Manufacturer of the vehicle">Image</Form.Label> -->
					<ImageDropZone {...props} bind:file={image} disabled={processing} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex w-full flex-row gap-4">
			<Form.Field {form} name="make" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Manufacturer of the vehicle" required>Make</Form.Label>
						<Input {...props} bind:value={$formData.make} icon={Building2} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="model" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Model of the vehicle" required>Model</Form.Label>
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
						<Form.Label description="Year of Manufacturing" required>Year</Form.Label>
						<Input {...props} bind:value={$formData.year} icon={Calendar} type="number" />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="color" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Color of the vehicle" required>Color</Form.Label>
						<Input {...props} bind:value={$formData.color} icon={Paintbrush} type="color" />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
		</div>
		<div class="flex w-full flex-row gap-4">
			<Form.Field {form} name="fuelType" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label description="Type of fuel used by the vehicle" required>
							Fuel Type
						</Form.Label>
						<Select.Root bind:value={$formData.fuelType} type="single">
							<Select.Trigger {...props} class="w-full">
								<div class="flex items-center justify-start">
									<Fuel class="mr-2 h-4 w-4" />
									<span>
										{$formData.fuelType
											? FUEL_TYPES[$formData.fuelType as keyof typeof FUEL_TYPES]
											: 'Select fuel type'}
									</span>
								</div>
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(FUEL_TYPES) as [value, label]}
									<Select.Item {value}>{label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
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

		{#if !processing}
			<Form.Button>Submit</Form.Button>
		{:else}
			<Jumper size="40" color="var(--primary)" />
		{/if}
	</div>
</form>
