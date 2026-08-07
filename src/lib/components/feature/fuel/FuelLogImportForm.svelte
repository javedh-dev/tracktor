<script lang="ts">
  import { FuelLogImportState, stepOrder } from './fuel-log-import.svelte';
  import ImportStepUpload from './ImportStepUpload.svelte';
  import ImportStepMapping from './ImportStepMapping.svelte';
  import ImportStepPreview from './ImportStepPreview.svelte';
  import Badge from '$ui/badge/badge.svelte';
  import { Separator } from '$ui/separator';
  import Check from '@lucide/svelte/icons/check';

  const state = new FuelLogImportState();
</script>

<div class="max-w-4xl space-y-6">
  <div class="space-y-1">
    <p class="text-sm font-bold">
      Vehicle: <Badge variant="outline">{state.selectedVehicleLabel}</Badge>
    </p>
  </div>
  <div class="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1">
    {#each stepOrder as stepId, index}
      <div class="flex flex-col items-center gap-2">
        <Badge variant={state.step >= stepId ? 'default' : 'outline'} class="w-8 justify-center">
          {#if state.step > stepId}
            <Check class="h-4 w-4" />
          {:else}
            {stepId}
          {/if}
        </Badge>
      </div>
      {#if index < stepOrder.length - 1}
        <div class="flex-1">
          <Separator orientation="horizontal" />
        </div>
      {/if}
    {/each}
  </div>
  {#if state.step === 1}
    <ImportStepUpload {state} />
  {/if}
  {#if state.step === 2}
    <ImportStepMapping {state} />
  {/if}
  {#if state.step === 3}
    <ImportStepPreview {state} />
  {/if}
</div>
