<script>
  import { palette, PALETTES } from '$lib/stores/palette';
  import { browser } from '$app/environment';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import '../app.css';

  let { children } = $props();

  if (browser) {
    document.documentElement.setAttribute('data-palette', $palette);
    StatusBar.setBackgroundColor({ color: PALETTES[$palette].bgColor });
  }

  $effect(() => {
    document.documentElement.setAttribute('data-palette', $palette);
    StatusBar.setBackgroundColor({ color: PALETTES[$palette].bgColor });
  });
</script>


<main>
  {@render children()}
</main>
