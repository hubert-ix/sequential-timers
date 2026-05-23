<script>
  let { progress, size, stroke, children } = $props();

  const r = $derived((size - stroke) / 2);
  const c = $derived(2 * Math.PI * r);
  const offset = $derived(
    c * (1 - Math.min(1, Math.max(0, progress)))
  );
</script>


<div class="ring" style="width: {size}px; height: {size}px;">
  <div class="glass" style="position: absolute; inset: 0; border-radius: 9999px;"></div>
  <svg width={size} height={size} style="position: absolute; inset: 0; transform: rotate(-90deg);">
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0 0 0 / 0.08)" stroke-width={stroke} />
    <circle
      cx={size / 2}
      cy={size / 2}
      r={r}
      fill="none"
      stroke="oklch(0.58 0.055 235)"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={c}
      stroke-dashoffset={offset}
      style="transition: stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1);"
    />
  </svg>
  <div class="inner">{@render children()}</div>
</div>
