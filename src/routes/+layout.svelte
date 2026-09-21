<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { palette, PALETTES } from '$lib/stores/palette';
  import { browser } from '$app/environment';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { App } from '@capacitor/app';
  import { onMount } from 'svelte';
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

  onMount(() => {
    App.addListener('backButton', () => {
      const path = $page.url.pathname;
      if (path === '/') {
        App.exitApp();
      } else if (path === '/settings') {
        goto('/');
      } else if (path.match(/^\/sequence\/[^/]+$/)) {
        // sequence detail page
        goto('/');
      } else if (path.match(/^\/sequence\/[^/]+\/timer\/new$/)) {
        const id = path.split('/')[2];
        goto(`/sequence/${id}`);
      } else if (path.match(/^\/sequence\/[^/]+\/timer\/[^/]+$/)) {
        const id = path.split('/')[2];
        goto(`/sequence/${id}`);
      } else if (path.match(/^\/sequence\/[^/]+\/done$/)) {
        const id = path.split('/')[2];
        goto(`/sequence/${id}`);
      } else {
        goto('/');
      }
    });
    return () => {
      App.removeAllListeners();
    };
  });
</script>


<main>
  {@render children()}
</main>
