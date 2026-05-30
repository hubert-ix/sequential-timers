<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { KeepAwake } from '@capacitor-community/keep-awake';
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
  let transitioning = $state(true);

  $effect(() => {
    if (running) {
      interval = window.setInterval(() => (remaining = remaining - 1), 1000);
      return () => { if (interval) clearInterval(interval); };
    }
  });

  $effect(async () => {
    if (activeIndex === null || !sequence) return;
    if (remaining <= 0) {
      const finished = sequence.timers[activeIndex];
      currentSound = playSound(finished?.sound ?? DEFAULT_SOUND, 3);
      completedIndices = new Set([...completedIndices, activeIndex]);
      const next = activeIndex + 1;
      if (next < sequence.timers.length) {
        activeIndex = next;
        remaining = sequence.timers[next].seconds;
        transitioning = false;
        requestAnimationFrame(() => requestAnimationFrame(() => (transitioning = true)));
      } 
      else {
        running = false;
        activeIndex = null;
        completedIndices = new Set();
        await KeepAwake.allowSleep();
      }
    }
  });

  async function startAll() {
    if (!sequence || sequence.timers.length === 0) return;
    completedIndices = new Set();
    activeIndex = 0;
    remaining = sequence.timers[0].seconds;
    running = true;
    await KeepAwake.keepAwake();
  }

  function pause() {
    running = false;
  }

  function resume() {
    running = true;
  }

  async function stop() {
    currentSound?.stop();
    currentSound = null;
    running = false;
    activeIndex = null;
    remaining = 0;
    completedIndices = new Set();
    await KeepAwake.allowSleep();
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
      {/if}
    </div>
  </div>

  {#if activeTimer}
    <div class="progress-controls">
      <button class="round ghost" onclick={stop}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square size-5" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>
      </button>

      {#if running}
        <button class="round primary big ring-btn" onclick={pause}>
          <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="ring-track" cx="50" cy="50" r="45"/>
            <circle class="ring-fill" cx="50" cy="50" r="45"
              stroke-dasharray={2 * Math.PI * 47}
              stroke-dashoffset={2 * Math.PI * 47 * (1 - progress)}
              style={transitioning ? '' : 'transition: none'}
            />
          </svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/>
          </svg>
        </button>
      {:else}
        <button class="round primary big ring-btn" onclick={resume}>
          <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="ring-track" cx="50" cy="50" r="46"/>
            <circle class="ring-fill" cx="50" cy="50" r="46"
              stroke-dasharray={2 * Math.PI * 46}
              stroke-dashoffset={2 * Math.PI * 46 * (1 - progress)}
            />
          </svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>
          </svg>
        </button>
      {/if}
      
      <button class="round ghost" onclick={skip}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward size-6" aria-hidden="true"><path d="M21 4v16"></path><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"></path></svg>
      </button>
    </div>
  {/if}
  
  {#if sequence.timers.length}
    <div class="timers" use:dndzone={{ items: sequence.timers, dragDisabled: !!activeTimer, flipDurationMs: 200, dropTargetStyle: {} }} onconsider={handleConsider} onfinalize={handleFinalize}>
      {#each sequence.timers as timer, i (timer.id)}
        <div class="timer" class:is-dragging={draggingId === timer.id} class:upcoming={activeTimer && i > activeIndex} class:current={activeIndex === i} class:completed={completedIndices.has(i)} use:longPressEnable={{ disabled: !!activeTimer, delay: 200, onLongPress: () => startDrag(timer.id), onRelease: () => { draggingId = null; }, onClick: () => {if (!activeTimer) {editedTimer = timer; editingTimer = true;}} }}>
          {#if draggingId === timer.id}
            <Move size="16" />
          {/if}
          {#if activeTimer}
            <div class="timer-number">
              {i + 1}
            </div>
          {/if}
          <div class="timer-name">
            {timer.name}
            {#if completedIndices.has(i)}
              <span class="timer-badge">Finished</span>
            {/if}
            <!--
            {#if activeIndex === i}
              <span class="timer-badge">Running</span>
            {/if}
            -->
          </div>
          <div class="timer-time">
            <!--
            {#if activeIndex === i}
              <div class="timer-circle">
                <ProgressRing progress={progress} size={24} stroke={4} />
              </div>
            {/if}
            -->
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
        <button class="primary" onclick={saveSequence}>Save sequence</button>
        <button class="ghost" onclick={() => (editingSequence = false)}>Cancel</button>
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
      <button class="danger" onclick={deleteSequenceNow}>Delete</button>
      <button class="ghost" onclick={() => {confirmDelete = false; editingSequence = false;}}>Cancel</button>
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
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .start-btn {
    background-color: var(--color-button);
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

  .timer-number {
    font-size: 12px;
    font-weight: 500;
    background: var(--color-box);
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
  }

  .timer-name {
    flex: 1;
    font-size: 1rem;
    font-weight: 400;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .timer-badge {
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    font-weight: 600;
    font-size: 10px;
    background-color: var(--color-button);
    padding: 0.25rem;
    border-radius: 0.5rem;
  }

  .completed .timer-badge {
    background-color: var(--color-box);
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
    background: none;
    padding: 0.5rem 1.25rem;
  }

  .timer.upcoming {
    background: none;
    padding: 0.5rem 1.25rem;
  }

  .timer.current .timer-number {
    background: var(--color-button);
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



  
.ring-btn {
  position: relative;
  border: none !important;
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}

.ring-track {
  fill: none;
  stroke: var(--color-button);
  stroke-width: 6;
}

.ring-fill {
  fill: none;
  stroke: var(--color-button-muted);
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}
</style>