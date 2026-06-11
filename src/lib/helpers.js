import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function buzz() {
  Haptics.impact({ style: ImpactStyle.Light });
}