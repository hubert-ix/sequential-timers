<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sequences, updateSequence, removeSequence, formatTime, uid } from '$lib/timers-store';
  import { DEFAULT_SOUND, playSound } from '$lib/sounds';
  import { ArrowLeft, Trash2, Plus, Play, Pause, Square, SkipForward } from 'lucide-svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { longPressEnable } from '$lib/longPressDnd';
  import TimerEditor from '$lib/TimerEditor.svelte';
  import ProgressRing from '$lib/ProgressRing.svelte';

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

    <div class="row fade-in row-spaced">
      <a href="/" class="glass glass-hover icon-btn" aria-label="Back"><ArrowLeft size={16} /></a>
      <div class="flex-1-min0">
        {#if editingName}
          <input
            class="input-bare"
            bind:value={nameDraft}
            onblur={commitName}
            onkeydown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') editingName = false; }}
          />
        {:else}
          <h1 class="h2 editable-title"
              onclick={() => { nameDraft = sequence.name; editingName = true; }}>
            {sequence.name}
          </h1>
        {/if}
      </div>
      <button class="glass glass-hover icon-btn danger" onclick={() => (confirmDelete = true)} aria-label="Delete sequence">
        <Trash2 size={16} />
      </button>
    </div>
    
    <p class="muted tabular meta-line">
      {sequence.timers.length} step{sequence.timers.length === 1 ? '' : 's'} · {formatTime(total)} total
    </p>

    {#if activeIdx !== null && activeTimer}
      <div class="stage fade-in">
        <ProgressRing progress={progress} size={260} stroke={6}>
          {#snippet children()}
            <div class="label">Step {activeIdx + 1} / {sequence.timers.length}</div>
            <div class="time">{formatTime(Math.max(0, remaining))}</div>
            <div class="name">{activeTimer.name}</div>
          {/snippet}
        </ProgressRing>
        <div class="row stage-controls">
          {#if running}
            <button class="btn btn-primary" onclick={pause}><Pause size={16} /> Pause</button>
          {:else}
            <button class="btn btn-primary" onclick={resume}><Play size={16} /> Resume</button>
          {/if}
          <button class="glass glass-hover btn" onclick={stop}><Square size={16} /> Stop</button>
          <button class="glass glass-hover btn" onclick={skip}><SkipForward size={16} /> Skip</button>
        </div>
      </div>
    {:else}
      <div class="start-wrap">
        <button class="btn btn-primary start-btn" onclick={startAll} disabled={sequence.timers.length === 0}>
          <Play size={14} /> Start sequence
        </button>
      </div>
    {/if}

    <ul
      class="row-list"
      use:dndzone={{ items: sequence.timers, dragDisabled, flipDurationMs: 200, dropTargetStyle: {} }}
      onconsider={handleConsider}
      onfinalize={handleFinalize}
    >
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
            <div
              class="glass glass-hover timer-row {activeIdx === i ? 'active' : ''}"
              use:longPressEnable={{
                onEnable: () => { dragDisabled = false; },
                onClick: () => { editingTimerId = t.id; }
              }}
            >
              <span class="num">{String(i + 1).padStart(2, '0')}</span>
              <div class="timer-name">{t.name}</div>
              <div class="tabular timer-time">{formatTime(t.seconds)}</div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    <div class="add-wrap">
      {#if addingNew}
        <TimerEditor
          initialName={`Timer ${sequence.timers.length + 1}`}
          initialSeconds={60}
          initialSound={DEFAULT_SOUND}
          onSave={(name, seconds, sound) => { addTimer(name, seconds, sound); addingNew = false; }}
          onCancel={() => (addingNew = false)}
        />
      {:else}
        <button class="glass glass-hover add-btn" onclick={() => (addingNew = true)}>
          <Plus size={16} /> Add timer
        </button>
      {/if}
    </div>

  </div>

  {#if confirmDelete}
    <div class="dialog-backdrop" onclick={() => (confirmDelete = false)}>
      <div class="dialog" onclick={(e) => e.stopPropagation()}>
        <h3>Delete this sequence?</h3>
        <p>"{sequence.name}" and its {sequence.timers.length} timer{sequence.timers.length === 1 ? '' : 's'} will be permanently removed.</p>
        <div class="actions">
          <button class="btn btn-ghost" onclick={() => (confirmDelete = false)}>Cancel</button>
          <button class="btn btn-danger" onclick={deleteSequenceNow}>Delete</button>
        </div>
      </div>
    </div>
  {/if}

</main>


<style>
  .row-spaced {
    margin-bottom: .75rem;
  }

  .flex-1-min0 {
    flex: 1;
    min-width: 0;
  }

  .editable-title {
    cursor: text;
    padding: .25rem .5rem;
    margin: 0 -.5rem;
    border-radius: .5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-line {
    font-size: .875rem;
    margin: 0 0 2.5rem;
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
    padding: .875rem 1.75rem;
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
</style>