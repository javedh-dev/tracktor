<script lang="ts">
	interface Props {
		message?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { message = 'Loading...', size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12'
	};
</script>

<div class="flex items-center justify-center">
	<div class="text-center">
		<div
			class="animate-spin rounded-full {sizeClasses[size]} border-primary mx-auto border-b-2"
		></div>
		{#if message}
			<p class="text-muted-foreground mt-2 text-sm">{message}</p>
		{/if}
	</div>
</div>
