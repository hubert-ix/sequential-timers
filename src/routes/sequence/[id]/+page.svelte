<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sequences, updateSequence, removeSequence, formatTime, uid } from '$lib/stores/timers-store';
  import { DEFAULT_SOUND, playSound } from '$lib/sounds';
  import { Trash2, Move, Play, Pause, Square, SkipForward } from 'lucide-svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { longPressEnable } from '$lib/longPressDnd';
  import ProgressRing from '$lib/ProgressRing.svelte';
  import Modal from '$lib/Modal.svelte';
  import TimerEditor from '$lib/TimerEditor.svelte';
  import NoResults from '$lib/NoResults.svelte';

  const id = $derived($page.params.id);
  const sequence = $derived($sequences.find((s) => s.id === id));

  let nameDraft = $state('');
  let confirmDelete = $state(false);
  let addingNewTimer = $state(false);
  let editingSequence = $state(false);
  let editingTimer = $state(false);
  let editedTimer = $state();
  let editingTimerId = $state(null);
  let activeIndex = $state(null);
  let remaining = $state(0);
  let running = $state(false);
  let interval = $state(null);
  let completedIndices = $state(new Set());
  let draggingId = $state(null);
  let currentSound = $state(null);

  $effect(() => {
    if (running) {
      interval = window.setInterval(() => (remaining = remaining - 1), 1000);
      return () => { if (interval) clearInterval(interval); };
    }
  });

  $effect(() => {
    if (activeIndex === null || !sequence) return;
    if (remaining <= 0) {
      const finished = sequence.timers[activeIndex];
      currentSound = playSound(finished?.sound ?? DEFAULT_SOUND, 3);
      completedIndices = new Set([...completedIndices, activeIndex]);
      const next = activeIndex + 1;
      if (next < sequence.timers.length) {
        activeIndex = next;
        remaining = sequence.timers[next].seconds;
      } 
      else {
        running = false;
        activeIndex = null;
        completedIndices = new Set();
      }
    }
  });

  function startAll() {
    if (!sequence || sequence.timers.length === 0) return;
    completedIndices = new Set();
    activeIndex = 0;
    remaining = sequence.timers[0].seconds;
    running = true;
  }

  function pause() {
    running = false;
  }

  function resume() {
    running = true;
  }

  function stop() {
    currentSound?.stop();
    currentSound = null;
    running = false;
    activeIndex = null;
    remaining = 0;
    completedIndices = new Set();
  }

  function skip() {
    if (activeIndex === null || !sequence) return;
    currentSound?.stop();
    currentSound = null;
    const next = activeIndex + 1;
    if (next < sequence.timers.length) {
      completedIndices = new Set([...completedIndices, activeIndex]);
      activeIndex = next;
      remaining = sequence.timers[next].seconds;
    } 
    else {
      running = false;
      activeIndex = null;
      completedIndices = new Set();
    }
  }

  function addTimer(name, seconds, sound) {
    if (!sequence) return;
    const t = {
      id: uid(),
      name: name.trim() || `Timer ${sequence.timers.length + 1}`,
      seconds,
      sound
    };
    updateSequence(sequence.id, (s) => ({
      ...s,
      timers: [...s.timers, t]
    }));
  }

  function updateTimer(tid, patch) {
    if (!sequence) return;
    updateSequence(sequence.id, (s) => ({
      ...s,
      timers: s.timers.map((t) =>
        t.id === tid ? { ...t, ...patch } : t
      )
    }));
  }

  function removeTimer(tid) {
    if (!sequence) return;
    updateSequence(sequence.id, (s) => ({
      ...s,
      timers: s.timers.filter((t) => t.id !== tid)
    }));
  }

  function openTimer(id) {
    if (!activeTimer) {
      editingTimerId = id; 
    }
  }

  function deleteSequenceNow() {
    if (!sequence) return;
    removeSequence(sequence.id);
    goto('/');
  }

  function saveSequence() {
    if (!sequence) return;
    const v = nameDraft.trim();
    if (v && v !== sequence.name) {
      updateSequence(sequence.id, (s) => ({ ...s, name: v }));
    }
    editingSequence = false;
  }

  function startDrag(id) {
    draggingId = id;
  }

  function handleConsider(e) {
    if (!sequence) return;
    updateSequence(sequence.id, (s) => ({
      ...s,
      timers: e.detail.items
    }));
  }

  function handleFinalize(e) {
    if (!sequence) return;
    updateSequence(sequence.id, (s) => ({
      ...s,
      timers: e.detail.items
    }));
    draggingId = null;
  }

  const total = $derived(
    sequence ? sequence.timers.reduce((a, t) => a + t.seconds, 0) : 0
  );

  const activeTimer = $derived(
    sequence && activeIndex !== null ? sequence.timers[activeIndex] : null
  );

  const progress = $derived(
    activeTimer ? 1 - remaining / activeTimer.seconds : 0
  );
