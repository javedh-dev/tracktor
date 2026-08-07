<script lang="ts">
  import { formatTableDistance } from '$helper/table-cell.helper';
  let { value }: { value: unknown } = $props();
</script>

<div class="flex flex-row justify-center">{formatTableDistance(value)}</div>
