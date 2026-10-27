import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type TapStyle = 'light' | 'medium' | 'heavy' | 'selection';

export const tap = async (style: TapStyle = 'light'): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    if (style === 'selection') {
      await Haptics.selectionAsync();
    } else if (style === 'medium') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (style === 'heavy') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Silently ignore unsupported platforms
  }
};

export const success = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silently ignore
  }
};

export const warning = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Silently ignore
  }
};

export const error = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Silently ignore
  }
};
