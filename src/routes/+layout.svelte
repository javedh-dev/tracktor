<script lang="ts">
  import type { LayoutProps } from './$types';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
  import { ModeWatcher } from 'mode-watcher';
  import '../styles/app.css';
  import { Toaster } from '$ui/sonner';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { configStore } from '$lib/stores/config.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { app_name } from '$lib/paraglide/messages/_index.js';
  import { app_new_update_available } from '$lib/paraglide/messages';

  let { children }: LayoutProps = $props();
  let customCss = $state('');

  async function detectSWUpdate() {
    const registrations = await navigator?.serviceWorker?.ready;

    registrations?.addEventListener('updatefound', () => {
      const newSW = registrations.installing;

      newSW?.addEventListener('statechange', () => {
        if (newSW.state === 'installed') {
          toast.info(app_new_update_available());

          setTimeout(() => {
            newSW.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }, 2000);
        }
      });
    });
  }

  onMount(() => {
    themeStore.initializeTheme();

    detectSWUpdate();

    configStore.getCustomCss().then((css) => {
      customCss = css;

      if (customCss) {
        const style = document.createElement('style');

        style.innerHTML = customCss;
        document.head.appendChild(style);
      }
    });
  });
</script>

<svelte:head>
  <title>{app_name()}</title>
</svelte:head>

<ModeWatcher />
<Toaster position="bottom-right" richColors expand />

{@render children()}
<div style="display:none">
  {#each locales as locale (locale)}
    <a href={localizeHref(page.url.pathname, { locale })}>
      {locale}
    </a>
  {/each}
</div>
