<script lang="ts">
	const { title, children } = $props();
</script>

<div class="bg-secondary rounded-md p-8" role="tabpanel" aria-labelledby="dashboard-tab">
	<h2 class="mb-6 text-2xl font-bold underline underline-offset-8">
		{title}
	</h2>
	{@render children()}
</div>
