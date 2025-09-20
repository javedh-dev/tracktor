<script lang="ts">
	const { title, children } = $props();
</script>

<div class="bg-secondary rounded-md p-2 lg:p-8" role="tabpanel" aria-labelledby="dashboard-tab">
	<h2 class="mb-6 font-bold underline underline-offset-8 lg:text-2xl">
		{title}
	</h2>
	{@render children()}
</div>
