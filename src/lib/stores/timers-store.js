import { writable, get } from 'svelte/store';

const KEY = 'timeflow-v1';

function seed() {
  return [
  ];
}

function load() {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } 
  catch {
    return seed();
  }
}

export const sequences = writable(
  typeof window === 'undefined' ? [] : load()
);

if (typeof window !== 'undefined') {
  sequences.subscribe((v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
  });
}

export function updateSequence(id, updater) {
  sequences.update((all) =>
    all.map((s) => (s.id === id ? updater(s) : s))
  );
}

export function removeSequence(id) {
  sequences.update((all) =>
    all.filter((s) => s.id !== id)
  );
}

export function getSequence(id) {
  return get(sequences).find((s) => s.id === id);
}

export function formatTime(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}