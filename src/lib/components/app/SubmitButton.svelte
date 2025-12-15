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

<Button type="submit" disabled={processing} {...rest}>
	{#if processing}
		<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		{#if loadingText}
			{loadingText}
		{/if}
	{/if}
	{#if !processing || !loadingText}
		{@render children?.()}
	{/if}
</Button>
