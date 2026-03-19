<script lang="ts">
  import type { Component } from 'svelte';
  import FeatureGate from '$lib/components/feature/FeatureGate.svelte';
  import IconButton from '$appui/IconButton.svelte';

  interface QuickAction {
    id: string;
    feature: string;
    buttonStyles: string;
    iconStyles: string;
    icon: Component;
    ariaLabel: string;
    onclick: () => void;
  }

  let { actions }: { actions: QuickAction[] } = $props();
</script>

<div id="vehicle-card-primary-actions" class="flex justify-start">
  {#each actions as action (action.id)}
    <FeatureGate feature={action.feature}>
      {#snippet children()}
        <IconButton
          id={action.id}
          buttonStyles={action.buttonStyles}
          iconStyles={action.iconStyles}
          icon={action.icon}
          onclick={action.onclick}
          ariaLabel={action.ariaLabel}
        />
      {/snippet}
    </FeatureGate>
  {/each}
</div>
