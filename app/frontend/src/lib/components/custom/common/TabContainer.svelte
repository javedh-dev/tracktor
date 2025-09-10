<script lang="ts">
	const { title, children } = $props();
</script>

<div
	class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
	role="tabpanel"
	aria-labelledby="dashboard-tab"
>
	<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
		{title}
	</h2>
	{@render children()}
</div>
