import type { Component } from 'svelte';

class SheetStore {
	open = $state(false);
	formComponent = $state<Component>();
	formData = $state<any>();
	title = $state('');
	description = $state('');

	openSheet(formComponent: any, title: string, description = '', data: any = undefined) {
		this.formComponent = formComponent;
		this.formData = data;
		this.open = true;
		this.title = title;
		this.description = description;
	}

	closeSheet(callback: () => void = () => {}) {
		this.open = false;
		this.formComponent = undefined;
		this.formData = undefined;
		this.title = '';
		this.description = '';
		callback();
	}
}

export const sheetStore = new SheetStore();
