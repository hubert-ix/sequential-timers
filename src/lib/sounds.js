export const SOUND_OPTIONS = [
  { id: 'cosmos',  label: 'Cosmos'  },
  { id: 'morning', label: 'Morning' },
  { id: 'droplet', label: 'Droplet' },
  { id: 'aurora',  label: 'Aurora'  },
  { id: 'none',    label: 'None'    },
];

export const DEFAULT_SOUND = 'cosmos';

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

export function playSound(id = DEFAULT_SOUND, repeats = 1) {
  if (id === 'none') return;
  const ac = getCtx();
  if (!ac) return;

  switch (id) {
    case 'cosmos': {
      const seqDuration = 4 * 0.45 + 0.85; // total length of one sequence
      for (let r = 0; r < repeats; r++) {
        const offset = r * (seqDuration + 0.3);
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          tone(ac, freq, offset + i * 0.45, 0.85, 'sine', 0.28);
        });
      }
      break;
    }

    case 'morning': {
      const seqDuration = 2 * 0.55 + 1.05;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (seqDuration + 0.3);
        [[523.25, 659.25], [440, 554.37], [392, 493.88]].forEach(([f1, f2], i) => {
          tone(ac, f1, offset + i * 0.55, 1.05, 'sine', 0.18);
          tone(ac, f2, offset + i * 0.55, 1.05, 'sine', 0.15);
        });
      }
      break;
    }

    case 'droplet': {
      const seqDuration = 2 * 0.22 + 0.65;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (seqDuration + 0.3);
        [880, 1108.73, 1318.51].forEach((freq, i) => {
          tone(ac, freq, offset + i * 0.22, 0.65, 'sine', 0.28);
        });
      }
      break;
    }

    case 'aurora': {
      const seqDuration = 1.2 + 1.4; // last note start + its duration
      for (let r = 0; r < repeats; r++) {
        const repeatOffset = r * (seqDuration + 0.4);
        [[349.23, 0], [440, 0.6], [523.25, 1.2]].forEach(([freq, delay]) => {
          const osc = ac.createOscillator();
          const lfo = ac.createOscillator();
          const lfoGain = ac.createGain();
          const g = ac.createGain();
          const t = ac.currentTime + repeatOffset + delay;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(g).connect(ac.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          lfo.type = 'sine';
          lfo.frequency.value = 5;
          lfoGain.gain.value = 4;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.22, t + 0.3);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
          lfo.start(t);  lfo.stop(t + 1.4);
          osc.start(t);  osc.stop(t + 1.45);
        });
      }
      break;
    }
  }
}