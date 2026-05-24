<script>
  import { sequences } from '$lib/timers-store';
  import { formatTime, uid } from '$lib/timers-store';
  import { ArrowUpRight, Plus, Play, Timer as TimerIcon } from 'lucide-svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { longPressEnable } from '$lib/longPressDnd';
  import { goto } from '$app/navigation';

  let adding = $state(false);
  let newName = $state('');
  let dragDisabled = $state(true);

  function addSequence() {
    const name = newName.trim();
    if (!name) return;
    $sequences = [...$sequences, { id: uid(), name, timers: [] }];
    newName = '';
    adding = false;
  }

  function handleConsider(e) {
    $sequences = e.detail.items;
  }

  function handleFinalize(e) {
    $sequences = e.detail.items;
    dragDisabled = true;
  }

  function open(id) {
    goto(`/sequence/${id}`);
  }
</script>


<main>
  <div class="container lg">

    <header>
      <h1>Sequences</h1>
      <div class="add-sequence">
        <Plus size="20" />
      </div>
    </header>

    <ul class="row-list" use:dndzone={{ items: $sequences, dragDisabled, flipDurationMs: 200, dropTargetStyle: {} }} onconsider={handleConsider} onfinalize={handleFinalize}>
      {#each $sequences as sequence (sequence.id)}
        <li>
          <div class="sequence" use:longPressEnable={{ onEnable: () => { dragDisabled = false; }, onClick: () => open(sequence.id) }}>
            <div class="sequence-info">
              <div class="sequence-name">
                {sequence.name}
              </div>
              <div class="sequence-timers muted tabular">
                {#if sequence.timers.length === 0}
                  Empty sequence
                {:else}
                  {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} · {formatTime(sequence.timers.reduce((a, t) => a + t.seconds, 0))}
                {/if}
              </div>
            </div>
            <div class="arrow">
              <Play size={16} />
            </div>
          </div>
        </li>
      {/each}
    </ul>

    <div class="add-section">
      {#if adding}
        <div class="add-block">
          <input
            bind:value={newName}
            onkeydown={(e) => { if (e.key === 'Enter') addSequence(); if (e.key === 'Escape') { adding = false; newName = ''; } }}
            placeholder="Sequence name"
            class="add-input"
            autofocus
          />
          <button class="btn btn-primary" onclick={addSequence}>Create</button>
          <button class="btn cancel" onclick={() => { adding = false; newName = ''; }}>Cancel</button>
        </div>
      {:else}
        <button class="add-btn" onclick={() => { adding = true; }}>
          <Plus size={16} /> New sequence
        </button>
      {/if}
    </div>

  </div>
</main>


<style>
  header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: solid 1px rgb(229, 231, 235);
  }

  .add-sequence {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(79, 70, 229);
    transition: all 0.2s;
    color: #fff;
  }

  .sequence {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 0px 0px;
    background-color: rgb(255, 255, 255);
    border: solid 1px var(--border);
    border-radius: 1rem;
  }

  .sequence .arrow {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(79, 70, 229);
    transition: all 0.2s;
    color: #fff;
  }

  .sequence-info {
    min-width: 0; 
    flex: 1;
  }

  .sequence-name {
    font-weight: 600; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    white-space: nowrap;
  }

  .sequence-timers {
    font-size: .875rem;
  }

  .add-section {
    margin-top: 1.25rem;
  }

  .add-block {
    padding: .5rem; 
    gap: .5rem;
  }

  .add-input {
    flex: 1; 
    background: transparent; 
    border: 0; 
    outline: none; 
    padding: .625rem .75rem; 
    font-size: 1rem;
  }

  .btn.cancel {
    color: var(--muted-foreground);
  }
</style>