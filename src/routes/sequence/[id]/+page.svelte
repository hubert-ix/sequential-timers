<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { sequences, updateSequence, removeSequence, formatTime, uid } from '$lib/timers-store';
  import { DEFAULT_SOUND, playSound } from '$lib/sounds';
  import { ArrowLeft, Trash2, Plus, Play, Pause, Square, SkipForward, Timer as TimerIcon, Edit, Pen  } from 'lucide-svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { longPressEnable } from '$lib/longPressDnd';
  import Modal from '$lib/Modal.svelte';
  import TimerEditor from '$lib/TimerEditor.svelte';
  import ProgressRing from '$lib/ProgressRing.svelte';
  import NoResults from '$lib/NoResults.svelte';

  const id = $derived($page.params.id);
  const sequence = $derived($sequences.find((s) => s.id === id));

  let nameDraft = $state('');
  let confirmDelete = $state(false);
  let addingNewTimer = $state(false);
  let editingTimerId = $state(null);
  let editingSequence = $state(false);
  let dragDisabled = $state(true);
  let activeIndex = $state(null);
  let remaining = $state(0);
  let running = $state(false);
  let interval = $state(null);
  let completedIndices = $state(new Set());

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
      playSound(finished?.sound ?? DEFAULT_SOUND, 3);
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
    running = false;
    activeIndex = null;
    remaining = 0;
    completedIndices = new Set();
  }

  function skip() {
    if (activeIndex === null || !sequence) return;
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
    dragDisabled = true;
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

  {#if !activeTimer}
    <header>
      <a href="/" class="back" aria-label="Back">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
      </a>
    </header>
  {/if}

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
        {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} · {formatTime(total)} total
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
        <div class="row progress-controls">
          {#if running}
            <button class="btn primary" onclick={pause}><Pause size={16} /> Pause</button>
          {:else}
            <button class="btn primary" onclick={resume}><Play size={16} /> Resume</button>
          {/if}
          <button class="btn" onclick={stop}><Square size={16} /> Stop</button>
          <button class="btn" onclick={skip}><SkipForward size={16} /> Skip</button>
        </div>
      {/if}
    </div>
  </div>
  
  {#if sequence.timers.length}

      <!--
      <ProgressRing progress={progress} size={260} stroke={6}>
        {#snippet children()}
          <div class="time">{formatTime(Math.max(0, remaining))}</div>
          <div class="name">{activeTimer.name}</div>
        {/snippet}
      </ProgressRing>
      -->

    <div class="timers" use:dndzone={{ items: sequence.timers, dragDisabled, flipDurationMs: 200, dropTargetStyle: {} }} onconsider={handleConsider} onfinalize={handleFinalize}>
      {#each sequence.timers as t, i (t.id)}
        {#if editingTimerId === t.id}
          <TimerEditor
            initialName={t.name}
            initialSeconds={t.seconds}
            initialSound={t.sound ?? DEFAULT_SOUND}
            onSave={(name, seconds, sound) => { updateTimer(t.id, { name, seconds, sound }); editingTimerId = null; }}
            onCancel={() => (editingTimerId = null)}
            onRemove={() => { removeTimer(t.id); editingTimerId = null; }}
          />
        {:else}
          <div class="timer {activeIndex === i ? 'current' : ''} {completedIndices.has(i) ? 'completed' : ''}" use:longPressEnable={{ onEnable: () => { dragDisabled = false; }, onClick: async () => { editingTimerId = t.id; await tick(); document.getElementById("add-input").focus() } }}>
            <div class="timer-name">
              {t.name}
            </div>
            <div class="timer-time">
              {activeIndex === i ? formatTime(Math.max(0, remaining)) : formatTime(t.seconds)}
            </div>
          </div>
        {/if}
      {/each}
      </div>
  {:else}
    <NoResults heading="No timers yet" text="Add timers to build your sequence" />
  {/if}

  {#if !activeTimer}
    <button class="add add-wrap" onclick={async () => {addingNewTimer = true; await tick(); document.getElementById("add-input").focus()}}>
      <Plus size={20} /> New timer
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
      <button class="btn ghost" onclick={() => (confirmDelete = false)}>Cancel</button>
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


<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .back {
    color: #000;
  }

  .back svg {
    width: 24px;
  }

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .subtitle {
    color: color-mix(in oklab, #424632 60%, transparent);
  }

  .progress-controls {
    gap: .75rem;
  }

  .start-btn {
    background-color: var(--play);
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
    color: #424632;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .timer-time {
    font-weight: 500;
  }

  .add-wrap {
    margin-top: 0.75rem;
  }

  .timer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    touch-action: manipulation;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 0px 0px;
    background-color: rgb(255, 255, 255);
    border: solid 1px var(--border);
    border-radius: 1rem;
  }

  .timer.current {
    border: #ffcaab solid 1px;
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