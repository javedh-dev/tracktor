<script lang="ts">
  import { formatTableCurrency } from '$helper/table-cell.helper';
  let { value }: { value: unknown } = $props();
</script>

<div class="flex flex-row justify-start">{formatTableCurrency(value)}</div>
