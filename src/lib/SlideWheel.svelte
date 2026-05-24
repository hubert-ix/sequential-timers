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


<style>
  .wheel {
    position: relative;
    width: 5rem;
    user-select: none;
    -webkit-user-select: none;
  }

  .wheel .highlight {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 44px;
    background: var(--secondary);
    border-radius: 0.5rem;
    pointer-events: none;
  }

  .wheel-scroll {
    position: relative;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    height: 132px;
    border-radius: 0.75rem;
    scrollbar-width: none;
  }

  .wheel-scroll::-webkit-scrollbar {
    display: none;
  }

  .wheel-scroll ul {
    list-style: none;
    margin: 0;
    padding: 44px 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .wheel-scroll li {
    scroll-snap-align: center;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    font-weight: 300;
    color: oklch(0.5 0.02 60 / 0.5);
  }

  .wheel-scroll li.active {
    font-size: 1.5rem;
    font-weight: 600;
    color: #000;
  }
</style>