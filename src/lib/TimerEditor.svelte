<script>
  import { SOUND_OPTIONS, DEFAULT_SOUND, playSound } from '$lib/functions/sounds';
  import { Volume2, Trash2 } from 'lucide-svelte';
  import SlideWheel from './SlideWheel.svelte';

  let {
    initialName,
    initialSeconds,
    initialSound,
    showBorder = true,
    onSave,
    onCancel,
    onRemove
  } = $props();

  let name = $state(initialName);
  let mins = $state(Math.floor(initialSeconds / 60));
  let secs = $state(initialSeconds % 60);
  let sound = $state(initialSound);

  function save(e) {
    e.stopPropagation();
    const total = Math.max(1, mins * 60 + secs);
    onSave(name.trim() || initialName, total, sound);
  }
</script>


<div class="editor" class:border={showBorder}>
  <div class="row">
    <input class="input-name" bind:value={name} placeholder="Timer name" />
    <div class="row">
      <select bind:value={sound} onchange={() => playSound(sound)}>
        {#each SOUND_OPTIONS as o}
          <option value={o.id}>{o.label}</option>
        {/each}
      </select>
      <button type="button" class="icon small ghost" onclick={() => playSound(sound)} aria-label="Preview sound">
        <Volume2 size={14} />
      </button>
    </div>
  </div>

  <div class="row duration">
    <SlideWheel value={mins} max={99} onChange={(v) => (mins = v)} />
    <span class="separator">:</span>
    <SlideWheel value={secs} max={59} onChange={(v) => (secs = v)} />
  </div>

  <div class="row buttons">
    <div class="row save">
      <button class="primary bounce" onclick={save}>Save</button>
      <button class="ghost bounce" onclick={onCancel}>Cancel</button>
    </div>
    {#if onRemove}
      <button class="icon ghost bounce" onclick={onRemove} aria-label="Delete timer">
        <Trash2 size={16} />
      </button>
    {/if}
  </div>
</div>


<style>
  .editor {
    background: #fff;
  }

  .editor.border {
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    border: solid 1px var(--color-border);
  }

  .editor select {
    padding: 0.375rem 0.5rem;
    border-radius: 0.5rem;
    background: var(--color-background-ghost);
    border: 1px solid var(--color-border);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .input-name {
    flex: 1; 
    min-width: 0; 
    background: transparent; 
    border: 0; 
    outline: none; 
    padding: .625rem 1rem; 
    padding-left: 0;
    font-size: 1rem; 
    font-weight: 500;
  }

  .row.duration {
    margin: 1.25rem 0; 
    margin-top: 0;
    justify-content: center; 
  }

  .separator {
    font-size: 1.5rem; 
    color: var(--color-text-muted); 
    font-weight: 300;
  }

  .row.buttons {
    justify-content: space-between;
  }

  .row.save {
    gap: .5rem;
  }
</style>