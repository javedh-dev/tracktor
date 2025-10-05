import { axiosAuth } from '$lib/helper/api';
import type { Vehicle } from '$lib/types/vehicle';
import type { ApiResponse } from '@tracktor/common';
import { toast } from 'svelte-sonner';
import { writable } from 'svelte/store';

type VehicleStore = {
	vehicles: Vehicle[];
	openSheet: boolean;
	editMode?: boolean;
	selectedId?: string;
	processing: boolean;
	error?: string;
};

const createVehicleStore = () => {
	const { subscribe, update } = writable<VehicleStore>({
		vehicles: [],
		openSheet: false,
		processing: false
	});

	const refreshVehicles = () => {
		update((prev) => ({ ...prev, processing: true }));
		axiosAuth
			.get<ApiResponse>('/vehicles')
			.then(({ data: res }) => {
				update((prev) => ({ ...prev, vehicles: res.data }));
			})
			.catch((err) => update((prev) => ({ ...prev, error: 'Failed to fetch vehicles' })))
			.finally(() => update((prev) => ({ ...prev, processing: false })));
	};

	const selectVehicle = (vehicleId: string) => {
		update((prev) => {
			const vehicle = prev.vehicles.find((vehicle) => vehicle.id === vehicleId);
			if (vehicle) {
				return { ...prev, selectedId: vehicleId };
			} else {
				toast.error('Invalid Vehicle Id selected');
				return prev;
			}
		});
	};

	const openSheet = (state: boolean, editMode?: boolean) => {
		update((prev) => ({ ...prev, openSheet: state, editMode }));
	};

	return {
		subscribe,
		refreshVehicles,
		selectVehicle,
		openSheet
	};
};

export const vehicleStore = createVehicleStore();
