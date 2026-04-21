<script lang="ts">
  import BellOff from '@lucide/svelte/icons/bell-off';
  import * as Card from '$ui/card';
  import * as m from '$lib/paraglide/messages';
</script>

<Card.Root class="border-dashed">
  <Card.Content class="flex flex-col items-center justify-center py-6">
    <BellOff class="text-muted-foreground mb-4 h-8 w-8" />
    <p class="text-muted-foreground mb-2 text-center font-medium">
      {m.notif_empty_title()}
    </p>
    <p class="text-muted-foreground text-center text-sm">
      {m.notif_empty_desc()}
    </p>
  </Card.Content>
</Card.Root>
