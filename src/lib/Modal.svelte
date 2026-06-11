<script>
  import { fade } from "svelte/transition";

  let { children, close } = $props();
</script>


<div class="dialog-backdrop" in:fade={{duration: 200}}>
  <div class="dialog">
    
    {@render children?.()}

  </div>
</div>


<style>
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .dialog {
    background: #fff;
    padding: 1.5rem;
    border-radius: 1rem;
    max-width: 28rem;
    width: calc(100% - 2rem);
  }
</style>