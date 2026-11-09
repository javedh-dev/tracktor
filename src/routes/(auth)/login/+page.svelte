<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  import LoginForm from '$feature/auth/login-form.svelte';
</script>

<LoginForm capabilities={data.authCapabilities} />
