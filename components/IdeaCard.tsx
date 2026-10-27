import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  PanResponder,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { RatingRing } from './RatingRing';
import { Idea, useIdeaStore } from '../store/useIdeaStore';
import { useTheme } from '../theme/colors';
import { tap, warning, success as successHaptic } from '../utils/haptics';
import { copyToClipboard } from '../utils/clipboard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch {
    // safe fallback
  }
}

interface IdeaCardProps {
  idea: Idea;
  index: number;
  style?: any;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, style }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const votedIds = useIdeaStore((s) => s.votedIds);
  const upvoteIdea = useIdeaStore((s) => s.upvoteIdea);
  const showToast = useIdeaStore((s) => s.showToast);

  const isVoted = votedIds.includes(idea.id);

  // Spring pop scale for vote button
  const voteScale = useSharedValue(1);

  // Swipe translation (-90 to +90)
  const panX = useSharedValue(0);

  const handleUpvote = () => {
    if (isVoted) {
      warning();
      showToast('You already upvoted this startup!', 'info');
      return;
    }

    tap('medium');
    voteScale.value = withSequence(
      withTiming(1.35, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );

    const success = upvoteIdea(idea.id);
    if (success) {
      successHaptic();
      showToast(`+1 Vote added to ${idea.name}!`, 'success');
    }
  };

  const handleShare = async () => {
    tap('light');
    const content = `${idea.name} – ${idea.tagline} (AI score ${idea.rating}/100)`;
    const copied = await copyToClipboard(content);
    if (copied) {
      showToast('Copied: ' + content, 'success');
    }
  };

  const panResponder = useRef(
    Platform.OS === 'web'
      ? { panHandlers: {} }
      : PanResponder.create({
          onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 15;
          },
          onPanResponderMove: (_, gestureState) => {
            panX.value = Math.max(-90, Math.min(90, gestureState.dx * 0.65));
          },
          onPanResponderRelease: (_, gestureState) => {
            if (!isVoted && gestureState.dx > 65) {
              handleUpvote();
            } else if (gestureState.dx < -65) {
              handleShare();
            }
            panX.value = withSpring(0, { damping: 16, stiffness: 190 });
          },
          onPanResponderTerminate: () => {
            panX.value = withSpring(0);
          },
        })
  ).current;

  const handleToggleExpand = () => {
    if (Platform.OS !== 'web' && LayoutAnimation?.configureNext) {
      try {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      } catch {
        // Safe fallback
      }
    }
    tap('light');
    setExpanded(!expanded);
  };

  const animatedVoteBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voteScale.value }],
  }));

  const animatedCardSlide = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(14)}
      style={[styles.cardOuter, style]}
    >
      {/* Background hint revealed on swipe right (Upvote) or left (Share) */}
      {Platform.OS !== 'web' && (
        <View style={styles.swipeBackground}>
          <View style={[styles.swipeLeftHint, { backgroundColor: theme.primary }]}>
            <Feather name="arrow-up-circle" size={22} color="#FFFFFF" />
            <Text style={styles.swipeHintText}>UPVOTE</Text>
          </View>
          <View style={[styles.swipeRightHint, { backgroundColor: theme.accent }]}>
            <Feather name="share-2" size={22} color="#FFFFFF" />
            <Text style={styles.swipeHintText}>SHARE</Text>
          </View>
        </View>
      )}

      <Animated.View
        {...(Platform.OS !== 'web' ? panResponder.panHandlers : {})}
        style={[
          styles.cardInner,
          {
            backgroundColor: theme.card,
            borderColor: isVoted ? theme.accentGlow : theme.cardBorder,
          },
          theme.shadow.soft,
          animatedCardSlide,
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.titleInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                {idea.name}
              </Text>
            </View>

            {/* Verdict Chip */}
            {Boolean(idea.verdict) && (
              <View
                style={[
                  styles.verdictChip,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.verdictText, { color: theme.primary }]}>
                  {idea.verdict}
                </Text>
              </View>
            )}

            <Text
              style={[styles.tagline, { color: theme.textSecondary }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {idea.tagline}
            </Text>
          </View>

          <RatingRing rating={idea.rating} size={58} delay={index * 50} />
        </View>

        {/* Expandable Description */}
        {expanded && (
          <View style={[styles.descContainer, { borderTopColor: theme.cardBorder }]}>
            <Text style={[styles.descText, { color: theme.muted }]}>
              {idea.description}
            </Text>

            {/* Metric Bars Preview */}
            {idea.metrics && (
              <View style={styles.metricsBox}>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.muted }]}>Market</Text>
                  <View style={[styles.metricBarBg, { backgroundColor: theme.cardSecondary }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${idea.metrics.market}%`, backgroundColor: theme.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.metricVal, { color: theme.text }]}>
                    {idea.metrics.market}%
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.muted }]}>Innovation</Text>
                  <View style={[styles.metricBarBg, { backgroundColor: theme.cardSecondary }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${idea.metrics.innovation}%`, backgroundColor: theme.accent },
                      ]}
                    />
                  </View>
                  <Text style={[styles.metricVal, { color: theme.text }]}>
                    {idea.metrics.innovation}%
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.muted }]}>Feasibility</Text>
                  <View style={[styles.metricBarBg, { backgroundColor: theme.cardSecondary }]}>
                    <View
                      style={[
                        styles.metricBarFill,
                        { width: `${idea.metrics.feasibility}%`, backgroundColor: theme.gold },
                      ]}
                    />
                  </View>
                  <Text style={[styles.metricVal, { color: theme.text }]}>
                    {idea.metrics.feasibility}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Expand Toggle */}
        <Pressable
          onPress={handleToggleExpand}
          style={styles.expandRow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.expandText, { color: theme.primary }]}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={theme.primary}
            style={{ marginLeft: 4 }}
          />
        </Pressable>

        {/* Bottom Actions Row */}
        <View style={[styles.bottomRow, { borderTopColor: theme.cardBorder }]}>
          {/* Vote Counter Pill */}
          <View
            style={[
              styles.votePill,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Feather
              name="activity"
              size={14}
              color={isVoted ? theme.gold : theme.muted}
            />
            <Text
              style={[
                styles.voteCountText,
                { color: isVoted ? theme.gold : theme.text },
              ]}
            >
              {idea.votes} {idea.votes === 1 ? 'vote' : 'votes'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {/* Share Button */}
            <Pressable
              onPress={handleShare}
              accessibilityLabel="Share idea to clipboard"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: theme.cardBorder,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="share-2" size={16} color={theme.accent} />
            </Pressable>

            {/* Upvote Button with Reanimated Spring Pop */}
            <Animated.View style={animatedVoteBtnStyle}>
              <Pressable
                onPress={handleUpvote}
                accessibilityLabel="Upvote startup idea"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.upvoteButton,
                  {
                    opacity: pressed ? 0.85 : 1,
                  },
                  theme.shadow.glow,
                ]}
              >
                <LinearGradient
                  colors={isVoted ? theme.gradients.success : theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upvoteGradient}
                >
                  <Feather
                    name={isVoted ? 'check' : 'arrow-up'}
                    size={15}
                    color="#FFFFFF"
                  />
                  <Text style={styles.upvoteButtonText}>
                    {isVoted ? 'Upvoted' : 'Upvote'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    marginHorizontal: 16,
    marginVertical: 7,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  swipeBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 24,
  },
  swipeLeftHint: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  swipeRightHint: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  swipeHintText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  cardInner: {
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleInfo: {
    flex: 1,
    paddingRight: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.3,
  },
  verdictChip: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  verdictText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  tagline: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_600SemiBold',
  },
  descContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
  },
  metricsBox: {
    gap: 6,
    paddingTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    width: 72,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  metricBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricVal: {
    width: 36,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textAlign: 'right',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    minHeight: 28,
  },
  expandText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  votePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    minHeight: 36,
  },
  voteCountText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvoteButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  upvoteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    gap: 6,
    minHeight: 44,
  },
  upvoteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
});
