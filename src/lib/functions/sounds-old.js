export const SOUND_OPTIONS = [
  { id: 'pulse',  label: 'Gentle pulse'  },
  { id: 'cosmos',  label: 'Cosmos'  },
  { id: 'bowl',  label: 'Singing bowl'  },
  { id: 'ocean', label: 'Ocean wave' },
  { id: 'bell', label: 'Soft bell' },
  { id: 'aurora',  label: 'Aurora morning'  },
  { id: 'none',    label: 'None'    },
];

export const DEFAULT_SOUND = 'pulse';

let ctx = null;
let currentSound = null;

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
  if (id === 'none') return null;
  if (currentSound) {
    currentSound.stop();
    currentSound = null;
  }
  const ac = getCtx();
  if (!ac) return null;

  const oscs = []; // track all oscillator nodes

  function managedTone(freq, start, duration, type = 'sine', gain = 0.25) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + start);
    g.gain.setValueAtTime(0, ac.currentTime + start);
    g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
    osc.connect(g).connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + duration + 0.05);
    oscs.push({ osc, g });
  }

  switch (id) {

    case 'cosmos': {
      const seqDuration = 4 * 0.45 + 0.85;
      for (let r = 0; r < repeats; r++) {
        const offset = r * (seqDuration + 0.3);
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          managedTone(freq, offset + i * 0.45, 0.85, 'sine', 0.28);
        });
      }
      break;
    }

    case 'bowl': {
      for (let r = 0; r < repeats; r++) {
        const offset = r * 2.5;
        const t0 = ac.currentTime + offset;
        const f = 196;
        const bus = ac.createGain();
        bus.connect(ac.destination);
        // multiple detuned partials
        const partials = [1, 2.01, 2.74, 4.05];
        partials.forEach((p, i) => {
          const osc = ac.createOscillator();
          const g = ac.createGain();
          const duration = 2.5 - i * 0.4;
          const gain = 0.18 / (i + 1);
          osc.type = 'sine';
          osc.frequency.value = f * p;
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
          osc.connect(g).connect(bus);
          osc.start(t0);
          osc.stop(t0 + duration + 0.05);
          oscs.push({ osc, g });
        });
        // slow tremolo LFO
        const lfo = ac.createOscillator();
        const lfoGain = ac.createGain();
        lfo.frequency.value = 4.2;
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain).connect(bus.gain);
        lfo.start(t0);
        lfo.stop(t0 + 2.5);
        oscs.push({ osc: lfo, g: lfoGain })
      }
      break;
    }

    case 'ocean': {
      for (let r = 0; r < repeats; r++) {
        const offset = r * (4.5 + 0.3);
        const t0 = ac.currentTime + offset;
        const dur = 4.5;
        const bus = ac.createGain();
        bus.gain.setValueAtTime(0, t0);
        bus.gain.linearRampToValueAtTime(0.35, t0 + 1.5);
        bus.gain.linearRampToValueAtTime(0, t0 + dur);
        bus.connect(ac.destination);
        const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
        const data = buf.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < data.length; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3;
        }
        const src = ac.createBufferSource();
        src.buffer = buf;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 600;
        lp.Q.value = 0.7;
        src.connect(lp).connect(bus);
        src.start(t0);
        src.stop(t0 + dur);
        oscs.push({ osc: src, g: bus });
      }
      break;
    }

    case 'bell': {
      for (let r = 0; r < repeats; r++) {
        const offset = r * 2.1;
        const t0 = ac.currentTime + offset;
        const f = 440;
        const carrier = ac.createOscillator();
        const mod = ac.createOscillator();
        const modGain = ac.createGain();
        const g = ac.createGain();
        carrier.frequency.value = f;
        mod.frequency.value = f * 1.4;
        modGain.gain.value = 220;
        mod.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(g);
        g.connect(ac.destination);
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.0);
        mod.start(t0); mod.stop(t0 + 2.05);
        carrier.start(t0); carrier.stop(t0 + 2.05);
        oscs.push({ osc: carrier, g }, { osc: mod, g: modGain });
      }
      break;
    }

    case 'aurora': {
      const seqDuration = 1.2 + 1.4;
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
          lfo.start(t); lfo.stop(t + 1.4);
          osc.start(t); osc.stop(t + 1.45);
          oscs.push({ osc, g }, { osc: lfo, g: lfoGain });
        });
      }
      break;
    }

    case 'pulse': {
      for (let r = 0; r < repeats; r++) {
        const offset = r * (2 + 0.3);
        const t0 = ac.currentTime + offset;
        const notes = [392, 523.25, 659.25];
        notes.forEach((f, i) => {
          const osc = ac.createOscillator();
          const g = ac.createGain();
          const nt = t0 + i * 0.12;
          osc.type = 'sine';
          osc.frequency.value = f;
          g.gain.setValueAtTime(0, nt);
          g.gain.linearRampToValueAtTime(0.28, nt + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, nt + 1.2);
          osc.connect(g).connect(ac.destination);
          osc.start(nt);
          osc.stop(nt + 1.3);
          oscs.push({ osc, g });
        });
      }
      break;
    }

  }

  const handle = {
    stop() {
      const now = ac.currentTime;
      oscs.forEach(({ osc, g }) => {
        try {
          g.gain.cancelScheduledValues(now);
          g.gain.setValueAtTime(g.gain.value, now);
          g.gain.linearRampToValueAtTime(0, now + 0.05);
          osc.stop(now + 0.05);
        } catch {}
      });
      oscs.length = 0;
      currentSound = null;
    }
  };

  currentSound = handle;
  return handle;
}