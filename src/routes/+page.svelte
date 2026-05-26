<script>
  import { tick } from 'svelte';
  import { sequences } from '$lib/timers-store';
  import { formatTime, uid } from '$lib/timers-store';
  import { Plus, Play } from 'lucide-svelte';
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
  <h1>Your sequences</h1>

  {#if $sequences.length}
    <div
      class="sequences"
      use:dndzone={{ items: $sequences, dragDisabled: false, flipDurationMs: 200, dropTargetStyle: {} }}
      onconsider={handleConsider}
      onfinalize={handleFinalize}
      >
      {#each $sequences as sequence (sequence.id)}
        <div class="sequence" class:is-dragging={draggingId === sequence.id} use:longPressEnable={{ delay: 200, onLongPress: () => startDrag(sequence.id), onClick: () => open(sequence.id) }}>
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
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2l10 6-10 6V2z"></path></svg>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <NoResults heading="No sequences yet" text="Create a new awesome sequence!" />
  {/if}

  <button class="add" onclick={async () => { addingSequence = true; await tick(); document.getElementById("add-input").focus() }}>
    <Plus size="20" /> New sequence
  </button>
</div>

{#if addingSequence}
  <Modal>
    <input bind:value={newName} placeholder="Sequence name" id="add-input" class="text" autofocus onkeydown={(e) => { if (e.key === 'Enter') addSequence(); if (e.key === 'Escape') { addingSequence = false; newName = ''; }}} />
    <div class="actions">
      <button class="btn primary" onclick={addSequence}>Create</button>
      <button class="btn ghost" onclick={() => { addingSequence = false; newName = ''; }}>Cancel</button>
    </div>
  </Modal>
{/if}


<style>
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
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    outline: 1px solid rgba(0, 0, 0, 0.05);
    outline-offset: -1px;
    background-color: #fff;
    border: solid 1px var(--border);
    border-radius: 1rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
    /* Prevent text selection during long press */
    user-select: none;
    -webkit-user-select: none;
  }

  .sequence.is-dragging {
    background-color: color-mix(in oklab, var(--play) 30%, white);
    border-color: var(--play);
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
    background: var(--play);
    transition: all 0.2s;
    color: #424632;
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
    font-size: 1rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #424632;
  }

  .sequence-timers {
    font-size: .875rem;
    margin-top: 0.25rem;
    color: color-mix(in oklab, #424632 60%, transparent);
  }

  .add {
    margin-top: 1rem;
  }
</style>