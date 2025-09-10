<script lang="ts">
	const { title, chartData, options, ChartComponent } = $props();
</script>

<div
	class="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl dark:bg-gray-800"
>
	<h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
	{#if chartData && chartData.labels && chartData.labels.length > 0}
		<ChartComponent data={chartData} {options} />
	{:else}
		<p class="text-center text-gray-500 dark:text-gray-400">No data available for this vehicle.</p>
	{/if}
</div>
