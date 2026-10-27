import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../theme/colors';
import { tap } from '../utils/haptics';

export const Header: React.FC = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = theme;
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;

  // 0 for dark, 1 for light
  const toggleProgress = useSharedValue(isDarkMode ? 0 : 1);

  useEffect(() => {
    toggleProgress.value = withSpring(isDarkMode ? 0 : 1, {
      damping: 15,
      stiffness: 180,
    });
  }, [isDarkMode, toggleProgress]);

  const handleToggleTheme = () => {
    tap('light');
    toggleTheme();
  };

  const sunAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(toggleProgress.value, [0, 1], [90, 0]);
    const opacity = interpolate(toggleProgress.value, [0, 0.4, 1], [0, 0.2, 1]);
    const scale = interpolate(toggleProgress.value, [0, 1], [0.6, 1]);
    return {
      opacity,
      transform: [{ rotate: `${rotate}deg` }, { scale }],
    };
  });

  const moonAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(toggleProgress.value, [0, 1], [0, -90]);
    const opacity = interpolate(toggleProgress.value, [0, 0.4, 1], [1, 0.2, 0]);
    const scale = interpolate(toggleProgress.value, [0, 1], [1, 0.6]);
    return {
      opacity,
      transform: [{ rotate: `${rotate}deg` }, { scale }],
    };
  });

  const isIdeasActive = pathname === '/' || pathname === '/(tabs)' || pathname.endsWith('index');
  const isSubmitActive = pathname.includes('submit');
  const isLeaderboardActive = pathname.includes('leaderboard');

  const navTo = (path: '/(tabs)' | '/(tabs)/submit' | '/(tabs)/leaderboard') => {
    tap('light');
    router.navigate(path);
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.cardBorder,
          backgroundColor: theme.bg,
        },
      ]}
    >
      <View style={styles.innerNavRow}>
        {/* Brand Logo & Title */}
        <Pressable
          onPress={() => navTo('/(tabs)')}
          style={styles.leftRow}
          accessibilityRole="button"
          accessibilityLabel="Go to Home"
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.logoBadge, theme.shadow.glow]}
          >
            <Feather name="zap" size={20} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.titleCol}>
            <View style={styles.logoTitleRow}>
              <Text style={[styles.title, { color: theme.text }]}>IdeaForge</Text>
              {isDesktop && (
                <View
                  style={[
                    styles.webBadge,
                    { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder },
                  ]}
                >
                  <Text style={[styles.webBadgeText, { color: theme.primary }]}>AI EVALUATOR</Text>
                </View>
              )}
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Startup Idea Evaluator
            </Text>
          </View>
        </Pressable>

        {/* Desktop Web Navigation Tabs */}
        {isDesktop && (
          <View
            style={[
              styles.desktopNavGroup,
              { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder },
            ]}
          >
            <Pressable
              onPress={() => navTo('/(tabs)')}
              style={[
                styles.desktopNavTab,
                isIdeasActive && { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
              accessibilityRole="link"
            >
              <Feather
                name="compass"
                size={15}
                color={isIdeasActive ? theme.primary : theme.muted}
              />
              <Text
                style={[
                  styles.desktopNavText,
                  {
                    color: isIdeasActive ? theme.text : theme.muted,
                    fontFamily: isIdeasActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  },
                ]}
              >
                Ideas Feed
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navTo('/(tabs)/submit')}
              style={[
                styles.desktopNavTab,
                isSubmitActive && { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
              accessibilityRole="link"
            >
              <Feather
                name="plus-circle"
                size={15}
                color={isSubmitActive ? theme.primary : theme.muted}
              />
              <Text
                style={[
                  styles.desktopNavText,
                  {
                    color: isSubmitActive ? theme.text : theme.muted,
                    fontFamily: isSubmitActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  },
                ]}
              >
                Submit Startup
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navTo('/(tabs)/leaderboard')}
              style={[
                styles.desktopNavTab,
                isLeaderboardActive && { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
              accessibilityRole="link"
            >
              <Feather
                name="award"
                size={15}
                color={isLeaderboardActive ? theme.primary : theme.muted}
              />
              <Text
                style={[
                  styles.desktopNavText,
                  {
                    color: isLeaderboardActive ? theme.text : theme.muted,
                    fontFamily: isLeaderboardActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  },
                ]}
              >
                Leaderboard
              </Text>
            </Pressable>
          </View>
        )}

        {/* Right Section: Quick CTA + Theme Toggle */}
        <View style={styles.rightRow}>
          {isDesktop && !isSubmitActive && (
            <Pressable
              onPress={() => navTo('/(tabs)/submit')}
              style={[styles.desktopCtaBtn, theme.shadow.soft]}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.desktopCtaGradient}
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.desktopCtaText}>Evaluate Startup</Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Theme Toggle Button */}
          <Pressable
            onPress={handleToggleTheme}
            accessibilityLabel="Toggle color theme"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.themeButton,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: theme.cardBorder,
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: pressed ? 0.92 : 1 }],
              },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.iconCenter}>
              <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, moonAnimatedStyle]}>
                <Feather name="sun" size={18} color={theme.gold} />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, sunAnimatedStyle]}>
                <Feather name="moon" size={18} color={theme.primary} />
              </Animated.View>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  innerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleCol: {
    justifyContent: 'center',
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  webBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
  },
  webBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 1,
  },
  desktopNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  desktopNavTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 7,
    minHeight: 38,
  },
  desktopNavText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopCtaBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  desktopCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  desktopCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCenter: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
