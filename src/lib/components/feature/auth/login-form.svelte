<script lang="ts">
  import { FieldGroup, Field, FieldLabel } from '$ui/field/index.js';
  import Input from '$appui/input.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { goto } from '$app/navigation';
  import UserIcon from '@lucide/svelte/icons/circle-user-round';
  import RectangleEllipsis from '@lucide/svelte/icons/rectangle-ellipsis';
  import SubmitButton from '$appui/SubmitButton.svelte';

  import { page } from '$app/state';
  import { withBase } from '$lib/utils';
  import { Button } from '$ui/button';
  import * as Alert from '$ui/alert';
  import * as m from '$lib/paraglide/messages';

  let {
    capabilities
  }: { capabilities: { oidcEnabled: boolean; localAuthEnabled: boolean; hasUsers: boolean } } =
    $props();

  let username = $state('');
  let password = $state('');
  let processing = $state(false);

  $effect(() => {
    // Check if users exist when component mounts
    authStore.checkAuthStatus();
  });

  const handleLogin = async (event: Event) => {
    event.preventDefault();
    if (!username || !password || processing) return;

    processing = true;
    try {
      const success = await authStore.login(username, password);
      if (success) {
        goto(withBase('/dashboard'));
      }
    } finally {
      processing = false;
    }
  };
</script>

<div class="mb-6 flex flex-col gap-1">
  <h1 class="text-2xl font-semibold">{m.auth_login_title()}</h1>
  <p class="text-muted-foreground text-sm">{m.auth_login_subtitle()}</p>
</div>

{#if capabilities.localAuthEnabled}
  <form id="auth-login-form" onsubmit={handleLogin}>
    <fieldset disabled={processing} class="w-full">
      <FieldGroup class="w-full">
        <Field>
          <FieldLabel for="email">{m.auth_username()}</FieldLabel>
          <Input
            id="email"
            icon={UserIcon}
            type="text"
            required
            bind:value={username}
            placeholder={m.auth_username_placeholder()}
          />
        </Field>
        <Field>
          <FieldLabel for="password">{m.auth_password()}</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            placeholder={m.auth_password_placeholder()}
            icon={RectangleEllipsis}
            bind:value={password}
          />
        </Field>
        <Field>
          <SubmitButton
            {processing}
            class="transition-all duration-300"
            loadingText={m.auth_login_loading()}
          >
            {m.auth_login_button()}
          </SubmitButton>
        </Field>
        <!-- <FieldDescription class="text-center">
			Don't have an account? <a
				href={'/register'}
				class="transition-all duration-300 hover:underline">Sign up</a
			>
		</FieldDescription> -->
      </FieldGroup>
    </fieldset>
  </form>
{/if}

{#if page.url.searchParams.get('oidc') === 'error'}
  <Alert.Root variant="destructive"
    ><Alert.Description>{m.auth_sso_error()}</Alert.Description></Alert.Root
  >
{/if}
{#if capabilities.oidcEnabled && capabilities.hasUsers}
  <Button
    class="mt-4 w-full"
    href={withBase('/api/auth/oidc/login')}
    data-sveltekit-reload
    variant="outline">{m.auth_sso_login_button()}</Button
  >
{/if}

{#if capabilities.oidcEnabled && capabilities.localAuthEnabled && !capabilities.hasUsers}
  <Button href={withBase('/register')} class="mt-4 w-full">{m.auth_create_admin()}</Button>
{/if}
