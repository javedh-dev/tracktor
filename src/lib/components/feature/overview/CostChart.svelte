<script lang="ts">
	import { getCurrencySymbol } from '$lib/helper/format.helper';
	import { chartStore } from '$stores/chart.svelte';
	import { fuelLogStore } from '$stores/fuel-log.svelte';
	import AreaChart from './AreaChart.svelte';
	import {
		overview_chart_cost_label,
		overview_chart_cost_title
	} from '$lib/paraglide/messages/_index.js';
</script>

<AreaChart
	chartData={chartStore.costData || []}
	label={overview_chart_cost_label()}
	title={overview_chart_cost_title({ currency: getCurrencySymbol() })}
	loading={fuelLogStore.processing}
	xFormatter={(v: Date) =>
		v.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
/>
