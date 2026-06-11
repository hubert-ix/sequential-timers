<script>
  import { scale } from "svelte/transition";

  let { running, transitioning, progress, pause, resume, skip, stop } = $props();
</script>


<div class="progress-controls" in:scale>

  <button class="round ghost bounce" onclick={stop} title="stop">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square size-5" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>
  </button>

  {#if running}

    <button class="round big ring-btn bounce" onclick={pause} title="pause">
      <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="ring-track" cx="50" cy="50" r="45"/>
        <circle class="ring-fill" cx="50" cy="50" r="45"
          stroke-dasharray={2 * Math.PI * 47}
          stroke-dashoffset={2 * Math.PI * 47 * (1 - progress)}
          style={transitioning ? '' : 'transition: none'}
        />
      </svg>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/>
      </svg>
    </button>

  {:else}

    <button class="round big ring-btn bounce" onclick={resume} title="resume">
      <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="ring-track" cx="50" cy="50" r="46"/>
        <circle class="ring-fill" cx="50" cy="50" r="46"
          stroke-dasharray={2 * Math.PI * 46}
          stroke-dashoffset={2 * Math.PI * 46 * (1 - progress)}
        />
      </svg>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>
      </svg>
    </button>

  {/if}
  
  <button class="round ghost bounce" onclick={skip} title="skip">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward size-6" aria-hidden="true">
      <path d="M21 4v16"></path><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"></path>
    </svg>
  </button>

</div>


<style>
  .progress-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .ring-btn {
    position: relative;
    border: none !important;
  }

  .progress-ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    pointer-events: none;
  }

  .ring-track {
    fill: none;
    stroke: var(--color-button-muted);
    stroke-width: 6;
  }

  .ring-fill {
    fill: none;
    stroke: var(--color-arrow);
    stroke-width: 6;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
  }

  .bounce {
    transition: transform 0.1s ease;
  }

  .bounce:active {
    transform: scale(0.97);
  }

  .round {
    background: transparent;
  }
</style>