<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if (browser) {
		const pin = localStorage.getItem('userPin');
		if (pin) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/login', { replaceState: true });
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<p class="text-lg text-gray-600">Redirecting...</p>
</div>
