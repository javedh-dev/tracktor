<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$ui/separator';
	import IdCard from '@lucide/svelte/icons/id-card';
	import FileText from '@lucide/svelte/icons/file-text';
	import { formatDistance } from '$lib/helper/format.helper';
	import { getFuelTypeLabel } from '$lib/domain/vehicle';
	import type { Vehicle } from '$lib/domain/vehicle';
	import X from '@lucide/svelte/icons/x';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		vehicle: Vehicle;
		open?: boolean;
	}

	let { vehicle, open = $bindable(false) }: Props = $props();

	// Dynamic image URL - fallback to default if vehicle doesn't have image
	const imageUrl = $derived(vehicle.image ? `/api/files/${vehicle.image}` : '/default-vehicle.png');
	const fuelLabel = $derived(
		vehicle.fuelType ? getFuelTypeLabel(vehicle.fuelType, m) : getFuelTypeLabel('petrol', m)
	);
	const odometerText = $derived(vehicle.odometer ? formatDistance(vehicle.odometer) : null);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto p-0" showCloseButton={false}>
		<!-- Vehicle Image Header -->
		<div
			class="relative h-48 w-full rounded-t-lg bg-cover bg-center"
			style={`background-image: url('${imageUrl}'), url('/default-vehicle.png')`}
		>
			<div class="absolute inset-0 rounded-t-lg bg-black/30"></div>
			{#if vehicle.color}
				<div
					class="absolute bottom-4 z-10 h-8 w-8 rounded-full border-2 border-white/70 shadow-md ltr:right-4 rtl:left-4"
					style={`background-color: ${vehicle.color}`}
					aria-label="Color"
				></div>
			{/if}
			<Dialog.Close
				class="absolute top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/85 text-white shadow-md ring-1 ring-black/10 backdrop-blur transition hover:bg-white hover:text-black focus:outline-none ltr:right-3 rtl:left-3"
				aria-label="Close"
			>
				<X class="h-4 w-4" />
			</Dialog.Close>
			<div class="absolute bottom-4 z-10 ltr:left-4 rtl:right-4">
				<h2 class="text-2xl font-bold text-white drop-shadow-lg">
					{vehicle.make}
					{vehicle.model}
				</h2>
				<!-- Avoid repeating year or license plate here -->
			</div>
		</div>

		<!-- Compact summary chips -->
		<div class="flex flex-wrap gap-2 px-5 pt-4">
			{#if vehicle.licensePlate}
				<span
					class="border-input bg-background rounded-full border px-3 py-1 text-xs font-semibold"
				>
					{vehicle.licensePlate}
				</span>
			{/if}
			<span class="border-input bg-background rounded-full border px-3 py-1 text-xs font-medium">
				{vehicle.year}
			</span>
			<span class="border-input bg-background rounded-full border px-3 py-1 text-xs font-medium">
				{fuelLabel}
			</span>
			{#if odometerText}
				<span class="border-input bg-background rounded-full border px-3 py-1 text-xs font-medium">
					{odometerText}
				</span>
			{/if}
		</div>

		<!-- Content -->
		<div class="space-y-4 p-5">
			<!-- Details (concise, minimal) -->
			<div class="space-y-3">
				<div>
					<h3 class="mb-2 flex items-center text-base font-semibold">
						<IdCard class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
						{m.vehicle_details_section_title()}
					</h3>
					<Separator />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">{m.vehicle_details_license_plate()}</p>
						<p class="text-sm font-medium">
							{vehicle.licensePlate || m.vehicle_details_not_specified()}
						</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">{m.vehicle_details_vin()}</p>
						{#if vehicle.vin}
							<p class="font-mono text-sm break-all">{vehicle.vin}</p>
						{:else}
							<p class="text-muted-foreground text-sm">{m.vehicle_details_not_specified()}</p>
						{/if}
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">{m.vehicle_details_fuel_type()}</p>
						<p class="text-sm font-medium">{fuelLabel}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">{m.vehicle_details_odometer()}</p>
						<p class="text-sm font-medium">{odometerText || m.vehicle_details_not_recorded()}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">{m.vehicle_details_color()}</p>
						<p class="text-sm font-medium">{vehicle.color || m.vehicle_details_not_specified()}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">{m.vehicle_details_year()}</p>
						<p class="text-sm font-medium">{vehicle.year}</p>
					</div>
				</div>
			</div>

			<!-- Custom Fields -->
			{#if vehicle.customFields && Object.keys(vehicle.customFields).length > 0}
				<div class="space-y-3">
					<div>
						<h3 class="mb-2 flex items-center text-base font-semibold">
							<FileText class="h-4 w-4 ltr:mr-2 rtl:ml-2" />
							{m.custom_fields_label()}
						</h3>
						<Separator />
					</div>
					<div class="grid grid-cols-2 gap-4">
						{#each Object.entries(vehicle.customFields) as [key, value]}
							<div class="space-y-1">
								<p class="text-muted-foreground text-xs capitalize">{key}</p>
								<p class="text-sm">{value}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
