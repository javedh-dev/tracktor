<script lang="ts">
  import * as Tabs from '$ui/tabs/index.js';

  interface Tab {
    id: string;
    label: string;
  }

  let { tabs, value = $bindable() }: { tabs: Tab[]; value: string } = $props();
</script>

<Tabs.Root bind:value>
  <Tabs.List class="h-auto flex-wrap">
    {#each tabs as tab (tab.id)}
      <Tabs.Trigger value={tab.id}>{tab.label}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
