export const SOUND_OPTIONS = [
  { id: 'Aura', label: 'Aura'  },
  { id: 'Cascade', label: 'Cascade'  },
  { id: 'Church', label: 'Church'  },
  { id: 'Dusk', label: 'Dusk' },
  { id: 'Echoes', label: 'Echoes' },
  { id: 'Ether', label: 'Ether'  },
  { id: 'Flare', label: 'Flare'  },
  { id: 'Lumen', label: 'Lumen'  },
  { id: 'Ocean', label: 'Ocean'  },
  { id: 'Orion', label: 'Orion'  },
  { id: 'Ping', label: 'Ping'  },
  { id: 'Prism', label: 'Prism'  },
  { id: 'Spark', label: 'Spark'  },
  { id: 'Zest', label: 'Zest'  },
  { id: 'none', label: 'None'    },
];

export const DEFAULT_SOUND = 'Echoes';

let currentSound = null;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function playSound(id = DEFAULT_SOUND, repeats = 1) {
  if (id === 'none') return null;
  if (currentSound) {
    currentSound.stop();
    currentSound = null;
  }
  const ac = getCtx();
  const gainNode = ac.createGain();
  gainNode.connect(ac.destination);
  const audio = new Audio(`/alarms/${id}.mp3`);
  const source = ac.createMediaElementSource(audio);
  source.connect(gainNode);
  let count = 0;
  audio.addEventListener('ended', () => {
    count++;
    if (count < repeats) audio.play().catch(() => {});
  });
  audio.play().catch(() => {});
  const handle = {
    stop() {
      const now = ac.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.08);
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        currentSound = null;
      }, 90);
    }
  };
  currentSound = handle;
  return handle;
}