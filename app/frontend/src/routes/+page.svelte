<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { simulateNetworkDelay } from '$lib/helper/dev';

	if (browser) {
		const pin = localStorage.getItem('userPin');
		if (pin) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/login', { replaceState: true });
		}
	}
</script>
