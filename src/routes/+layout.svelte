<script>
  import { palette } from '$lib/stores/palette';
  import { browser } from '$app/environment';
  import '../app.css';

  let { children } = $props();

  if (browser) {
    document.documentElement.setAttribute('data-palette', $palette);
  }
</script>


<main>
  {@render children()}
</main>
