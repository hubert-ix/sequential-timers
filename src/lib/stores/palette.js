import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const PALETTES = {
  forest: {
    label: 'Forest',
    swatches: ['oklch(65% .2 130)', 'oklch(88% .1 120)', 'oklch(93% .03 120)', 'oklch(0.78 0.1 135.78)']
  },
  ocean: {
    label: 'Ocean',
    swatches: ['oklch(55% .18 240)', 'oklch(88% .1 220)', 'oklch(93% .03 220)', 'oklch(0.8 0.05 348.31)']
  },
  rose: {
    label: 'Rose',
    swatches: ['oklch(60% .2 10)', 'oklch(88% .1 10)', 'oklch(94% .03 10)', 'oklch(0.92 0.13 113.28)']
  },
  slate: {
    label: 'Slate',
    swatches: ['oklch(45% .04 260)', 'oklch(88% .01 260)', 'oklch(93% .008 250)', 'oklch(0.86 0.04 260.41)']
  },
  amber: {
    label: 'Amber',
    swatches: ['oklch(0.83 0.1 79.64)', 'oklch(88% .1 75)', 'oklch(93% .03 75)', 'oklch(0.83 0.1 79.64)']
  }
}
const stored = browser ? localStorage.getItem('palette') ?? 'forest' : 'forest';

export const palette = writable(stored);
export { PALETTES };

palette.subscribe(val => {
  if (!browser) return;
  localStorage.setItem('palette', val);
  document.documentElement.setAttribute('data-palette', val);
});