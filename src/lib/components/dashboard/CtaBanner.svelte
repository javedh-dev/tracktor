<script lang="ts">
  import type { Component } from 'svelte';
  import Button from '$ui/button/button.svelte';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';

  interface Props {
    heading: string;
    description: string;
    buttonLabel: string;
    buttonIcon: Component<{ class?: string }>;
    onButtonClick: () => void;
  }

  let { heading, description, buttonLabel, buttonIcon, onButtonClick }: Props = $props();
</script>

<div
  class="from-primary/10 via-primary/5 border-primary/15 relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-6 shadow-sm"
>
  <div
    class="bg-primary/10 pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
  ></div>
  <div class="relative min-w-0">
    <h3 class="text-lg font-semibold">{heading}</h3>
    <p class="text-muted-foreground text-sm">{description}</p>
  </div>
  <Button variant="default" onclick={onButtonClick} class="relative shrink-0 shadow-md">
    <LabelWithIcon icon={buttonIcon} label={buttonLabel} />
  </Button>
</div>
