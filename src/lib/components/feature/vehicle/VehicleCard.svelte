<script lang="ts">
	import LicensePlate from '$appui/LicensePlate.svelte';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Fuel from '@lucide/svelte/icons/fuel';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Shield from '@lucide/svelte/icons/shield';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import IdCard from '@lucide/svelte/icons/id-card';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Info from '@lucide/svelte/icons/info';
	import { formatDistance } from '$lib/helper/format.helper';
	import { vehicleStore } from '$stores/vehicle.svelte';
	import { browser } from '$app/environment';
	import { FUEL_TYPES } from '$lib/domain/vehicle';
	import IconButton from '$appui/IconButton.svelte';
	import DeleteConfirmation from '$appui/DeleteConfirmation.svelte';
	import * as Card from '$ui/card';
	import Badge from '$ui/badge/badge.svelte';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import VehicleDetailsModal from '$lib/components/feature/vehicle/VehicleDetailsModal.svelte';
	import { deleteVehicle } from '$lib/services/vehicle.service';
	import { toast } from 'svelte-sonner';
	import { sheetStore } from '$stores/sheet.svelte';
	import FuelLogForm from '../fuel/FuelLogForm.svelte';
	import MaintenanceForm from '../maintenance/MaintenanceForm.svelte';
	import InsuranceForm from '../insurance/InsuranceForm.svelte';
	import PollutionCertificateForm from '../pollution/PollutionCertificateForm.svelte';
	import VehicleForm from './VehicleForm.svelte';
	import ReminderForm from '../reminder/ReminderForm.svelte';
	import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
	import { Features } from '$lib/helper/feature.helper';

	const { vehicle, onclick, onkeydown, isSelected = false } = $props();
	let deleteDialog = $state(false);
	let detailsModalOpen = $state(false);

	const performDelete = async (vehicleId: string) => {
		deleteVehicle(vehicleId).then((res) => {
			if (res.status == 'OK') {
				fetchVehicles();
				toast.success('Successfully deleted vehicle...!!!');
			} else {
				toast.error(res.error || 'Some error occurred while deleting vehicle.');
			}
		});
	};

	const fetchVehicles = () => {
		if (browser) {
			const pin = localStorage.getItem('userPin') || undefined;
			if (pin) vehicleStore.refreshVehicles();
		}
	};

	// Dynamic image URL - fallback to default if vehicle doesn't have image
	const imageUrl = $derived(vehicle.image ? `/api/files/${vehicle.image}` : '/default-vehicle.png');
</script>

<div
	id="vehicle-card-{vehicle.id}"
	class="vehicle-card"
	tabindex="0"
	role="button"
	{onclick}
	{onkeydown}
