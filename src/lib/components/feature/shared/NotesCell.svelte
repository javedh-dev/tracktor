<script lang="ts">
  import { formatTableText } from '$helper/table-cell.helper';
  let { value }: { value: unknown } = $props();
</script>

<div class="flex flex-row justify-start">{formatTableText(value)}</div>
