<script lang="ts">
  import type { FuelLogImportState } from './fuel-log-import.svelte';
  import { columns } from './fuel-log-import.svelte';
  import Button from '$ui/button/button.svelte';
  import * as Table from '$ui/table/index.js';
  import { Separator } from '$ui/separator';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';
  import * as m from '$lib/paraglide/messages';

  let { state }: { state: FuelLogImportState } = $props();
</script>

<section>
  <div class="space-y-1">
    <p class="text-lg font-semibold">{m.fuel_import_step_3_title()}</p>
    <p class="text-muted-foreground text-sm">{m.fuel_import_step_3_desc()}</p>
  </div>
  <Separator class="my-4" orientation="horizontal" />

  {#if state.hasDateErrors}
    <div
      class="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
    >
      <AlertCircle class="h-4 w-4" />
      <span>{m.fuel_import_date_error({ format: state.dateFormat })}</span>
    </div>
  {/if}

  <div class="my-4 overflow-x-auto rounded-md border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-12">#</Table.Head>
          {#each columns as column}
            <Table.Head>{column.label}</Table.Head>
          {/each}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if state.mappedPreview.length === 0}
          <Table.Row>
            <Table.Cell
              colspan={columns.length + 1}
              class="text-muted-foreground text-center text-sm"
            >
              {m.fuel_import_no_preview()}
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each state.mappedPreview as row, index}
            <Table.Row
              class={state.dateValidationErrors[index]
                ? 'bg-destructive/10 hover:bg-destructive/15'
                : ''}
            >
              <Table.Cell class="font-mono text-xs">{index + 1}</Table.Cell>
              {#each columns as column}
                <Table.Cell
                  class={`text-sm ${column.key === 'date' && state.dateValidationErrors[index] ? 'text-destructive font-semibold' : ''}`}
                >
                  {row[column.key] || ''}
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex justify-between gap-2">
    <Button
      variant="outline"
      onclick={() => (state.step = 2)}
      class="cursor-pointer"
      size="icon-sm"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div class="flex items-center gap-2">
      {#if state.processing === 'importing'}
        <Loader2 class="text-muted-foreground mr-2 inline-block h-4 w-4 animate-spin" />
      {/if}
      <Button
        onclick={state.handleImport}
        disabled={!state.canImport || state.hasDateErrors || state.processing === 'importing'}
        class="cursor-pointer"
        size="sm"
      >
        {m.common_import()}
      </Button>
    </div>
  </div>
</section>
