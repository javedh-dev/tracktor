<script lang="ts">
  import { formatTableDate } from '$helper/table-cell.helper';
  let { value }: { value: unknown } = $props();
</script>

<div class="flex flex-row justify-start">{formatTableDate(value)}</div>
