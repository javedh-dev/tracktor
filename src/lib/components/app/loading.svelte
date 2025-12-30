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

<div id="loading-spinner" class="loading-container flex items-center justify-center">
	<div id="loading-content" class="text-center">
		<div
			id="loading-spinner-element"
			class="loading-spinner animate-spin rounded-full {sizeClasses[
				size
			]} border-primary mx-auto border-b-2"
		></div>
		{#if message}
			<p id="loading-message" class="text-muted-foreground mt-2 text-sm">{message}</p>
		{/if}
	</div>
</div>
