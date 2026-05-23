export const SOUND_OPTIONS = [
  { id: 'chime', label: 'Chime' },
  { id: 'beep', label: 'Beep' },
  { id: 'bell', label: 'Bell' },
  { id: 'ding', label: 'Ding' },
  { id: 'digital', label: 'Digital' },
  { id: 'none', label: 'None' }
];

export const DEFAULT_SOUND = 'chime';

let ctx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;

  if (!ctx) {
    const AC =
      window.AudioContext || window.webkitAudioContext;

    if (!AC) return null;

    ctx = new AC();
  }

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  return ctx;
}

function tone(
  ac,
  freq,
  start,
  duration,
  type = 'sine',
  gain = 0.25
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();

  osc.type = type;

  osc.frequency.setValueAtTime(
    freq,
    ac.currentTime + start
  );

  g.gain.setValueAtTime(
    0,
    ac.currentTime + start
  );

  g.gain.linearRampToValueAtTime(
    gain,
    ac.currentTime + start + 0.01
  );

  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + start + duration
  );

  osc.connect(g).connect(ac.destination);

  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export function playSound(id = DEFAULT_SOUND) {
  if (id === 'none') return;

  const ac = getCtx();
  if (!ac) return;

  switch (id) {
    case 'chime':
      tone(ac, 880, 0, 0.5, 'sine', 0.25);
      tone(ac, 1318.5, 0.12, 0.6, 'sine', 0.22);
      break;

    case 'beep':
      tone(ac, 1000, 0, 0.15, 'square', 0.18);
      tone(ac, 1000, 0.22, 0.15, 'square', 0.18);
      break;

    case 'bell':
      tone(ac, 1568, 0, 1.2, 'sine', 0.2);
      tone(ac, 2093, 0, 1.0, 'sine', 0.12);
      break;

    case 'ding':
      tone(ac, 2000, 0, 0.8, 'triangle', 0.22);
      break;

    case 'digital':
      tone(ac, 1200, 0, 0.08, 'sawtooth', 0.15);
      tone(ac, 1600, 0.1, 0.08, 'sawtooth', 0.15);
      tone(ac, 2000, 0.2, 0.12, 'sawtooth', 0.15);
      break;
  }
}