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

<main id="settings-layout-main" class="mx-auto p-4 lg:container lg:p-6">
  {@render children()}
</main>
