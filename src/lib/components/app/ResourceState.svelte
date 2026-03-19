<script lang="ts">
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';

  interface Props {
    state: 'error' | 'empty' | 'info';
    message: string;
  }

  let { state, message }: Props = $props();

  const config = $derived.by(() => {
    switch (state) {
      case 'error':
        return {
          icon: CircleAlert,
          iconClass: 'h-5 w-5',
          style:
            'flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive'
        };
      case 'info':
        return {
          icon: CircleAlert,
          iconClass: 'h-5 w-5',
          style:
            'bg-muted text-muted-foreground border-border flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center'
        };
      default:
        return {
          icon: CircleSlash2,
          iconClass: 'h-5 w-5',
          style:
            'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center'
        };
    }
  });
</script>

<LabelWithIcon
  icon={config.icon}
  iconClass={config.iconClass}
  style={config.style}
  label={message}
/>
