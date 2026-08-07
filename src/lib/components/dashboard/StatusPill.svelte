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
    | 'not_available'
    | 'upcoming';

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
    not_available: 'N/A',
    upcoming: 'Upcoming'
  };

  const displayLabel = $derived(label ?? defaultLabels[status]);

  const variant = $derived(
    status === 'expired' || status === 'needs_action'
      ? 'destructive'
      : status === 'expiring_soon' || status === 'attention' || status === 'upcoming'
        ? 'secondary'
        : status === 'not_available'
          ? 'outline'
          : 'default'
  );

  const colorClass = $derived(
    status === 'valid' || status === 'active' || status === 'good'
      ? 'bg-success/10 text-success border-success/20'
      : status === 'expiring_soon' || status === 'attention'
        ? 'bg-warning/10 text-warning border-warning/20'
        : status === 'not_available'
          ? 'bg-muted text-muted-foreground border-border'
          : status === 'upcoming'
            ? 'bg-info/10 text-info border-info/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
  );
</script>

<Badge {variant} class={cn(colorClass)}>
  {displayLabel}
</Badge>
