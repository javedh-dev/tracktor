import { writable } from 'svelte/store';

const createMaintenanceModalStore = () => {
	const { subscribe, set } = writable<{
		vehicleId?: string;
		logToEdit?: any;
		editMode: boolean;
		show: boolean;
		callback?: any;
	}>({
		vehicleId: undefined,
		logToEdit: undefined,
		editMode: false,
		show: false,
		callback: undefined
	});

	function show(
		vehicleId: string,
		logToEdit?: any,
		editMode: boolean = false,
		callback: any = undefined
	) {
		set({
			vehicleId,
			logToEdit,
			editMode,
			show: true,
			callback
		});
	}

	function hide() {
		set({
			vehicleId: undefined,
			logToEdit: undefined,
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

export const maintenanceModelStore = createMaintenanceModalStore();
