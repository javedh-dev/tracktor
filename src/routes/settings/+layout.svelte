<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$stores/auth.svelte';

  let { children } = $props();

  onMount(async () => {
    await authStore.checkAuthStatus();
    if (!authStore.isLoggedIn) {
      goto('/login', { replaceState: true });
    }
  });
</script>

<main id="settings-layout-main" class="mx-auto w-full p-6 sm:container">
  {@render children()}
</main>
