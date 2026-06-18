<script>
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sequences, updateSequence, uid } from '$lib/stores/timers-store';
  import { buzz } from '$lib/functions/helpers';
  import TimerEditor from '$lib/TimerEditor.svelte';

  const id = $derived($page.params.id);
  const sequence = $derived($sequences.find(s => s.id === id));

  function handleSave(name, seconds, sound, vibrate, repeats) {
    updateSequence(id, s => ({
      ...s,
      timers: [...s.timers, { id: uid(), name, seconds, sound, vibrate, repeats }]
    }));
    buzz();
    goto(`/sequence/${id}`);
  }
</script>


<div class="container" in:fade>
  
  <header>
    <a href="/sequence/{sequence.id}" class="back" aria-label="Back">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
    </a>
    <h1>New timer</h1>
  </header>

  <TimerEditor
    initialName={`Timer ${sequence.timers.length + 1}`}
    onSave={handleSave}
    onCancel={() => goto(`/sequence/${id}`)}
  />
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
</style>