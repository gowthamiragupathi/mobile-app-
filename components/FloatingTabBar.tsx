import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { tap } from '../utils/haptics';

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [containerWidth, setContainerWidth] = useState(0);
  const slideX = useSharedValue(0);

  const tabIcons: Record<
    string,
    {
      icon: keyof typeof Feather.glyphMap;
      label: string;
    }
  > = {
    index: { icon: 'compass', label: 'Ideas' },
    submit: { icon: 'plus-circle', label: 'Submit' },
    leaderboard: { icon: 'award', label: 'Top 5' },
  };

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const layoutWidth = e.nativeEvent.layout.width;
    setContainerWidth(layoutWidth);
    const innerWidth = layoutWidth - 12; // 6px padding on each side
    const tabWidth = innerWidth / state.routes.length;
    slideX.value = state.index * tabWidth;
  };

  const activeTabWidth = containerWidth > 0 ? (containerWidth - 12) / state.routes.length : 0;

  React.useEffect(() => {
    if (activeTabWidth > 0) {
      slideX.value = withSpring(state.index * activeTabWidth, {
        damping: 18,
        stiffness: 220,
      });
    }
  }, [state.index, activeTabWidth, slideX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    width: activeTabWidth,
  }));

  // On desktop web, navigation is handled in the top Header navbar!
  if (width >= 768) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View
        onLayout={handleContainerLayout}
        style={[
          styles.pillContainer,
          {
            backgroundColor: theme.tabBar.bg,
            borderColor: theme.tabBar.border,
          },
          theme.shadow.soft,
        ]}
      >
        {/* Sliding Active Pill Indicator */}
        {activeTabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.slidingIndicator, animatedIndicatorStyle]}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.slidingGradient}
            />
          </Animated.View>
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = tabIcons[route.name] || {
            icon: 'grid' as const,
            label: options.title || route.name,
          };

          const onPress = () => {
            tap('light');
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={config.label}
              accessibilityState={{ selected: isFocused }}
              style={({ pressed }) => [
                styles.tabItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Feather
                name={config.icon}
                size={17}
                color={isFocused ? theme.tabBar.activeText : theme.tabBar.inactiveText}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? theme.tabBar.activeText : theme.tabBar.inactiveText,
                    fontFamily: isFocused ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  },
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    borderRadius: 36,
    borderWidth: 1.2,
    width: '100%',
    maxWidth: 440,
    position: 'relative',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    borderRadius: 26,
    overflow: 'hidden',
    zIndex: 1,
  },
  slidingGradient: {
    flex: 1,
    borderRadius: 26,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 26,
    gap: 6,
    minHeight: 44,
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
