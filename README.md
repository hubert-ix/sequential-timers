# Sequential Timers (SvelteKit)

Ported from the original TanStack Start / React version. Chain timers into sequences, run them with a progress ring, sounds on completion, drag-and-drop reordering (long-press to drag), and editable timers with a wheel picker.

## Stack
- SvelteKit 2 + Svelte 5 (runes)
- TypeScript
- `svelte-dnd-action` for reordering
- `lucide-svelte` for icons
- Web Audio API (synthesised sounds, no audio files)
- `localStorage` for persistence

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

Uses `@sveltejs/adapter-auto` — swap to a specific adapter (node, vercel, cloudflare, static) in `svelte.config.js` for deployment.

## Layout

- `src/routes/+page.svelte` — list of sequences
- `src/routes/group/[id]/+page.svelte` — sequence detail with running stage
- `src/lib/timers-store.ts` — writable store + localStorage
- `src/lib/sounds.ts` — Web Audio synth
- `src/lib/SlideWheel.svelte` — scroll-snap minute/second wheel
- `src/lib/TimerEditor.svelte` — inline editor
- `src/lib/ProgressRing.svelte` — SVG progress ring
- `src/lib/longPressDnd.ts` — long-press action that enables drag
