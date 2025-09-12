<script lang="ts">
	import { cn } from '$lib/utils';

	let { icon: Icon, label, iconClass = '', labelClass = '', style = '' } = $props();
</script>

<div class={cn('flex flex-row items-center gap-2', style)}>
	<Icon class={iconClass} />
	<span class={labelClass}>{label}</span>
</div>
