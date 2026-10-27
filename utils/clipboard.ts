import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    }
    await Clipboard.setStringAsync(text);
    return true;
  } catch (err) {
    console.warn('Clipboard copy error:', err);
    return false;
  }
};
