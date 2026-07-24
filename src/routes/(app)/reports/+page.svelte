<script lang="ts">
  import PageHeader from '$dashboard/PageHeader.svelte';
  import Button from '$ui/button/button.svelte';
  import FileDown from '@lucide/svelte/icons/file-down';
  import FileText from '@lucide/svelte/icons/file-text';
  import LabelWithIcon from '$appui/LabelWithIcon.svelte';
  import { toast } from 'svelte-sonner';
  import * as m from '$lib/paraglide/messages';
</script>

<div class="space-y-6">
  <PageHeader title="Reports" description="Generate and export fleet reports" />

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div
      class="bg-card hover:bg-secondary/50 flex cursor-pointer flex-col items-center gap-4 rounded-xl border p-8 transition-colors"
    >
      <FileText class="text-primary size-12" />
      <div class="text-center">
        <h3 class="font-semibold">Maintenance Report</h3>
        <p class="text-muted-foreground mt-1 text-sm">Export maintenance history as PDF</p>
      </div>
      <Button variant="outline" size="sm" onclick={() => toast.info('Coming soon')}>
        <LabelWithIcon icon={FileDown} label="Export" />
      </Button>
    </div>

    <div
      class="bg-card hover:bg-secondary/50 flex cursor-pointer flex-col items-center gap-4 rounded-xl border p-8 transition-colors"
    >
      <FileText class="text-primary size-12" />
      <div class="text-center">
        <h3 class="font-semibold">Fuel Report</h3>
        <p class="text-muted-foreground mt-1 text-sm">Fuel consumption and cost summary</p>
      </div>
      <Button variant="outline" size="sm" onclick={() => toast.info('Coming soon')}>
        <LabelWithIcon icon={FileDown} label="Export" />
      </Button>
    </div>

    <div
      class="bg-card hover:bg-secondary/50 flex cursor-pointer flex-col items-center gap-4 rounded-xl border p-8 transition-colors"
    >
      <FileText class="text-primary size-12" />
      <div class="text-center">
        <h3 class="font-semibold">Full Data Export</h3>
        <p class="text-muted-foreground mt-1 text-sm">Export all fleet data as JSON</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onclick={() => toast.info(m.data_export_import_menu_item())}
      >
        <LabelWithIcon icon={FileDown} label="Export" />
      </Button>
    </div>
  </div>
</div>
