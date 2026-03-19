<script lang="ts">
  import FeatureGate from '$lib/components/feature/FeatureGate.svelte';

  interface Props {
    feature: string;
    containerId: string;
    disabledTitle: string;
    disabledHint: string;
    tabComponent: any;
  }

  let {
    feature,
    containerId,
    disabledTitle,
    disabledHint,
    tabComponent: TabComponent
  }: Props = $props();
</script>

<FeatureGate {feature}>
  {#snippet children()}
    <div id={containerId} class="w-full">
      <TabComponent />
    </div>
  {/snippet}
  {#snippet fallback()}
    <div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <div class="text-center">
        <p class="text-muted-foreground text-lg font-medium">{disabledTitle}</p>
        <p class="text-muted-foreground text-sm">{disabledHint}</p>
      </div>
    </div>
  {/snippet}
</FeatureGate>
