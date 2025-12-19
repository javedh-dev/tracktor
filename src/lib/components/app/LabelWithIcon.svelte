<script lang="ts">
	import { cn } from '$lib/utils';

	let { id = '', icon: Icon, label = '', children = null, iconClass = '', style = '' } = $props();
</script>

<div
	id="label-with-icon-{id || 'default'}"
	class={cn('label-with-icon flex flex-row items-center gap-2', style)}
>
	<Icon class={iconClass} />
	<span>{label}</span>
	{#if children}
		{@render children()}
	{/if}
</div>
