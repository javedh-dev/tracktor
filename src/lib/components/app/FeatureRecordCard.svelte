<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    id: string;
    title: string;
    titleIcon: any;
    titleClass?: string;
    class?: string;
    headerExtras?: any;
    actions?: any;
    children?: any;
  }

  let {
    id,
    title,
    titleIcon: TitleIcon,
    titleClass = '',
    class: className = '',
    headerExtras,
    actions,
    children
  }: Props = $props();
</script>

<div {id} class={cn('mt-4 rounded-lg border p-4 shadow-sm lg:p-6', className)}>
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-wrap items-center gap-4 align-middle">
      <div class={cn('flex items-center gap-2', titleClass)}>
        <TitleIcon class="h-6 w-6" />
        <span class="line-clamp-1 text-lg font-bold lg:text-xl">{title}</span>
      </div>
      {@render headerExtras?.()}
    </div>
    {@render actions?.()}
  </div>

  <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
    {@render children?.()}
  </div>
</div>
