import { goto } from '$app/navigation';
import type { Vehicle } from '../types/vehicle';
import { axiosAuth } from '$lib/helper/api';
import { writable } from 'svelte/store';
import type { ApiResponse } from '@tracktor/common';

const createVehicleModalStore = () => {
	const { subscribe, set } = writable<{
		vehicleToEdit?: any;
		editMode: boolean;
		show: boolean;
	}>({
		vehicleToEdit: undefined,
		editMode: false,
		show: false
	});

	function show(vehicleToEdit?: any, editMode: boolean = false) {
		set({
			vehicleToEdit,
			editMode,
			show: true
		});
	}
	function hide() {
		set({
			vehicleToEdit: undefined,
			editMode: false,
			show: false
		});
	}

	return {
		subscribe,
		show,
		hide
	};
};

const createVehiclesStore = () => {
	const { subscribe, set, update } = writable<{
		loading: boolean;
		error: string;
		vehicles: Vehicle[];
		selectedVehicleId?: string;
	}>({
		loading: true,
		error: '',
		vehicles: [],
		selectedVehicleId: undefined
	});

	async function fetchVehicles(pin?: string) {
		let tempSelection: string | undefined = undefined;
		update((current) => {
			if (current.selectedVehicleId) {
				tempSelection = current.selectedVehicleId;
			}
			return {
				loading: true,
				error: current.error,
				vehicles: [],
				selectedVehicleId: undefined
			};
		});
		// await simulateNetworkDelay(2000); // Simulate network delay for development
		try {
			const response = await axiosAuth.get<ApiResponse>('/vehicles');
			if (response.status === 200) {
				const vehicles = response.data.data;
				if (Array.isArray(vehicles)) {
					set({
						loading: false,
						error: '',
						vehicles: vehicles
					});
				} else {
					console.error('Invalid vehicles data format', vehicles);
					set({
						loading: false,
						error: 'Invalid vehicles data format.',
						vehicles: []
					});
				}
			} else {
				if (response.status == 401) {
					goto('/login', { replaceState: true });
				}
				console.log('Failed to fetch vehicles', response);
				const data = response.data.data;
				const error = data.message || 'Failed to fetch vehicles.';
				set({
					loading: false,
					error,
					vehicles: []
				});
				return;
			}
		} catch (e) {
			console.error('Failed to connect to the server.', e);
			set({
				loading: false,
				error: 'Failed to connect to the server.',
				vehicles: []
			});
			return;
		}
		update((current) => ({
			loading: current.loading,
			error: '',
			vehicles: current.vehicles,
			selectedVehicleId: tempSelection
		}));
	}

	function selectVehicle(vehicleId: string) {
		update((current) => ({
			...current,
			selectedVehicleId: vehicleId
		}));
	}

	return {
		subscribe,
		fetchVehicles,
		selectVehicle
	};
};

export const vehicleModelStore = createVehicleModalStore();
export const vehiclesStore = createVehiclesStore();
