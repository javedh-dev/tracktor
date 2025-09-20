import { writable } from 'svelte/store';

const createInsuranceModalStore = () => {
	const { subscribe, set } = writable<{
		entryToEdit?: any;
		vehicleId?: string;
		editMode: boolean;
		show: boolean;
		callback: (_status: boolean) => void;
	}>({
		entryToEdit: undefined,
		vehicleId: undefined,
		editMode: false,
		show: false,
		callback: () => {}
	});

	function show(
		vehicleId: string,
		entryToEdit?: any,
		editMode: boolean = false,
		callback: any = undefined
	) {
		set({
			entryToEdit,
			vehicleId,
			editMode,
			show: true,
			callback
		});
	}
	function hide() {
		set({
			entryToEdit: undefined,
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

export const insuranceModelStore = createInsuranceModalStore();
