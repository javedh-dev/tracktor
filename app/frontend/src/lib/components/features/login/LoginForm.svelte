<script lang="ts">
	import { cn } from '$lib/utils';
	import { ShieldEllipsis, Tractor } from '@lucide/svelte/icons';
	import PinInput from './PinInput.svelte';
	import * as Card from '$lib/components/ui/card';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';

	let { class: className = '', oncomplete, ...restProps } = $props();
</script>

<Card.Root class={cn('flex flex-col items-center gap-6 py-12', className)} {...restProps}>
	<LabelWithIcon icon={Tractor} iconClass="lg:h-12 lg:w-12">
		<h1 class="text-xl font-bold lg:text-3xl">Welcome to Tracktor</h1>
	</LabelWithIcon>
	<LabelWithIcon
		icon={ShieldEllipsis}
		iconClass="lg:h-6 lg:w-6"
		label="Enter your 6-digit PIN to access the app"
		style="gap-4 text-zinc-400 text-sm"
	/>
	<PinInput {oncomplete} />
</Card.Root>
