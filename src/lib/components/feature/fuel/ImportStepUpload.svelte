<script lang="ts">
  import { FileDropZone } from '$lib/components/app';
  import type { FuelLogImportState } from './fuel-log-import.svelte';
  import Input from '$lib/components/app/input.svelte';
  import Button from '$ui/button/button.svelte';
  import Checkbox from '$ui/checkbox/checkbox.svelte';
  import * as Select from '$ui/select/index.js';
  import { Separator } from '$ui/separator';
  import { sheetStore } from '$stores/sheet.svelte';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import { isValidFormat } from '$lib/helper/format.helper';
  import * as m from '$lib/paraglide/messages';

  let { state }: { state: FuelLogImportState } = $props();
</script>

<section>
  <div class="space-y-6">
    <div class="space-y-1">
      <p class="text-lg font-semibold">{m.fuel_import_step_1_title()}</p>
      <p class="text-muted-foreground text-sm">
        {m.fuel_import_step_1_desc()}
      </p>
    </div>
    <Separator class="my-4" orientation="horizontal" />
    <div class="space-y-2">
      <FileDropZone
        variant="attachment"
        accept=".csv,.tsv,.txt,text/csv,text/plain"
        file={state.file}
        onFileSelect={state.handleFileChange}
        placeholder={m.fuel_import_drop_placeholder()}
      />
    </div>
    <div class="flex flex-row items-center gap-2">
      <Checkbox bind:checked={state.hasHeaders} id="has-headers-checkbox" />
      <p class="text-muted-foreground text-sm">{m.fuel_import_headers_checkbox()}</p>
    </div>
    <div class="space-y-2">
      <p class="text-sm font-semibold">{m.fuel_import_delimiter_title()}</p>
      <p class="text-muted-foreground text-xs">{m.fuel_import_delimiter_desc()}</p>
      <Select.Root type="single" bind:value={state.delimiter}>
        <Select.Trigger class="w-full">
          {#if state.delimiter === ','}
            {m.fuel_import_delimiter_comma()}
          {:else if state.delimiter === ';'}
            {m.fuel_import_delimiter_semicolon()}
          {:else if state.delimiter === '\t'}
            {m.fuel_import_delimiter_tab()}
          {:else if state.delimiter === '|'}
            {m.fuel_import_delimiter_pipe()}
          {:else}
            {m.fuel_import_delimiter_custom()}
          {/if}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value=",">{m.fuel_import_delimiter_comma()}</Select.Item>
          <Select.Item value=";">{m.fuel_import_delimiter_semicolon()}</Select.Item>
          <Select.Item value="\t">{m.fuel_import_delimiter_tab()}</Select.Item>
          <Select.Item value="|">{m.fuel_import_delimiter_pipe()}</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
    <div class="space-y-2">
      <p class="text-sm font-semibold">{m.fuel_import_date_format_title()}</p>
      <p class="text-muted-foreground text-xs">
        {m.fuel_import_date_format_desc()}
      </p>
      <Input
        placeholder={m.fuel_import_date_format_placeholder()}
        bind:value={state.dateFormat}
        id="date-format-input"
      />
      <p class="text-muted-foreground text-xs">
        {m.common_example_prefix()}
        {isValidFormat(state.dateFormat).ex || m.common_invalid_format()}
      </p>
    </div>

    {#if state.parseError}
      <div
        class="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm"
      >
        <AlertCircle class="h-4 w-4" />
        <span>{state.parseError}</span>
      </div>
    {/if}

    <div class="flex justify-end gap-2">
      <Button
        variant="outline"
        onclick={() => sheetStore.closeSheet()}
        class="cursor-pointer"
        size="sm"
      >
        {m.common_cancel()}
      </Button>
      <Button
        onclick={state.handleParse}
        disabled={!state.canProceedFromUpload}
        class="cursor-pointer"
        size="sm"
      >
        {#if state.processing === 'parsing'}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {m.common_continue()}
      </Button>
    </div>
  </div>
</section>
