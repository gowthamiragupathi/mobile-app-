import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIdeaStore } from '../store/useIdeaStore';
import { useTheme } from '../theme/colors';

export const Toast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const toast = useIdeaStore((s) => s.toast);
  const hideToast = useIdeaStore((s) => s.hideToast);
  const theme = useTheme();

  const translateY = useSharedValue(-140);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast?.visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 130 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-140, { duration: 260 }, () => {
          runOnJS(hideToast)();
        });
        opacity.value = withTiming(0, { duration: 260 });
      }, 2800);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-140, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [toast, hideToast, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast?.visible) return null;

  const iconName: keyof typeof Feather.glyphMap =
    toast.type === 'error'
      ? 'alert-circle'
      : toast.type === 'info'
      ? 'info'
      : 'check-circle';

  const iconColor =
    toast.type === 'error'
      ? theme.danger
      : toast.type === 'info'
      ? theme.accent
      : theme.success;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 10, 20),
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
        theme.shadow.glow,
        animatedStyle,
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconColor + '20' }]}>
        <Feather name={iconName} size={18} color={iconColor} />
      </View>
      <Text
        style={[styles.message, { color: theme.text }]}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
});
