<script lang="ts">
	import { Button } from '$ui/button/index.js';
	import type { ButtonProps } from '$ui/button/index.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	let {
		processing = false,
		children,
		loadingText = '',
		...rest
	}: ButtonProps & { processing?: boolean; loadingText?: string } = $props();
</script>

<Button id="submit-button" type="submit" disabled={processing} {...rest}>
	{#if processing}
		<Loader2 id="submit-button-spinner" class="mr-2 h-4 w-4 animate-spin" />
		{#if loadingText}
			<span id="submit-button-loading-text">{loadingText}</span>
		{/if}
	{/if}
	{#if !processing || !loadingText}
		{@render children?.()}
	{/if}
</Button>
