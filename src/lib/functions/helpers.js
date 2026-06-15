import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function buzz() {
  Haptics.impact({ style: ImpactStyle.Light });
}

export function vibrateRepeat(times, duration, gap) {
  if (times <= 0) return;
  Haptics.vibrate({ duration });
  if (times > 1) setTimeout(() => vibrateRepeat(times - 1, duration, gap), duration + gap);
}