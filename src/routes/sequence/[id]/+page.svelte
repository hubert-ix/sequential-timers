<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
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

  let editingName = $state(false);
  let nameDraft = $state('');
  let confirmDelete = $state(false);
  let addingNew = $state(false);
  let editingTimerId = $state(null);
  let dragDisabled = $state(true);
  let activeIdx = $state(null);
  let remaining = $state(0);
  let running = $state(false);
  let interval = $state(null);

  $effect(() => {
    if (running) {
      interval = window.setInterval(() => (remaining = remaining - 1), 1000);
      return () => { if (interval) clearInterval(interval); };
    }
  });

  $effect(() => {
    if (activeIdx === null || !sequence) return;
    if (remaining <= 0) {
      const finished = sequence.timers[activeIdx];
      playSound(finished?.sound ?? DEFAULT_SOUND);
      const next = activeIdx + 1;
      if (next < sequence.timers.length) {
        activeIdx = next;
        remaining = sequence.timers[next].seconds;
      } 
      else {
        running = false;
        activeIdx = null;
      }
    }
  });

  function startAll() {
    if (!sequence || sequence.timers.length === 0) return;
    activeIdx = 0;
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
    activeIdx = null;
    remaining = 0;
  }

  function skip() {
    if (activeIdx === null || !sequence) return;
    const next = activeIdx + 1;
    if (next < sequence.timers.length) {
      activeIdx = next;
      remaining = sequence.timers[next].seconds;
    } 
    else {
      running = false;
      activeIdx = null;
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

  function commitName() {
    if (!sequence) return;
    const v = nameDraft.trim();
    if (v && v !== sequence.name) {
      updateSequence(sequence.id, (s) => ({ ...s, name: v }));
    }
    editingName = false;
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
    sequence && activeIdx !== null ? sequence.timers[activeIdx] : null
  );

  const progress = $derived(
    activeTimer ? 1 - remaining / activeTimer.seconds : 0
  );
</script>


<main>
  <div class="container">

    {#if !activeTimer}
      <header>
        <a href="/" class="back" aria-label="Back">
          <ArrowLeft size="25" />
        </a>
        <button class="icon" onclick={() => (confirmDelete = true)} aria-label="Delete sequence">
          <Trash2 size={16} />
        </button>
      </header>
    {/if}

    <div class="heading">
      {#if editingName}
        <input class="input-bare" autofocus bind:value={nameDraft} onblur={commitName} onkeydown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') editingName = false; }} />
      {:else}
        <h2>
          {sequence.name}
          {#if !activeTimer}
            <div class="edit-icon">
              <Pen size="15" onclick={() => { nameDraft = sequence.name; editingName = true;  }} />
            </div>
          {/if}
        </h2>
      {/if}
    </div>
    
    <p class="muted tabular meta-line">
      {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} · {formatTime(total)} total
    </p>

    {#if sequence.timers.length}

      {#if activeIdx !== null && activeTimer}
        <div class="stage fade-in">
          <ProgressRing progress={progress} size={260} stroke={6}>
            {#snippet children()}
              <div class="time">{formatTime(Math.max(0, remaining))}</div>
              <div class="name">{activeTimer.name}</div>
            {/snippet}
          </ProgressRing>
          <div class="row stage-controls">
            {#if running}
              <button class="btn primary" onclick={pause}><Pause size={16} /> Pause</button>
            {:else}
              <button class="btn primary" onclick={resume}><Play size={16} /> Resume</button>
            {/if}
            <button class="btn" onclick={stop}><Square size={16} /> Stop</button>
            <button class="btn" onclick={skip}><SkipForward size={16} /> Skip</button>
          </div>
        </div>
      {:else}
        <div class="start-wrap">
          <button class="start-btn" onclick={startAll} disabled={sequence.timers.length === 0}>
            <Play size={20} />
          </button>
        </div>
      {/if}

      <ul class="row-list" use:dndzone={{ items: sequence.timers, dragDisabled, flipDurationMs: 200, dropTargetStyle: {} }} onconsider={handleConsider} onfinalize={handleFinalize}>
        {#each sequence.timers as t, i (t.id)}
          <li>
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
              <div class="timer {activeIdx === i ? 'active' : ''}" use:longPressEnable={{ onEnable: () => { dragDisabled = false; }, onClick: () => { editingTimerId = t.id; } }}>
                <span class="num">
                  {String(i + 1)}
                </span>
                <div class="timer-name">
                  {t.name}
                </div>
                <div class="tabular timer-time">
                  {formatTime(t.seconds)}
                </div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <NoResults heading="No timers yet" text="Add timers to build your sequence" />
    {/if}

    {#if !activeTimer}
      <footer>
        <button class="add" onclick={() => (addingNew = true)}>
          <Plus size={20} /> New timer
        </button>
      </footer>
    {/if}

  </div>

  {#if confirmDelete}
    <Modal close={() => (confirmDelete = false)}>
      <h3>Delete this sequence?</h3>
      <p class="muted text-small">"{sequence.name}" and its {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} will be permanently removed.</p>
      <div class="actions">
        <button class="btn btn-ghost" onclick={() => (confirmDelete = false)}>Cancel</button>
        <button class="btn btn-danger" onclick={deleteSequenceNow}>Delete</button>
      </div>
    </Modal>
  {/if}

  {#if addingNew}
    <Modal close={() => (addingNew = false)}>
      <TimerEditor
        initialName={`Timer ${sequence.timers.length + 1}`}
        initialSeconds={60}
        initialSound={DEFAULT_SOUND}
        showBorder={false}
        onSave={(name, seconds, sound) => { addTimer(name, seconds, sound); addingNew = false; }}
        onCancel={() => (addingNew = false)}
      />
    </Modal>
  {/if}

</main>


<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .back {
    color: var(--primary);
  }

  .meta-line {
    font-size: .875rem;
    margin: 0 0 2.5rem;
  }

  .stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .stage-controls {
    gap: .75rem;
    margin-top: 2rem;
  }

  .start-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .start-btn {
    background-color: rgb(79, 70, 229);
    width: 4rem;
    height: 4rem;
    border-radius: 100%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timer-name {
    flex: 1;
    min-width: 0;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .timer-time {
    font-weight: 500;
  }

  .add-wrap {
    margin-top: 1rem;
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

  .timer.active {
    border-color: #ccc;
  }

  .timer .num {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgb(237, 237, 248);
    color: var(--muted);
  }

  .timer.active .num {
    background: var(--primary);
    color: #fff;
  }

  .input-bare {
    width: 100%;
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #000;
    margin-bottom: 0.25rem;
  }

  .edit-icon {
    cursor: pointer;
  }
</style>