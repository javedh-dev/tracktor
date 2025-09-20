<script lang="ts">
	import { Plus } from '@lucide/svelte/icons';
	import { scale } from 'svelte/transition';
	import IconButton from './IconButton.svelte';

	const { onclose, children, title } = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
	<div
		in:scale={{ duration: 500 }}
		class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-10 shadow-2xl dark:bg-gray-800"
	>
		<div class="mb-2 flex flex-row items-center justify-between">
			<h2 class="text-left text-2xl font-bold text-gray-900 dark:text-gray-100">
				{title}
			</h2>
			<IconButton
				buttonStyles="bg-gray-200 dark:bg-gray-700"
				iconStyles="text-gray-600 dark:text-gray-100 hover:text-red-500 rotate-45 h-6 w-6"
				icon={Plus}
				onclick={onclose}
				ariaLabel="Close"
			/>
		</div>
		<div class="mb-4 border-b border-gray-200 dark:border-gray-700"></div>
		{@render children()}
	</div>
</div>
