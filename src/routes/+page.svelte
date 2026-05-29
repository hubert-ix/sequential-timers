<script>
  import { sequences } from '$lib/stores/timers-store';
  import { formatTime, uid } from '$lib/stores/timers-store';
  import { Move, Settings } from 'lucide-svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { longPressEnable } from '$lib/longPressDnd';
  import { goto } from '$app/navigation';
  import NoResults from '$lib/NoResults.svelte';
  import Modal from '$lib/Modal.svelte';

  let addingSequence = $state(false);
  let newName = $state('');
  let draggingId = $state(null);

  function addSequence() {
    const name = newName.trim();
    if (!name) return;
    let newSequence = { id: uid(), name, timers: [] };
    $sequences = [...$sequences, newSequence];
    newName = '';
    addingSequence = false;
    goto("/sequence/" + newSequence.id);
  }

  function handleConsider(e) {
    $sequences = e.detail.items;
  }

  function handleFinalize(e) {
    $sequences = e.detail.items;
    draggingId = null;
  }

  function startDrag(id) {
    draggingId = id;
  }

  function open(id) {
    goto(`/sequence/${id}`);
  }
</script>


<div class="container">

  <div class="header">
    <h1>Your sequences</h1>
    <a href="/settings" class="settings">
      <Settings size="24" />
    </a>
  </div>

  {#if $sequences.length}
    <div
      class="sequences"
      use:dndzone={{ items: $sequences, dragDisabled: false, flipDurationMs: 200, dropTargetStyle: {} }}
      onconsider={handleConsider}
      onfinalize={handleFinalize}
      >
      {#each $sequences as sequence (sequence.id)}
        <div class="sequence" class:is-dragging={draggingId === sequence.id} use:longPressEnable={{ delay: 300, onLongPress: () => startDrag(sequence.id), onRelease: () => { draggingId = null; }, onClick: () => open(sequence.id) }}>
          {#if draggingId == sequence.id}
            <Move size="16" />
          {/if}
          <div class="sequence-info">
            <div class="sequence-name">{sequence.name}</div>
            <div class="sequence-timers">
              {#if sequence.timers.length === 0}
                Empty sequence
              {:else}
                {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} · {formatTime(sequence.timers.reduce((a, t) => a + t.seconds, 0))}
              {/if}
            </div>
          </div>
          <div class="sequence-arrow">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 2l10 6-10 6V2z"></path></svg>
          </div>
        </div>
      {/each}
    </div>
    {#if $sequences.length > 1}
    <div class="hint right">
      Long-press to reorder
    </div>
  {/if}
  {:else}
    <NoResults heading="No sequences yet" text="Create a new awesome sequence!" />
  {/if}

  <button class="add" onclick={ () => { addingSequence = true; }}>
    <div class="round-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus size-5" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    </div>
    <div class="label">
      Add sequence
    </div>
  </button>

</div>

{#if addingSequence}
  <Modal>
    <input bind:value={newName} placeholder="Sequence name" id="add-input" class="text" onkeydown={(e) => { if (e.key === 'Enter') addSequence(); if (e.key === 'Escape') { addingSequence = false; newName = ''; }}} />
    <div class="actions">
      <button class="btn primary" onclick={addSequence}>Create</button>
      <button class="btn ghost" onclick={() => { addingSequence = false; newName = ''; }}>Cancel</button>
    </div>
  </Modal>
{/if}


<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    margin-left: 1rem;
  }

  .header h1 {
    margin: 0;
  }

  a.settings {
    color: var(--color-text-muted);
  }

  .sequences {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sequence {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    cursor: pointer;
    background-color: var(--color-box);
    border-radius: 1.5rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
    /* Prevent text selection during long press */
    user-select: none;
    -webkit-user-select: none;
  }

  .sequence.is-dragging {
    background-color: color-mix(in oklab, var(--color-button) 30%, white);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: scale(1.02);
    cursor: grabbing;
    opacity: 1 !important;
    z-index: 10;
  }

  .sequence-arrow {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-arrow);
    transition: all 0.2s;
    color: #000;
  }

  .sequence-arrow svg {
    width: 1rem;
    height: 1rem;
    position: relative;
    left: 2px;
  }

  .sequence-info {
    min-width: 0;
    flex: 1;
  }

  .sequence-name {
    font-size: 17px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text);
  }

  .sequence-timers {
    font-size: .875rem;
    margin-top: 0.25rem;
    color: var(--color-text-muted);
  }
</style>