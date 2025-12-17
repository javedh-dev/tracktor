<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('bg-muted animate-pulse rounded-md', className)} {...rest}></div>
