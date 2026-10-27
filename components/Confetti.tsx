import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const CONFETTI_COUNT = 32;

const COLORS = [
  '#F59E0B', // gold
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F97316', // orange
];

interface ParticleProps {
  index: number;
}

const ConfettiParticle: React.FC<ParticleProps> = ({ index }) => {
  const angle = (index / CONFETTI_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
  const distance = 80 + Math.random() * 120;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance - 30; // slightly upward bias

  const color = COLORS[index % COLORS.length];
  const size = 6 + (index % 4) * 2;
  const isCircle = index % 3 === 0;

  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1000 + Math.random() * 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withDelay(
      600,
      withTiming(0, {
        duration: 500,
        easing: Easing.linear,
      })
    );
  }, [progress, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const x = targetX * progress.value;
    const y = targetY * progress.value + progress.value * 40; // gravity
    const rot = progress.value * (360 + index * 40);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rot}deg` },
        { scale: 1 - progress.value * 0.3 },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: isCircle ? size : size * 1.5,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ConfettiBurst: React.FC = () => {
  return (
    <View pointerEvents="none" style={styles.container}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
  },
});
