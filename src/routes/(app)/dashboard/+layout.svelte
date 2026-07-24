<script lang="ts">
  let { children } = $props();
</script>

<div id="dashboard-page-content" class="mx-auto p-4 lg:container lg:p-6">
  {@render children()}
</div>
