<script>
  let { checked = $bindable() } = $props();
</script>


<button class="toggle" class:on={checked} onclick={() => (checked = !checked)} role="switch" aria-checked={checked}>
  <span class="thumb"></span>
</button>


<style>
  .toggle {
    width: 48px;
    height: 28px;
    border-radius: 999px;
    background: var(--color-toggle);
    border: none;
    padding: 0;
    cursor: pointer;
    position: relative;
    transition: background 0.2s ease;
    flex-shrink: 0;
  }

  .toggle.on {
    background: var(--color-button);
  }

  .thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toggle.on .thumb {
    transform: translateX(20px);
  }
</style>