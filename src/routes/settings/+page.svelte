<script>
  import { palette, PALETTES } from '$lib/stores/palette';
</script>


<div class="container">

  <header>
    <a href="/" class="back" aria-label="Back">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
    </a>
    <h1>Settings</h1>
  </header>

  <div class="overtitle">
    Appearance
  </div>

  <h2>Color palette</h2>

  {#each Object.entries(PALETTES) as [id, p]}
    <button class="palette" class:active={$palette === id} onclick={() => palette.set(id)}>
      <div class="colors">
        {#each p.swatches as color}
          <span style="background: {color}"></span>
        {/each}
      </div>
      <div class="label">
        {p.label}
      </div>
      {#if $palette === id}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check size-5" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
      {/if}
    </button>
  {/each}

</div>


<style>
  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    line-height: 1;
  }

  .back {
    color: var(--color-text);
  }

  .back svg {
    width: 24px;
  }

  h1 {
    margin: 0;
  }

  h2 {
    margin-left: 1rem;
    margin-bottom: 1rem;
    font-weight: 300;
    color: var(--color-text);
    font-size: 20px;
  }

  .overtitle {
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.05rem;
    font-size: 13px;
    margin-left: 1rem;
  }

  button.palette {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    margin-bottom: 0.5rem;
    background: var(--color-box);
    border: none;
    border-radius: 1.5rem;
    font-weight: 400;
  }

  button.palette.active {
    background: var(--color-button-muted);
  }

  button.palette svg {
    width: 24px;
    height: 24px;
  }

  .colors {
    display: flex;
    align-items: center;
  }

  .colors span {
    border: solid 2px oklch(0.97 0.02 120);
    border-radius: 100%;
    width: 28px;
    height: 28px;
    margin-left: -8px;
  }

  .colors span:first-child {
    margin-left: 0;
  }

  .label {
    flex: 1;
    text-align: left;
  }
</style>