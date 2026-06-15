<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { buzz } from '$lib/functions/helpers';
  import { sequences, updateSequence } from '$lib/stores/timers-store';
  import { DEFAULT_SOUND } from '$lib/functions/sounds';
  import TimerEditor from '$lib/TimerEditor.svelte';
  import Modal from '$lib/Modal.svelte';

  const id = $derived($page.params.id);
  const timerId = $derived($page.params.timer_id);
  const sequence = $derived($sequences.find(s => s.id === id));
  const timer = $derived(sequence?.timers.find(t => t.id === timerId));
  let showDeleteModal = $state(false);

  function handleSave(name, seconds, sound, vibrate, repeats) {
    updateSequence(id, s => ({
      ...s,
      timers: s.timers.map(t => t.id === timerId ? { ...t, name, seconds, sound, vibrate, repeats } : t)
    }));
    goto(`/sequence/${id}`);
  }

  function deleteTimer() {
    showDeleteModal = false;
    updateSequence(id, s => ({
      ...s,
      timers: s.timers.filter(t => t.id !== timerId)
    }));
    goto(`/sequence/${id}`);
  }
</script>


<div class="container" in:fade>

  <header>
    <div class="row">
    <a href="/sequence/{sequence.id}" class="back" aria-label="Back" onclick={buzz}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
    </a>
    <h1>Edit timer</h1>
    </div>
    <button class="icon ghost bounce delete" onclick={() => showDeleteModal = true} aria-label="Delete timer">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 lucide-trash-2 size-5" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    </button>
  </header>

  {#if timer}
    <TimerEditor
      initialName={timer.name}
      initialSeconds={timer.seconds}
      initialSound={timer.sound ?? DEFAULT_SOUND}
      initialVibrate={timer.vibrate ?? false}
      initialRepeats={timer.repeats ?? 1}
      showBorder={false}
      onSave={handleSave}
      onCancel={() => goto(`/sequence/${id}`)}
    />
  {/if}
</div>

{#if showDeleteModal}
  <Modal close={() => (showDeleteModal = false)}>
    <h3>Delete this timer?</h3>
    <div class="actions">
      <button class="danger bounce" onclick={deleteTimer}>Delete</button>
      <button class="ghost bounce" onclick={() => showDeleteModal = false}>Cancel</button>
    </div>
  </Modal>
{/if}


<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  .delete svg {
    width: 16px;
  }
</style>