<script lang="ts">
	import { FileDropZone } from '$lib/components/app';
	import CustomFieldsEditor from '$lib/components/app/CustomFieldsEditor.svelte';
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import { saveVehicleWithImage } from '$lib/services/vehicle.service';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { vehicleSchema, FUEL_TYPES, getFuelTypeLabel } from '$lib/domain/vehicle';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Calendar from '@lucide/svelte/icons/calendar';
	import CarFront from '@lucide/svelte/icons/car-front';
	import CircleGauge from '@lucide/svelte/icons/circle-gauge';
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import IdCard from '@lucide/svelte/icons/id-card';
	import Paintbrush from '@lucide/svelte/icons/paintbrush';
	import Fuel from '@lucide/svelte/icons/fuel';
	import SubmitButton from '$appui/SubmitButton.svelte';
	import * as Select from '$ui/select/index.js';
	import { toast } from 'svelte-sonner';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { sheetStore } from '$stores/sheet.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	let image = $state<File>();
	let removeExistingImage = $state(false);
	let processing = $state(false);

	// For showing existing image when editing
	const existingImageUrl = $derived(data?.image ? `/api/files/${data.image}` : undefined);

	const form = superForm(defaults(zod4(vehicleSchema)), {
		validators: zod4(vehicleSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				saveVehicleWithImage(f.data, image, data ? 'PUT' : 'POST', removeExistingImage).then(
					(res) => {
						if (res.status == 'OK') {
							vehicleStore.refreshVehicles();
							toast.success(data ? m.vehicle_toast_updated() : m.vehicle_toast_saved());
							image = undefined;
							removeExistingImage = false;
							sheetStore.closeSheet(() => vehicleStore.refreshVehicles());
						} else {
							toast.error(`${m.vehicle_toast_error_prefix()}${res.error}`);
						}
						processing = false;
					}
				);
			}
		}
	});
	const { form: formData, enhance } = form;

	$effect(() => {
		if (data) {
			formData.set({ ...data, image: null });
			image = undefined;
			removeExistingImage = false;
		}
	});
</script>

<form
	id="vehicle-form"
	use:enhance
	onsubmit={(e) => e.preventDefault()}
	encType="multipart/form-data"
	class="w-full"
>
	<fieldset class="flex flex-col gap-4" disabled={processing}>
		<Form.Field {form} name="image" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<!-- <FormLabel description="Manufacturer of the vehicle">Image</FormLabel> -->
					<FileDropZone
						{...props}
						bind:file={image}
						disabled={processing}
						{existingImageUrl}
						bind:removeExisting={removeExistingImage}
						variant="image"
						accept="image/*"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex w-full flex-row gap-4">
			<Form.Field {form} name="make" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.vehicle_form_make_desc()} required>
							{m.vehicle_form_make_label()}
						</FormLabel>
						<Input {...props} bind:value={$formData.make} icon={Building2} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="model" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.vehicle_form_model_desc()} required>
							{m.vehicle_form_model_label()}
						</FormLabel>
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
						<FormLabel description={m.vehicle_form_year_desc()} required>
							{m.vehicle_form_year_label()}
						</FormLabel>
						<Input {...props} bind:value={$formData.year} icon={Calendar} type="number" />
					{/snippet}
				</Form.Control>
				<!-- <Form.Description>Model of the vehicle</Form.Description> -->
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="color" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<FormLabel description={m.vehicle_form_color_desc()} required>
							{m.vehicle_form_color_label()}
						</FormLabel>
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
						<FormLabel description={m.vehicle_form_fuel_type_desc()} required>
							{m.vehicle_form_fuel_type_label()}
						</FormLabel>
						<Select.Root bind:value={$formData.fuelType} type="single">
							<Select.Trigger {...props} class="w-full">
								<div class="flex items-center justify-start">
									<Fuel class="mr-2 h-4 w-4" />
									<span>
										{$formData.fuelType
											? getFuelTypeLabel($formData.fuelType, m)
											: m.vehicle_form_fuel_type_placeholder()}
									</span>
								</div>
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(FUEL_TYPES) as [value, _]}
									<Select.Item {value}>{getFuelTypeLabel(value, m)}</Select.Item>
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
						<FormLabel description={m.vehicle_form_odometer_desc()}>
							{m.vehicle_form_odometer_label()}
						</FormLabel>
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
					<FormLabel description={m.vehicle_form_license_desc()}>
						{m.vehicle_form_license_label()}
					</FormLabel>
					<Input {...props} bind:value={$formData.licensePlate} icon={IdCard} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="vin" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description={m.vehicle_form_vin_desc()}>
						{m.vehicle_form_vin_label()}
					</FormLabel>
					<Input {...props} bind:value={$formData.vin} icon={Fingerprint} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>Model of the vehicle</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>

		<!-- Custom Fields Section -->
		<div class="border-t pt-4">
			<CustomFieldsEditor bind:customFields={$formData.customFields} />
		</div>

		<SubmitButton {processing} class="w-full">{m.common_submit()}</SubmitButton>
	</fieldset>
</form>
