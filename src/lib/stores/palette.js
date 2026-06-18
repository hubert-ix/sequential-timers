import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const PALETTES = {
  stock: {
    label: 'Stock Blue',
    bgColor: 'oklch(1 0 0)',
    swatches: ['#6960f2', '#dcd7ff', '#e8e8e8', '#a2b4f7']
  },
  forest: {
    label: 'Forest Green',
    bgColor: 'oklch(96.931% 0.01882 119.908)',
    swatches: ['oklch(65% .2 130)', 'oklch(88% .1 120)', 'oklch(93% .03 120)', 'oklch(0.78 0.1 135.78)']
  },
  ocean: {
    label: 'Ocean Deep',
    bgColor: 'oklch(0.97 0.015 230)',
    swatches: ['oklch(55% .18 240)', 'oklch(88% .1 220)', 'oklch(93% .03 220)', 'oklch(0.81 0.06 220.51)']
  },
  rose: {
    label: 'Cherry Blossom',
    bgColor: 'oklch(0.98 0.015 350)',
    swatches: ['oklch(60% .2 10)', 'oklch(88% .1 10)', 'oklch(94% .03 10)', 'oklch(0.83 0.07 6.73)']
  },
  amber: {
    label: 'Earthly Amber',
    bgColor: 'oklch(0.99 0.01 74.96)',
    swatches: ['oklch(0.83 0.1 79.64)', 'oklch(88% .1 75)', 'oklch(93% .03 75)', 'oklch(0.83 0.1 79.64)']
  },
  slate: {
    label: 'Dark Slate',
    bgColor: 'oklch(1 0 0)',
    swatches: ['#000', 'lab(23.2336% .906661 -11.0479)', 'lab(73.609% 7.02977 -36.308)', 'oklch(0.53 0.08 253.76)']
  },
}
const stored = browser ? localStorage.getItem('palette') ?? 'forest' : 'forest';

export const palette = writable(stored);
export { PALETTES };

palette.subscribe(val => {
  if (!browser) return;
  localStorage.setItem('palette', val);
  document.documentElement.setAttribute('data-palette', val);
});