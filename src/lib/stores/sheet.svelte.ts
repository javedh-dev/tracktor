import type { Component } from 'svelte';

type SheetComponent = Component<any>;

class SheetStore {
  open = $state(false);
  formComponent = $state<SheetComponent | undefined>(undefined);
  formData = $state<unknown>(undefined);
  title = $state('');
  description = $state('');

  openSheet(
    formComponent: SheetComponent,
    title: string,
    description = '',
    data: unknown = undefined
  ) {
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
