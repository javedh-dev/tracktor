<script lang="ts">
	import { cn } from '$lib/utils';
	import { ShieldEllipsis, Tractor } from '@lucide/svelte/icons';
	import PinInput from './PinInput.svelte';
	import * as Card from '$lib/components/ui/card';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';

	let { class: className = '', oncomplete, ...restProps } = $props();
</script>

<Card.Root class={cn('flex flex-col items-center gap-6 py-12', className)} {...restProps}>
	<LabelWithIcon icon={Tractor} iconClass="h-12 w-12">
		<h1 class="text-3xl font-bold">Welcome to Tracktor</h1>
	</LabelWithIcon>
	<LabelWithIcon
		icon={ShieldEllipsis}
		iconClass="h-6 w-6"
		label="Enter your 6-digit PIN to access the app"
		style="gap-4 text-zinc-400"
	/>
	<PinInput {oncomplete} />
</Card.Root>
