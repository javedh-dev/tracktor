<script lang="ts">
  import Badge from '$ui/badge/badge.svelte';
  let { value, yesLabel, noLabel }: { value: boolean; yesLabel: string; noLabel: string } =
    $props();
</script>

<div class="flex flex-row justify-center">
  <Badge variant="outline"><span>{value ? yesLabel : noLabel}</span></Badge>
</div>
