<script>
  import { SOUND_OPTIONS, DEFAULT_SOUND, playSound } from '$lib/functions/sounds';
  import { Volume2 } from 'lucide-svelte';
  import SlideWheel from '$lib/SlideWheel.svelte';
  import Toggle from '$lib/Toggle.svelte';

  let {
    initialName,
    initialSeconds = 60,
    initialSound = DEFAULT_SOUND,
    initialVibrate = false,
    initialRepeats = 2,
    onSave,
    onCancel,
  } = $props();

  let name = $state(initialName);
  let mins = $state(Math.floor(initialSeconds / 60));
  let secs = $state(initialSeconds % 60);
  let sound = $state(initialSound);
  let vibrate = $state(initialVibrate);
  let repeats = $state(initialRepeats);
  let previewSound = $state(null);

  function previewAndSelect(id) {
    if (previewSound) { 
      previewSound.stop(); 
      previewSound = null; 
    }
    sound = id;
    if (id !== 'none') {
      previewSound = playSound(id, 1);
    }
  }

  function save(e) {
    e.stopPropagation();
    if (previewSound) { 
      previewSound.stop(); 
      previewSound = null; 
    }
    const total = Math.max(1, mins * 60 + secs);
    onSave(name.trim() || initialName, total, sound, vibrate, repeats);
  }

  function cancel(e) {
    if (previewSound) { 
      previewSound.stop(); 
      previewSound = null; 
    }
    onCancel(e);
  }
</script>


<div class="wrap">
  <label for="name">Name</label>
  <input class="text" bind:value={name} placeholder="Timer name" id="name" />
</div>

<div class="wrap">
  <label for="duration">Duration</label>
  <div class="row duration">
    <SlideWheel value={mins} max={99} onChange={(v) => (mins = v)} />
    <span class="separator">:</span>
    <SlideWheel value={secs} max={59} onChange={(v) => (secs = v)} />
  </div>
</div>

<div class="wrap">
  <div class="item">
    <label for="alarm">Alarm sound</label>
    <div class="row alarm">
      <select bind:value={sound} onchange={() => previewAndSelect(sound)}>
        {#each SOUND_OPTIONS as o}
          <option value={o.id}>{o.label}</option>
        {/each}
      </select>
      <button type="button" class="icon ghost" onclick={() => previewAndSelect(sound)} aria-label="Preview sound">
        <Volume2 size={16} />
      </button>
    </div>
  </div>

  <div class="item row options">
    <div class="repeats">
      <label for="alarm">Alarm repeats</label>
      <div class="row">
        <button class="repeat" class:selected={repeats == 1} onclick={() => repeats = 1}>1x</button>
        <button class="repeat" class:selected={repeats == 2} onclick={() => repeats = 2}>2x</button>
        <button class="repeat" class:selected={repeats == 3} onclick={() => repeats = 3}>3x</button>
      </div>
    </div>
    <div class="vibrate">
      <label for="alarm">Vibrate</label>
      <Toggle bind:checked={vibrate} />
    </div>
  </div>
</div>
    
<div class="row buttons">
  <div class="row save">
    <button class="primary bounce" onclick={save}>Save</button>
    <button class="ghost bounce" onclick={cancel}>Cancel</button>
  </div>
</div>


<style>
  .wrap {
    background-color: var(--color-box);
    border-radius: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
  }

  .item {
    margin-bottom: 1rem;
  }

  label {
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    display: block;
  }

  .row.duration {
    justify-content: center; 
  }

  .separator {
    font-size: 1.5rem; 
    color: var(--color-text-muted); 
    font-weight: 300;
  }

  .row.alarm {
    justify-content: space-between;
  }

  .row.buttons {
    justify-content: space-between;
  }

  .row.options {
    justify-content: space-between;
    align-items: start;
  }

  button.repeat {
    color: var(--color-button-repeat);
  }

  button.repeat.selected {
    background-color: var(--color-button-muted);
    color: var(--color-button-repeat-selected);
  }

  .vibrate label {
    margin-bottom: 0.7rem;
  }

  .row.save {
    gap: .5rem;
    margin-top: 0.5rem;
  }
</style>