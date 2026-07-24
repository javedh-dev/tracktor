<script lang="ts">
  import Badge from '$ui/badge/badge.svelte';
  import { cn } from '$lib/utils';

  type Status =
    | 'valid'
    | 'expiring_soon'
    | 'expired'
    | 'active'
    | 'needs_action'
    | 'attention'
    | 'good'
    | 'not_available';

  interface Props {
    status: Status;
    label?: string;
  }

  let { status, label }: Props = $props();

  const defaultLabels: Record<Status, string> = {
    valid: 'Valid',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired',
    active: 'Active',
    needs_action: 'Needs Action',
    attention: 'Attention',
    good: 'Good',
    not_available: 'N/A'
  };

  const displayLabel = $derived(label ?? defaultLabels[status]);

  const variant = $derived(
    status === 'expired' || status === 'needs_action'
      ? 'destructive'
      : status === 'expiring_soon' || status === 'attention'
        ? 'secondary'
        : status === 'not_available'
          ? 'outline'
          : 'default'
  );

  const colorClass = $derived(
    status === 'valid' || status === 'active' || status === 'good'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800'
      : status === 'expiring_soon' || status === 'attention'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        : status === 'not_available'
          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-800'
          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800'
  );
</script>

<Badge {variant} class={cn(colorClass)}>
  {displayLabel}
</Badge>
