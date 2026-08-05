<script lang="ts">
  import { withBase } from '$lib/utils';

  interface Props {
    image: string | null | undefined;
    class?: string;
  }

  let { image, class: className = '' }: Props = $props();
</script>

{#if image}
  <img src={withBase(`/api/files/${image}`)} alt="" class={className} />
{:else}
  <!-- CSS-driven, not JS: avoids an SSR/hydration flash to the wrong theme -->
  <img src="/default-light.png" alt="" class="{className} dark:hidden" />
  <img src="/default-dark.png" alt="" class="{className} hidden dark:block" />
{/if}
