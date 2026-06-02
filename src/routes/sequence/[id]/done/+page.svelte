<script>
  import { page } from '$app/stores';
  import { sequences, formatTime } from '$lib/stores/timers-store';

  const id = $derived($page.params.id);
  const sequence = $derived($sequences.find((s) => s.id === id));

  const total = $derived(
    sequence ? sequence.timers.reduce((a, t) => a + t.seconds, 0) : 0
  );
</script>


<div class="container center">

  <div class="top">
    {sequence.name}
  </div>

  <div class="circle">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check size-16 text-m3-on-primary-container" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
  </div>

  <h1>All done</h1>

  <div class="subtitle">
    You completed {sequence.timers.length} timers
  </div>

  <div class="summary">
    <div class="line">
      <div class="label">
        Total time
      </div>
      <div class="value">
        {formatTime(total)}
      </div>
    </div>
  </div>

  <a href="/sequence/{sequence.id}" class="back">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
    Back to sequence
  </a>

</div>


<style>
  .container.center {
    text-align: center;
    position: relative;
  }

  .top {
    margin: 0 auto 4rem auto;
    color: var(--color-text-muted);
    font-size: 1.2rem;
  }

  .circle {
    width: 128px;
    height: 128px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-button-muted);
    border-radius: 100%;
    margin: 2rem auto;
  }

  .circle svg {
    color: #000;
    width: 64px;
    height: 64px;
  }

  h1 {
    margin: 0 0 1rem 0;
  }

  .subtitle {
    margin-bottom: 2rem;
    color: var(--color-text-muted);
  }

  .summary {
    background: var(--color-box);
    border-radius: 28px;
    padding: 2rem;
    margin-bottom: 3rem;    
  }

  .back {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .back svg {
    width: 24px;
  }
</style>