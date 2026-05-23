<script>
  import {
    SOUND_OPTIONS,
    DEFAULT_SOUND,
    playSound
  } from '$lib/sounds';

  import { Volume2, Trash2 } from 'lucide-svelte';
  import SlideWheel from './SlideWheel.svelte';

  let {
    initialName,
    initialSeconds,
    initialSound,
    onSave,
    onCancel,
    onRemove
  } = $props();

  let name = $state(initialName);
  let mins = $state(Math.floor(initialSeconds / 60));
  let secs = $state(initialSeconds % 60);
  let sound = $state(initialSound);

  function save() {
    const total = Math.max(1, mins * 60 + secs);
    onSave(name.trim() || initialName, total, sound);
  }
</script>


<div class="glass editor fade-in">
  <div class="row">
    <input
      bind:value={name}
      placeholder="Timer name"
      style="flex: 1; min-width: 0; background: transparent; border: 0; outline: none; padding: .625rem 1rem; font-size: .875rem; font-weight: 500;"
    />
    <div class="row" style="flex-shrink: 0; gap: .5rem;">
      <select bind:value={sound} onchange={() => playSound(sound)}>
        {#each SOUND_OPTIONS as o}
          <option value={o.id}>{o.label}</option>
        {/each}
      </select>
      <button type="button" class="icon-btn" style="width: 2rem; height: 2rem; border: 1px solid var(--border); background: oklch(0.96 0.015 85);" onclick={() => playSound(sound)} aria-label="Preview sound">
        <Volume2 size={14} />
      </button>
    </div>
  </div>

  <div class="row" style="margin: 1.25rem 0; justify-content: center; gap: .75rem;">
    <SlideWheel value={mins} max={99} onChange={(v) => (mins = v)} />
    <span style="font-size: 1.5rem; color: var(--muted-foreground); font-weight: 300;">:</span>
    <SlideWheel value={secs} max={59} onChange={(v) => (secs = v)} />
  </div>

  <div class="row" style="justify-content: space-between;">
    <div class="row" style="gap: .5rem;">
      <button class="btn btn-primary" onclick={save}>Save</button>
      <button class="btn btn-ghost" onclick={onCancel}>Cancel</button>
    </div>
    {#if onRemove}
      <button class="icon-btn danger" style="border: 1px solid var(--border); background: oklch(0.96 0.015 85); border-radius: .75rem;" onclick={onRemove} aria-label="Delete timer">
        <Trash2 size={16} />
      </button>
    {/if}
  </div>
</div>
