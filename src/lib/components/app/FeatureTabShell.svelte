<script lang="ts">
  import type { Component } from 'svelte';
  import TabContainer from '$appui/TabContainer.svelte';
  import { sheetStore } from '$lib/stores/sheet.svelte';
  import { vehicleStore } from '$lib/stores/vehicle.svelte';

  type SheetDataResolver = () => unknown;
  type AnyComponent = Component<any>;

  interface Props {
    title: string;
    listComponent: AnyComponent;
    addSheetTitle?: string;
    addSheetComponent?: AnyComponent;
    addSheetData?: unknown | SheetDataResolver;
    importSheetTitle?: string;
    importSheetComponent?: AnyComponent;
    importSheetData?: unknown | SheetDataResolver;
  }

  let {
    title,
    listComponent: ListComponent,
    addSheetTitle,
    addSheetComponent,
    addSheetData,
    importSheetTitle,
    importSheetComponent,
    importSheetData
  }: Props = $props();

  const resolveData = (data: unknown | SheetDataResolver) => {
    if (typeof data === 'function') {
      return (data as SheetDataResolver)();
    }

    return data;
  };
</script>

<TabContainer
  {title}
  addAction={addSheetComponent && addSheetTitle
    ? () => sheetStore.openSheet(addSheetComponent, addSheetTitle, '', resolveData(addSheetData))
    : null}
  importAction={importSheetComponent && importSheetTitle
    ? () =>
        sheetStore.openSheet(
          importSheetComponent,
          importSheetTitle,
          '',
          resolveData(importSheetData)
        )
    : null}
  addActionDisabled={!vehicleStore.selectedId}
>
  <ListComponent />
</TabContainer>
