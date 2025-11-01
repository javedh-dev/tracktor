<script lang="ts">
	import { formatCurrency, getCurrencySymbol } from '$lib/helper/format.helper';
	import { chartStore } from '$lib/stores/chart.svelte';
	import AreaChart from './AreaChart.svelte';
</script>

<AreaChart
	chartData={chartStore.costData || []}
	label="Cost"
	title={`Cost over Time in (${getCurrencySymbol()})`}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
	yFormatter={(v: number) => formatCurrency(v)}
/>
