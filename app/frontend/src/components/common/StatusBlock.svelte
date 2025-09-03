<script lang="ts">
	let {
		message,
		type = 'INFO'
	}: {
		message?: string;
		type: 'INFO' | 'SUCCESS' | 'ERROR';
	} = $props();

	const getStatusTypeClasses = () => {
		if (type === 'INFO') return 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-100';
		if (type === 'SUCCESS')
			return 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-100';
		if (type === 'ERROR') return 'bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-100';
	};
</script>

{#if message}
	<p class={`mt-4 rounded-md p-2 text-center text-sm ${getStatusTypeClasses()}`}>
		{#each message.split('\n') as error}
			{error}<br />
		{/each}
	</p>
{/if}
