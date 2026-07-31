<script lang="ts">
  import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import { overview_chart_pick_vehicle } from '$lib/paraglide/messages/_index.js';

  interface Props {
    title?: string;
    /** Defaults to the "select a vehicle" hint; override for the inverse case (data only available fleet-wide). */
    message?: string;
  }

  let { title, message }: Props = $props();
</script>

<div
  class="area-chart lg:bg-background/50 bg-secondary relative flex h-64 flex-col rounded-lg px-4 pt-2 pb-6 lg:p-6"
>
  {#if title}
    <div class="mb-4 flex shrink-0 flex-row items-center gap-2 font-bold">
      <span>{title}</span>
    </div>
  {/if}
  <div class="flex flex-1 flex-col items-center justify-center gap-2 text-center">
    <LabelWithIcon
      icon={CircleSlash2}
      iconClass="h-4 w-4"
      label={message ?? overview_chart_pick_vehicle()}
    />
  </div>
</div>
