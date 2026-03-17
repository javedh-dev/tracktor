<script lang="ts">
  import BellOff from '@lucide/svelte/icons/bell-off';
  import * as Card from '$ui/card';
</script>

<Card.Root class="border-dashed">
  <Card.Content class="flex flex-col items-center justify-center py-12">
    <BellOff class="text-muted-foreground mb-4 h-12 w-12" />
    <p class="text-muted-foreground mb-2 text-center font-medium">
      No notification providers configured yet
    </p>
    <p class="text-muted-foreground text-center text-sm">
      Add a provider to receive scheduled Reminder, Alert, or Information notifications.
    </p>
  </Card.Content>
</Card.Root>
