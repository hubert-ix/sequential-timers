<script>
  import { Timer } from 'lucide-svelte';
  let { heading, text } = $props();
</script>


<div class="no-results">
  <div class="icon-no-results">
    <Timer size="25" />
  </div>
  <div class="no-results-heading">
    {heading}
  </div>
  <div class="muted no-results-text">
    {text}
  </div>
</div>


<style>
  .no-results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
  }

  .icon-no-results {
    width: 4rem;
    height: 4rem;
    background: var(--secondary);
    color: #333;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .no-results-heading {
    color: #000;
    font-size: 1.2rem;
    font-weight: 600;
  }
</style>
