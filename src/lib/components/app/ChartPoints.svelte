<script lang="ts">
  import { Points } from 'layerchart';

  let {
    seriesKey,
    data,
    color
  }: {
    seriesKey?: string;
    data?: unknown;
    color?: string;
  } = $props();
</script>

<Points {seriesKey} {data} x="x" r={2.5} fill={color} class="chart-point" />

<style>
  :global(.chart-point) {
    transition: r 150ms ease-out;
  }

  :global(.chart-point:hover) {
    r: 6px;
  }
</style>