</script>


<div class="container">

  <header>
    <a href="/" class="back" aria-label="Back">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
    </a>
  </header>

  <div class="heading">
    <div class="left">
      <h2>
        {sequence.name}
        {#if !activeTimer}
          <div class="edit-icon" onclick={() => { nameDraft = sequence.name; editingSequence = true;  }}>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
          </div>
        {/if}
      </h2>
      <div class="subtitle">
        {#if activeTimer}
          {formatTime(sequence.timers.slice(activeIndex).reduce((a, t, i) => a + (i === 0 ? remaining : t.seconds), 0))} remaining
        {:else}
          {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} · {formatTime(total)} total
        {/if}
      </div>
    </div>
    <div class="right">
      {#if !activeTimer}
        {#if sequence.timers.length}
          <button class="start-btn" onclick={startAll} disabled={sequence.timers.length === 0}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2l10 6-10 6V2z"></path></svg>
          </button>
        {/if}
      {:else}
        <!--<ProgressRing progress={progress} size={60} stroke={6} />-->
      {/if}
    </div>
  </div>

  {#if activeTimer}
    <div class="progress-controls">
      {#if running}
        <button class="primary" onclick={pause}><Pause size={16} /> Pause</button>
      {:else}
        <button class="primary" onclick={resume}><Play size={16} /> Resume</button>
      {/if}
      <button class="ghost" onclick={stop}><Square size={16} /> Stop</button>
      <button class="ghost" onclick={skip}><SkipForward size={16} /> Skip</button>
    </div>
  {/if}
  
  {#if sequence.timers.length}
    <div class="timers" use:dndzone={{ items: sequence.timers, dragDisabled: !!activeTimer, flipDurationMs: 200, dropTargetStyle: {} }} onconsider={handleConsider} onfinalize={handleFinalize}>
      {#each sequence.timers as timer, i (timer.id)}
        <div class="timer" class:is-dragging={draggingId === timer.id} class:current={activeIndex === i} class:completed={completedIndices.has(i)} use:longPressEnable={{ disabled: !!activeTimer, delay: 200, onLongPress: () => startDrag(timer.id), onRelease: () => { draggingId = null; }, onClick: () => {if (!activeTimer) {editedTimer = timer; editingTimer = true;}} }}>
          {#if draggingId === timer.id}
            <Move size="16" />
          {/if}
          <div class="timer-name">
            {timer.name}
          </div>
          <div class="timer-time">
            {#if activeIndex === i}
              <div class="timer-circle">
                <ProgressRing progress={progress} size={24} stroke={4} />
              </div>
            {/if}
            {activeIndex === i ? formatTime(Math.max(0, remaining)) : formatTime(timer.seconds)}
          </div>
        </div>
      {/each}
    </div>
    {#if sequence.timers.length > 1 && !activeTimer}
      <div class="hint right">
        Long-press to reorder
      </div>
    {/if}
  {:else}
    <NoResults heading="No timers yet" text="Add timers to build your sequence" />
  {/if}

  {#if !activeTimer}
    <button class="add" onclick={ () => { addingNewTimer = true; }}>
      <div class="round-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus size-5" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
      </div>
      <div class="label">
        Add timer
      </div>
    </button>
  {/if}

</div>

{#if editingSequence}
  <Modal close={() => (editingSequence = false)}>
    <input class="text" autofocus bind:value={nameDraft} />
    <div class="yo">
      <div class="actions">
        <button class="btn primary" onclick={saveSequence}>Save sequence</button>
        <button class="btn ghost" onclick={() => (editingSequence = false)}>Cancel</button>
      </div>
      <button class="icon ghost" onclick={() => (confirmDelete = true)} aria-label="Delete sequence">
        <Trash2 size={16} />
      </button>
    </div>
  </Modal>
{/if}

{#if confirmDelete}
  <Modal close={() => (confirmDelete = false)}>
    <h3>Delete this sequence?</h3>
    <p class="muted text-small">"{sequence.name}" and its {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} will be permanently removed.</p>
    <div class="actions">
      <button class="btn danger" onclick={deleteSequenceNow}>Delete</button>
      <button class="btn ghost" onclick={() => {confirmDelete = false; editingSequence = false;}}>Cancel</button>
    </div>
  </Modal>
{/if}

{#if addingNewTimer}
  <Modal close={() => (addingNewTimer = false)}>
    <TimerEditor
      initialName={`Timer ${sequence.timers.length + 1}`}
      initialSeconds={60}
      initialSound={DEFAULT_SOUND}
      showBorder={false}
      onSave={(name, seconds, sound) => { addTimer(name, seconds, sound); addingNewTimer = false; }}
      onCancel={() => (addingNewTimer = false)}
    />
  </Modal>
{/if}

{#if editingTimer}
  <Modal close={() => (editingTimer = false)}>
    <TimerEditor
      initialName={editedTimer.name}
      initialSeconds={editedTimer.seconds}
      initialSound={editedTimer.sound ?? DEFAULT_SOUND}
      showBorder={false}
      onSave={(name, seconds, sound) => { updateTimer(editedTimer.id, { name, seconds, sound }); editingTimerId = null; editingTimer = false; }}
      onCancel={(e) => {e.stopPropagation(); editingTimerId = null; editingTimer = false;}}
      onRemove={(e) => {e.stopPropagation(); removeTimer(editedTimer.id); editingTimerId = null; editingTimer = false; }}
    />
  </Modal>
{/if}


<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    margin-left: 1rem;
  }

  .back {
    color: var(--color-text);
  }

  .back svg {
    width: 24px;
  }

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    margin-left: 1rem;
  }

  .subtitle {
    color: var(--color-text-muted);
  }

  .progress-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .start-btn {
    background-color: var(--color-arrow);
    width: 4rem;
    height: 4rem;
    border: none;
    border-radius: 100%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .start-btn svg {
    width: 2rem;
    height: 2rem;
    position: relative;
    left: 2px;
  }

  .timers {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .timer-name {
    flex: 1;
    font-size: 1rem;
    font-weight: 500;
    color: var(color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .timer-time {
    font-weight: 500;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .current .timer-time {
    font-size: 1.25rem;
    color: var(--color-text);
  }

  .timer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    background-color: var(--color-box);
    border-radius: 1.5rem;
    user-select: none;
    -webkit-user-select: none;
  }

  .timer.is-dragging {
    background-color: color-mix(in oklab, var(--color-button) 30%, white);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: scale(1.02);
    cursor: grabbing;
    opacity: 1 !important;
    z-index: 10;
  }

  .timer.current {
    background: var(--color-button-muted);
  }

  .timer.completed {
    opacity: 0.5;
  }

  .edit-icon {
    cursor: pointer;
    color: #b6b6b6;
    position: relative;
    top: 2px;
  }

  .edit-icon svg {
    width: 20px;
  }

  .yo {
    display: flex;
    justify-content: space-between;
  }
</style>