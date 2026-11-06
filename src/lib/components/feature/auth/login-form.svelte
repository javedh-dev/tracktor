<script lang="ts">
  import { FieldGroup, Field, FieldLabel } from '$ui/field/index.js';
  import Input from '$appui/input.svelte';
  import { authStore } from '$stores/auth.svelte';
  import { goto } from '$app/navigation';
  import UserIcon from '@lucide/svelte/icons/circle-user-round';
  import RectangleEllipsis from '@lucide/svelte/icons/rectangle-ellipsis';
  import LogIn from '@lucide/svelte/icons/log-in';
  import SubmitButton from '$appui/SubmitButton.svelte';

  import * as m from '$lib/paraglide/messages';

  let username = $state('');
  let password = $state('');
  let processing = $state(false);
  let oidcProcessing = $state(false);

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
        goto('/dashboard');
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

{#if authStore.oidcEnabled && !authStore.isAuthDisabled}
  <div class="relative my-4">
    <div class="absolute inset-0 flex items-center">
      <span class="w-full border-t"></span>
    </div>
    <div class="relative flex justify-center text-xs uppercase">
      <span class="bg-card text-muted-foreground px-2">{m.auth_login_or()}</span>
    </div>
  </div>
  <button
    onclick={() => {
      oidcProcessing = true;
      authStore.oidcLogin();
    }}
    disabled={oidcProcessing}
    class="hover:bg-accent flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all duration-300 disabled:opacity-50"
  >
    <LogIn class="h-4 w-4" />
    {oidcProcessing ? m.auth_sso_login_loading() : m.auth_sso_login_button()}
  </button>
{/if}
