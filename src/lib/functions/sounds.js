export const SOUND_OPTIONS = [
  { id: 'Analog', label: 'Analog' },
  { id: 'Aura', label: 'Aura' },
  { id: 'Bicycle Bell', label: 'Bicycle Bell' },
  { id: 'Church Bell', label: 'Church Bell' },
  { id: 'Door Bell', label: 'Door Bell' },
  { id: 'Dusk', label: 'Dusk' },
  { id: 'Ether', label: 'Ether' },
  { id: 'Ocean', label: 'Ocean Wave' },
  { id: 'Orion', label: 'Orion' },
  { id: 'Ping', label: 'Ping' },
  { id: 'Shakers', label: 'Shakers' },
  { id: 'Spark', label: 'Spark' },
  { id: 'none', label: 'None' },
];

export const DEFAULT_SOUND = 'Orion';

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

  let stopped = false;
  let timeouts = [];
  let currentAudio = null;

  function playOnce() {
    if (stopped) return;
    const audio = new Audio(`/alarms/${id}.mp3`);
    currentAudio = audio;
    const source = ac.createMediaElementSource(audio);
    source.connect(gainNode);

    audio.addEventListener('loadedmetadata', () => {
      if (stopped) return;
      audio.play().catch(() => {});
      const next = Math.max(0, (audio.duration - 0.5) * 1000);
      const t = setTimeout(() => {
        repeats--;
        if (repeats > 0) playOnce();
      }, next);
      timeouts.push(t);
    });
  }

  playOnce();

  const handle = {
    stop() {
      stopped = true;
      timeouts.forEach(t => clearTimeout(t));
      timeouts = [];
      const now = ac.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.08);
      setTimeout(() => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        currentSound = null;
      }, 90);
    }
  };

  currentSound = handle;
  return handle;
}