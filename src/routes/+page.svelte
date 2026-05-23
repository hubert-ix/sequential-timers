<script>
  import { sequences } from '$lib/timers-store';
  import { formatTime, uid } from '$lib/timers-store';
  import { ArrowUpRight, Plus, Timer as TimerIcon } from 'lucide-svelte';
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
      <h1>Sequential timers</h1>
      <p class="subtitle muted">
        Chain timers into seamless routines. Tap a sequence to run it.
      </p>
    </header>

    <ul class="row-list" use:dndzone={{ items: $sequences, dragDisabled, flipDurationMs: 200, dropTargetStyle: {} }} onconsider={handleConsider} onfinalize={handleFinalize}>
      {#each $sequences as sequence (sequence.id)}
        <li>
          <div class="glass glass-hover sequence" use:longPressEnable={{ onEnable: () => { dragDisabled = false; }, onClick: () => open(sequence.id) }}>
            <span class="badge"><TimerIcon size={20} /></span>
            <div class="sequence-info">
              <div class="sequence-name">{sequence.name}</div>
              <div class="sequence-timers muted tabular">
                {#if sequence.timers.length === 0}
                  Empty sequence
                {:else}
                  {sequence.timers.length} step{sequence.timers.length === 1 ? '' : 's'} · {formatTime(sequence.timers.reduce((a, t) => a + t.seconds, 0))}
                {/if}
              </div>
            </div>
            <span class="arrow"><ArrowUpRight size={16} /></span>
          </div>
        </li>
      {/each}
    </ul>

    <div class="add-section">
      {#if adding}
        <div class="glass row add-block">
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
        <button class="glass glass-hover add-btn" onclick={() => { adding = true; }}>
          <Plus size={16} /> New sequence
        </button>
      {/if}
    </div>

  </div>
</main>


<style>
  header {
    margin-bottom: 3rem;
  }

  .subtitle {
    font-size: .875rem; 
    max-width: 28rem; 
    margin-top: .75rem;
  }

  .sequence {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    cursor: pointer;
  }

  .sequence .badge {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    color: var(--primary-foreground);
    box-shadow: var(--shadow-glow);
    flex-shrink: 0;
  }

  .sequence .arrow {
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: oklch(0.35 0.04 60 / 0.06);
    color: var(--muted-foreground);
    transition: all 0.2s;
  }

  .sequence:hover .arrow {
    background: oklch(0.58 0.055 235 / 0.2);
    color: var(--foreground);
    transform: rotate(45deg);
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