>
	<Card.Root
		class={`hover:border-primary h-full w-xs cursor-pointer gap-2 rounded-2xl border-2 p-0 pb-4 transition-all duration-300 ease-in-out lg:w-sm ${isSelected ? 'border-primary/50' : 'border-transparent'}`}
	>
		<Card.Header class="relative h-38 overflow-hidden p-0 ">
			<div class="w-full">
				{#if imageUrl}
					<img src={imageUrl} alt="car" class="rounded-t-xl object-center opacity-30" />
				{/if}
			</div>
			<div class="absolute inset-0 flex flex-col justify-between border-b p-4">
				<div class="flex flex-col">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-primary text-2xl font-bold">{vehicle.make} {vehicle.model}</span>
						</div>
						<p class="flex items-center gap-2">
							{#if vehicle.color}
								<Badge class="m-1 h-5 w-8" style={`background-color: ${vehicle.color}`} />
							{/if}
						</p>
					</div>
					<div class="mt-2 flex flex-row justify-between text-sm font-medium">
						<LabelWithIcon
							icon={IdCard}
							iconClass="h-5 w-5"
							style="mono text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
							label={vehicle.vin ? vehicle.vin : '-'}
						/>
						<LabelWithIcon
							icon={Gauge}
							iconClass="h-5 w-5"
							style="mono text-foreground flex items-center gap-2"
							label={vehicle.odometer ? formatDistance(vehicle.odometer) : '-'}
						/>
					</div>
				</div>

				<div class="flex flex-row justify-end"></div>
			</div>
		</Card.Header>
		<Card.Content class="px-4">
			<div class="flex items-center justify-between">
				<LicensePlate registrationNumber={vehicle.licensePlate} />
				<div class="flex gap-2">
					<Badge variant="secondary" class="text-xs"
						>{vehicle.fuelType
							? FUEL_TYPES[vehicle.fuelType as keyof typeof FUEL_TYPES]
							: 'Petrol'}</Badge
					>
					<Badge variant="outline" class="text-sm">{vehicle.year}</Badge>
				</div>
			</div>
		</Card.Content>
		<Card.Footer id="vehicle-card-actions" class="px-3">
			<div id="vehicle-card-action-row" class="flex w-full justify-between">
				<div id="vehicle-card-primary-actions" class="flex justify-start">
					<!-- Fuel Log Button -->
					<FeatureGate feature={Features.FUEL_LOG}>
						{#snippet children()}
							<IconButton
								id="vehicle-card-fuel-btn"
								buttonStyles="hover:bg-green-100 dark:hover:bg-green-700"
								iconStyles="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-200"
								icon={Fuel}
								onclick={() => sheetStore.openSheet(FuelLogForm, 'Add Fuel Log', '')}
								ariaLabel="Log fuel refill"
							/>
						{/snippet}
					</FeatureGate>

					<!-- Maintenance Button -->
					<FeatureGate feature={Features.MAINTENANCE}>
						{#snippet children()}
							<IconButton
								id="vehicle-card-maintenance-btn"
								buttonStyles="hover:bg-amber-100 dark:hover:bg-amber-700"
								iconStyles="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-200"
								icon={Wrench}
								onclick={() => sheetStore.openSheet(MaintenanceForm, 'Add Maintenence Log', '')}
								ariaLabel="Maintenence"
							/>
						{/snippet}
					</FeatureGate>

					<!-- Insurance Button -->
					<FeatureGate feature={Features.INSURANCE}>
						{#snippet children()}
							<IconButton
								id="vehicle-card-insurance-btn"
								buttonStyles="hover:bg-sky-100 dark:hover:bg-sky-700"
								iconStyles="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-200"
								icon={Shield}
								onclick={() => sheetStore.openSheet(InsuranceForm, 'Add Insurance', '')}
								ariaLabel="Insurance"
							/>
						{/snippet}
					</FeatureGate>

					<!-- PUCC Button -->
					<FeatureGate feature={Features.PUCC}>
						{#snippet children()}
							<IconButton
								id="vehicle-card-pollution-btn"
								buttonStyles="hover:bg-fuchsia-100 dark:hover:bg-fuchsia-700"
								iconStyles="text-fuchsia-500 hover:text-fuchsia-600 dark:text-fuchsia-400 dark:hover:text-fuchsia-200"
								icon={BadgeCheck}
								onclick={() =>
									sheetStore.openSheet(PollutionCertificateForm, 'Add Pollution Certificate', '')}
								ariaLabel="Pollution Certificate"
							/>
						{/snippet}
					</FeatureGate>

					<!-- Reminders Button -->
					<FeatureGate feature={Features.REMINDERS}>
						{#snippet children()}
							<IconButton
								id="vehicle-card-reminder-btn"
								buttonStyles="hover:bg-indigo-100 dark:hover:bg-indigo-700"
								iconStyles="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200"
								icon={BellRing}
								onclick={() => sheetStore.openSheet(ReminderForm, 'Add Reminder', '')}
								ariaLabel="Schedule reminder"
							/>
						{/snippet}
					</FeatureGate>
				</div>
				<div id="vehicle-card-secondary-actions" class="flex justify-end gap-2">
					<IconButton
						id="vehicle-card-info-btn"
						buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
						iconStyles="text-gray-600 dark:text-gray-100 hover:text-blue-500"
						icon={Info}
						onclick={() => (detailsModalOpen = true)}
						ariaLabel="More info"
					/>
					<IconButton
						id="vehicle-card-edit-btn"
						buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
						iconStyles="text-gray-600 dark:text-gray-100 hover:text-sky-500"
						icon={Pencil}
						onclick={() => {
							sheetStore.openSheet(VehicleForm, 'Update Vehicle', '', vehicle);
						}}
						ariaLabel="Edit"
					/>
					<IconButton
						id="vehicle-card-delete-btn"
						buttonStyles="hover:bg-gray-200 dark:hover:bg-gray-700"
						iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500"
						icon={Trash2}
						onclick={() => (deleteDialog = true)}
						ariaLabel="Delete"
					/>
				</div>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
<DeleteConfirmation onConfirm={() => performDelete(vehicle.id)} bind:open={deleteDialog} />
<VehicleDetailsModal bind:open={detailsModalOpen} {vehicle} />
