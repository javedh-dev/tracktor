<script lang="ts">
  import type { FuelLogImportState } from './fuel-log-import.svelte';
  import { columns } from './fuel-log-import.svelte';
  import Button from '$ui/button/button.svelte';
  import * as Select from '$ui/select/index.js';
  import { Separator } from '$ui/separator';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import * as m from '$lib/paraglide/messages';

  let { state }: { state: FuelLogImportState } = $props();
</script>

<section>
  <div class="space-y-1">
    <p class="text-lg font-semibold">{m.fuel_import_step_2_title()}</p>
    <p class="text-muted-foreground text-sm">
      {@html m.fuel_import_step_2_desc()}
    </p>
  </div>
  <Separator class="my-4" orientation="horizontal" />
  {#if state.csvHeaders.length === 0}
    <div class="text-muted-foreground text-sm">
      {m.fuel_import_error_no_headers()}
    </div>
  {:else}
    <div class="my-6 flex flex-col gap-4">
      {#each columns as column}
        <div class="flex h-full flex-row items-start justify-between rounded-md py-1">
          <div class="space-y-1">
            <p class="text-sm font-semibold">
              {column.label}
              {#if column.required}<span class="text-destructive">*</span>{/if}
            </p>
            {#if column.hint}
              <p class="text-muted-foreground text-xs">{column.hint}</p>
            {/if}
          </div>
          <div>
            <Select.Root type="single" bind:value={state.mapping[column.key]}>
              <Select.Trigger>
                {#if state.mapping[column.key] && state.mapping[column.key] !== '__skip'}
                  {state.mapping[column.key]}
                {:else if !column.required}
                  {m.common_skip()}
                {:else}
                  {m.common_select_column()}
                {/if}
              </Select.Trigger>
              <Select.Content>
                {#if !column.required}
                  <Select.Item value="__skip">{m.common_skip()}</Select.Item>
                {/if}
                {#each state.csvHeaders as header}
                  <Select.Item value={header}>{header}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="flex justify-between gap-2">
    <Button
      variant="outline"
      onclick={() => (state.step = 1)}
      class="cursor-pointer"
      size="icon-sm"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div class="flex gap-2">
      <Button
        variant="outline"
        onclick={state.resetParsedState}
        class="cursor-pointer"
        size="icon-sm"
      >
        <RotateCcw class="h-4 w-4" />
      </Button>
      <Button
        onclick={state.goToPreview}
        disabled={!state.canProceedFromMapping}
        class="cursor-pointer"
        size="icon-sm"
        variant="default"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</section>
