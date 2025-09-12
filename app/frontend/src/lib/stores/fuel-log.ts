import { writable } from 'svelte/store';

const createFuelLogModalStore = () => {
	const { subscribe, set } = writable<{
		logToEdit?: any;
		vehicleId?: string;
		editMode: boolean;
		show: boolean;
		callback: (status: boolean) => void;
	}>({
		logToEdit: undefined,
		vehicleId: undefined,
		editMode: false,
		show: false,
		callback: () => {}
	});

	function show(
		vehicleId: string,
		logToEdit?: any,
		editMode: boolean = false,
		callback: any = undefined
	) {
		set({
			logToEdit,
			vehicleId,
			editMode,
			show: true,
			callback
		});
	}
	function hide() {
		set({
			logToEdit: undefined,
			vehicleId: undefined,
			editMode: false,
			show: false,
			callback: () => {}
		});
	}

	return {
		subscribe,
		show,
		hide
	};
};

export const fuelLogModelStore = createFuelLogModalStore();
