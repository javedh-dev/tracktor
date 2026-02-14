<script lang="ts">
	import * as Separator from '$ui/separator';

	interface Props {
		title: string;
		description?: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="space-y-2">
	<div>
		<h2 class="mb-1 text-2xl font-semibold">{title}</h2>
		{#if description}
			<p class="text-muted-foreground text-sm">{description}</p>
		{/if}
	</div>
	<Separator.Root />
</div>
