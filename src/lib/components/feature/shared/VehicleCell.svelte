<script lang="ts">
  interface Props {
    make?: string | null;
    model?: string | null;
    plate?: string | null;
  }

  let { make, model, plate }: Props = $props();
</script>

<div class="flex flex-col">
  <span class="font-medium">{make} {model}</span>
  {#if plate}
    <span class="text-muted-foreground text-xs">{plate}</span>
  {/if}
</div>
