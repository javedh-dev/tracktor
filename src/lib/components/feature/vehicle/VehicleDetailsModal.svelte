<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$ui/separator';
	import IdCard from '@lucide/svelte/icons/id-card';
	import FileText from '@lucide/svelte/icons/file-text';
	import { formatDistance } from '$lib/helper/format.helper';
	import { FUEL_TYPES } from '$lib/domain/vehicle';
	import type { Vehicle } from '$lib/domain/vehicle';

	interface Props {
		vehicle: Vehicle;
		open?: boolean;
	}

	let { vehicle, open = $bindable(false) }: Props = $props();

	// Dynamic image URL - fallback to default if vehicle doesn't have image
	const imageUrl = $derived(vehicle.image ? `/api/files/${vehicle.image}` : undefined);
	const fuelLabel = $derived(vehicle.fuelType ? FUEL_TYPES[vehicle.fuelType as keyof typeof FUEL_TYPES] : 'Petrol');
	const odometerText = $derived(vehicle.odometer ? formatDistance(vehicle.odometer) : null);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
		<!-- Vehicle Image Header -->
		<div
			class="relative h-48 w-full rounded-t-lg bg-cover bg-center"
			style={`background-image: url('${imageUrl || '/default-vehicle.png'}')`}
		>
			<div class="absolute inset-0 rounded-t-lg bg-black/30"></div>
			{#if vehicle.color}
				<div
					class="absolute bottom-4 right-4 z-10 h-8 w-8 rounded-full border-2 border-white/70 shadow-md"
					style={`background-color: ${vehicle.color}`}
					aria-label="Color"
				></div>
			{/if}
			<Dialog.Close
				class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white shadow-md transition hover:bg-black/65 focus:outline-none"
				aria-label="Close"
			>
				<span aria-hidden="true" class="text-lg leading-none">×</span>
			</Dialog.Close>
			<div class="absolute bottom-4 left-4 z-10">
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
				<span class="rounded-full border border-input bg-background px-3 py-1 text-xs font-semibold">
					{vehicle.licensePlate}
				</span>
			{/if}
			<span class="rounded-full border border-input bg-background px-3 py-1 text-xs font-medium">
				{vehicle.year}
			</span>
			<span class="rounded-full border border-input bg-background px-3 py-1 text-xs font-medium">
				{fuelLabel}
			</span>
			{#if odometerText}
				<span class="rounded-full border border-input bg-background px-3 py-1 text-xs font-medium">
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
						<IdCard class="mr-2 h-4 w-4" />
						Details
					</h3>
					<Separator />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">License Plate</p>
						<p class="text-sm font-medium">{vehicle.licensePlate || 'Not specified'}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">VIN</p>
						{#if vehicle.vin}
							<p class="font-mono text-sm break-all">{vehicle.vin}</p>
						{:else}
							<p class="text-sm text-muted-foreground">Not specified</p>
						{/if}
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">Fuel Type</p>
						<p class="text-sm font-medium">{fuelLabel}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">Odometer</p>
						<p class="text-sm font-medium">{odometerText || 'Not recorded'}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">Color</p>
						<p class="text-sm font-medium">{vehicle.color || 'Not specified'}</p>
					</div>
					<div class="space-y-1">
						<p class="text-muted-foreground text-xs">Year</p>
						<p class="text-sm font-medium">{vehicle.year}</p>
					</div>
				</div>
			</div>

			<!-- Custom Fields -->
			{#if vehicle.customFields && Object.keys(vehicle.customFields).length > 0}
				<div class="space-y-3">
					<div>
						<h3 class="mb-2 flex items-center text-base font-semibold">
							<FileText class="mr-2 h-4 w-4" />
							Custom Fields
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
