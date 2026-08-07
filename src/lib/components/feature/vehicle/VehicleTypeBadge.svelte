<script lang="ts">
  import { getVehicleTypeIcon, vehicleAccent } from '$lib/domain/vehicle';
  import { cn } from '$lib/utils';

  let {
    vehicleType,
    color,
    class: className,
    title
  }: {
    vehicleType: string | null | undefined;
    color?: string | null;
    class?: string;
    title?: string;
  } = $props();

  const Icon = $derived(getVehicleTypeIcon(vehicleType ?? 'car'));
  const accent = $derived(vehicleAccent(color));
</script>

<div
  class={cn(
    'flex aspect-square shrink-0 items-center justify-center rounded-xl shadow-sm',
    accent ? '' : 'bg-accent',
    className
  )}
  style={accent ? `background-color: ${accent.background}` : undefined}
  {title}
>
  <Icon class={cn('size-1/2', accent ? accent.iconClass : 'text-accent-foreground')} />
</div>
