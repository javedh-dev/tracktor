<script lang="ts">
	const { title, children } = $props();
</script>

<div class="bg-secondary rounded-lg p-4" role="tabpanel" aria-labelledby="dashboard-tab">
	<h2 class="mb-6 text-2xl font-bold">
		{title}
	</h2>
	{@render children()}
</div>
