<script>
  let { value, max, onChange } = $props();

  const ITEM_H = 44;
  let el;
  let ignore = false;

  const items = $derived(Array.from({ length: max + 1 }, (_, i) => i));

  $effect(() => {
    if (!el) return;
    const target = value * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) {
      ignore = true;
      el.scrollTo({ top: target, behavior: 'smooth' });
      setTimeout(() => {
        ignore = false;
      }, 350);
    }
  });

  function onScroll() {
    if (!el || ignore) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(max, idx));
    if (clamped !== value) onChange(clamped);
  }

  const pad = (n) => n.toString().padStart(2, '0');
</script>


<div class="wheel">
  <div class="highlight"></div>
  <div class="wheel-scroll" bind:this={el} onscroll={onScroll}>
    <ul>
      {#each items as n}
        <li class={n === value ? 'active' : ''} onclick={() => onChange(n)}>{pad(n)}</li>
      {/each}
    </ul>
  </div>
</div>
