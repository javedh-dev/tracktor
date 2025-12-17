<script lang="ts">
	import { cn } from '$lib/utils';

	let { icon: Icon, label = '', children = null, iconClass = '', style = '' } = $props();
</script>

<div class={cn('flex flex-row items-center gap-2', style)}>
	<Icon class={iconClass} />
	<span>{label}</span>
	{#if children}
		{@render children()}
	{/if}
</div>
