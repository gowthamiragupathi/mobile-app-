import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/colors';

interface RatingRingProps {
  rating: number;
  size?: number;
  delay?: number;
  showLabel?: boolean;
  animateCount?: boolean;
}

export const RatingRing: React.FC<RatingRingProps> = ({
  rating,
  size = 62,
  delay = 0,
  showLabel = true,
  animateCount = false,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  const [displayScore, setDisplayScore] = useState(animateCount ? 0 : rating);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 140 }));
    opacity.value = withDelay(delay, withSpring(1));

    if (animateCount) {
      setDisplayScore(0);
      const startTime = Date.now() + delay;
      const duration = 1100;
      let frameId: number;

      const step = () => {
        const now = Date.now();
        if (now < startTime) {
          frameId = requestAnimationFrame(step);
          return;
        }
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(easeOut * rating);
        setDisplayScore(currentScore);

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        }
      };

      frameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frameId);
    } else {
      setDisplayScore(rating);
    }
  }, [delay, scale, opacity, rating, animateCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isElite = rating >= 90;
  const isStrong = rating >= 78 && rating < 90;

  const gradientColors: [string, string] = isElite
    ? theme.gradients.accent
    : isStrong
    ? theme.gradients.primary
    : theme.gradients.gold;

  const borderColor = isElite
    ? theme.accentGlow
    : isStrong
    ? 'rgba(139, 92, 246, 0.45)'
    : 'rgba(245, 158, 11, 0.45)';

  const glowShadowColor = isElite ? theme.accent : isStrong ? theme.primary : theme.gold;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          shadowColor: glowShadowColor,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.outerRing, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
              borderColor: borderColor,
              backgroundColor: theme.cardSecondary,
            },
          ]}
        >
          <Text
            style={[
              styles.scoreText,
              {
                fontSize: size > 75 ? 26 : size > 50 ? 17 : 14,
                color: theme.text,
              },
            ]}
          >
            {displayScore}
          </Text>
          {showLabel && size >= 50 && (
            <Text
              style={[
                styles.labelText,
                {
                  fontSize: size > 75 ? 9 : 8,
                  color: theme.textSecondary,
                },
              ]}
            >
              AI SCORE
            </Text>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
  },
  scoreText: {
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  labelText: {
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginTop: -1,
  },
});
