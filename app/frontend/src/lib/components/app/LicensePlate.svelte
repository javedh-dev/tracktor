<script lang="ts">
	import CircleDotDashed from '@lucide/svelte/icons/circle-dot-dashed';

	let { registrationNumber } = $props();
</script>

<div
	class="border-secondary flex flex-row items-center gap-2 rounded-md border-4 text-xl font-bold"
>
	<div class="bg-secondary flex h-8 w-10 items-center justify-center rounded">
		<CircleDotDashed class="h-5 w-5" />
	</div>
	<p class="mono justify-start rounded-md pe-2 font-bold">{registrationNumber || '-'}</p>
</div>
