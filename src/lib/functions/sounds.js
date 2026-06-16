export const SOUND_OPTIONS = [
  { id: 'Analog', label: 'Analog' },
  { id: 'Aura', label: 'Aura' },
  { id: 'Bicycle Bell', label: 'Bicycle Bell' },
  { id: 'Church Bell', label: 'Church Bell' },
  { id: 'Door Bell', label: 'Door Bell' },
  { id: 'Dusk', label: 'Dusk' },
  { id: 'Ether', label: 'Ether'  },
  { id: 'Ocean', label: 'Ocean Wave'  },
  { id: 'Orion', label: 'Orion' },
  { id: 'Ping', label: 'Ping' },
  { id: 'Shakers', label: 'Shakers' },
  { id: 'Spark', label: 'Spark' },
  { id: 'none', label: 'None' },
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