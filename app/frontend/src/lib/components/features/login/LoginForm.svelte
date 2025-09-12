<script lang="ts">
	import { cn } from '$lib/utils';
	import { ShieldEllipsis, Tractor } from '@lucide/svelte';
	import PinInput from './PinInput.svelte';
	import * as Card from '$lib/components/ui/card';

	let { class: className = '', oncomplete, ...restProps } = $props();
</script>

<Card.Root class={cn('flex flex-col items-center gap-6 py-12', className)} {...restProps}>
	<div class="flex flex-row items-center gap-4">
		<a href="##" class="flex flex-col items-center gap-2 font-medium">
			<div class="flex size-8 items-center justify-center rounded-md">
				<Tractor size={48} />
			</div>
			<span class="sr-only">Tracktor</span>
		</a>
		<h1 class="text-3xl font-bold">Welcome to Tracktor</h1>
	</div>
	<h2 class="item-center mt-4 flex flex-row gap-4 text-base text-zinc-700 dark:text-zinc-300">
		<ShieldEllipsis size={24} /> Enter your 6-digit PIN to access the app
	</h2>
	<PinInput {oncomplete} />
</Card.Root>
