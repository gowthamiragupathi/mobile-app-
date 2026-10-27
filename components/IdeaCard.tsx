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
      showToast('You already signaled support for this venture!', 'info');
      return;
    }

    tap('medium');
    voteScale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );

    const success = upvoteIdea(idea.id);
    if (success) {
      successHaptic();
      showToast(`+1 Syndicate vote logged for ${idea.name}`, 'success');
    }
  };

  const handleShare = async () => {
    tap('light');
    const content = `${idea.name} [${idea.category || 'Tech'}] – ${idea.tagline} (AI Deal Score: ${idea.rating}/100, ${idea.tam || ''})`;
    const copied = await copyToClipboard(content);
    if (copied) {
      showToast('Deal summary copied to clipboard', 'success');
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
            panX.value = withSpring(0, { damping: 15, stiffness: 180 });
          },
          onPanResponderTerminate: () => {
            panX.value = withSpring(0, { damping: 15, stiffness: 180 });
          },
        })
  ).current;

  const handleToggleExpand = () => {
    tap('light');
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setExpanded(!expanded);
  };

  const voteButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: voteScale.value }],
    };
  });

  const animatedCardSlide = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: panX.value }],
    };
  });

  // 2-letter initials for company badge
  const initials = idea.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(15)}
      style={[styles.cardOuter, style]}
    >
      {/* Background hint revealed on swipe */}
      {Platform.OS !== 'web' && (
        <View style={styles.swipeBackground}>
          <View style={[styles.swipeLeftHint, { backgroundColor: theme.primary }]}>
            <Feather name="arrow-up-circle" size={20} color="#FFFFFF" />
            <Text style={styles.swipeHintText}>UPVOTE</Text>
          </View>
          <View style={[styles.swipeRightHint, { backgroundColor: theme.accent }]}>
            <Feather name="share-2" size={20} color="#FFFFFF" />
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
            borderColor: isVoted ? theme.primary : theme.cardBorder,
          },
          theme.shadow.card,
          animatedCardSlide,
        ]}
      >
        {/* Top Header Row with Company Avatar, Badges & Rating */}
        <View style={styles.topRow}>
          <View style={styles.headerLeftCol}>
            <View style={styles.badgeRow}>
              {/* Initials Avatar */}
              <LinearGradient
                colors={theme.gradients.surface}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.companyAvatar, { borderColor: theme.cardBorder }]}
              >
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {initials || 'CO'}
                </Text>
              </LinearGradient>

              <View style={styles.headerTitleGroup}>
                <View style={styles.nameBadgesRow}>
                  <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                    {idea.name}
                  </Text>
                  {Boolean(idea.stage) && (
                    <View style={[styles.stageBadge, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                      <Text style={[styles.stageBadgeText, { color: theme.muted }]}>
                        {idea.stage}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Category & TAM Tags */}
                <View style={styles.tagsRow}>
                  <View style={[styles.tagPill, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                    <View style={[styles.tagDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.tagPillText, { color: theme.textSecondary }]}>
                      {idea.category || 'Tech'}
                    </Text>
                  </View>
                  {Boolean(idea.tam) && (
                    <View style={[styles.tagPill, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                      <Feather name="globe" size={10} color={theme.accent} />
                      <Text style={[styles.tagPillText, { color: theme.textSecondary }]}>
                        {idea.tam}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Rating Ring on Right */}
          <View style={styles.ratingCol}>
            <RatingRing rating={idea.rating} size={54} delay={index * 40} />
          </View>
        </View>

        {/* Tagline */}
        <Text style={[styles.tagline, { color: theme.text }]} numberOfLines={2}>
          {idea.tagline}
        </Text>

        {/* Verdict Banner */}
        {Boolean(idea.verdict) && (
          <View
            style={[
              styles.verdictBanner,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.verdictContent}>
              <Feather name="shield" size={12} color={theme.primary} />
              <Text style={[styles.verdictText, { color: theme.text }]}>
                {idea.verdict}
              </Text>
            </View>
            {Boolean(idea.founderSignal) && (
              <Text style={[styles.founderSignalText, { color: theme.muted }]} numberOfLines={1}>
                {idea.founderSignal}
              </Text>
            )}
          </View>
        )}

        {/* Mini 3-Metric Score Bars (Visible for quick glance) */}
        {idea.metrics && (
          <View style={[styles.miniMetricsStrip, { borderColor: theme.cardBorder }]}>
            <View style={styles.miniMetricItem}>
              <View style={styles.miniMetricHeader}>
                <Text style={[styles.miniMetricLabel, { color: theme.muted }]}>Market</Text>
                <Text style={[styles.miniMetricNum, { color: theme.text }]}>{idea.metrics.market}%</Text>
              </View>
              <View style={[styles.miniBarBg, { backgroundColor: theme.cardSecondary }]}>
                <View style={[styles.miniBarFill, { width: `${idea.metrics.market}%`, backgroundColor: theme.primary }]} />
              </View>
            </View>

            <View style={styles.miniMetricItem}>
              <View style={styles.miniMetricHeader}>
                <Text style={[styles.miniMetricLabel, { color: theme.muted }]}>Moat</Text>
                <Text style={[styles.miniMetricNum, { color: theme.text }]}>{idea.metrics.innovation}%</Text>
              </View>
              <View style={[styles.miniBarBg, { backgroundColor: theme.cardSecondary }]}>
                <View style={[styles.miniBarFill, { width: `${idea.metrics.innovation}%`, backgroundColor: theme.accent }]} />
              </View>
            </View>

            <View style={styles.miniMetricItem}>
              <View style={styles.miniMetricHeader}>
                <Text style={[styles.miniMetricLabel, { color: theme.muted }]}>Execution</Text>
                <Text style={[styles.miniMetricNum, { color: theme.text }]}>{idea.metrics.feasibility}%</Text>
              </View>
              <View style={[styles.miniBarBg, { backgroundColor: theme.cardSecondary }]}>
                <View style={[styles.miniBarFill, { width: `${idea.metrics.feasibility}%`, backgroundColor: theme.success }]} />
              </View>
            </View>
          </View>
        )}

        {/* Expandable Detailed Deck Audit */}
        {expanded && (
          <View style={[styles.descContainer, { borderTopColor: theme.cardBorder }]}>
            <View style={styles.auditHeaderRow}>
              <Feather name="file-text" size={13} color={theme.primary} />
              <Text style={[styles.auditTitle, { color: theme.text }]}>Deal Summary & Pitch</Text>
            </View>
            <Text style={[styles.descText, { color: theme.textSecondary }]}>
              {idea.description}
            </Text>

            {Boolean(idea.thesis) && (
              <View style={[styles.thesisCard, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                <View style={styles.thesisHeader}>
                  <Feather name="check-circle" size={12} color={theme.success} />
                  <Text style={[styles.thesisTitle, { color: theme.text }]}>Investment Committee Thesis</Text>
                </View>
                <Text style={[styles.thesisText, { color: theme.muted }]}>
                  {idea.thesis}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer Row: Expand Toggle, Share & Syndicate Upvote Button */}
        <View style={[styles.bottomRow, { borderTopColor: theme.cardBorder }]}>
          <Pressable
            onPress={handleToggleExpand}
            style={styles.expandBtn}
            accessibilityRole="button"
          >
            <Text style={[styles.expandText, { color: theme.muted }]}>
              {expanded ? 'Less Details' : 'Full Audit'}
            </Text>
            <Feather
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={theme.muted}
            />
          </Pressable>

          <View style={styles.actionsRight}>
            <Pressable
              onPress={handleShare}
              accessibilityLabel="Share deal summary"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.shareIconBtn,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: theme.cardBorder,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Feather name="share-2" size={14} color={theme.textSecondary} />
            </Pressable>

            <Animated.View style={voteButtonAnimatedStyle}>
              <Pressable
                onPress={handleUpvote}
                accessibilityRole="button"
                accessibilityLabel={`Upvote ${idea.name}`}
                style={({ pressed }) => [
                  styles.upvoteBtn,
                  isVoted
                    ? [styles.upvotedActive, { backgroundColor: theme.cardSecondary, borderColor: theme.primary }]
                    : [styles.upvoteDefault, { backgroundColor: theme.primary }],
                  {
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather
                  name="arrow-up"
                  size={14}
                  color={isVoted ? theme.primary : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.upvoteCountText,
                    {
                      color: isVoted ? theme.primary : '#FFFFFF',
                      fontFamily: isVoted ? 'Inter_700Bold' : 'Inter_600SemiBold',
                    },
                  ]}
                >
                  {idea.votes}
                </Text>
                <Text
                  style={[
                    styles.upvoteLabel,
                    { color: isVoted ? theme.primary : 'rgba(255,255,255,0.85)' },
                  ]}
                >
                  {isVoted ? 'Backed' : 'Back'}
                </Text>
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
    marginBottom: 16,
    position: 'relative',
    width: '100%',
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  swipeLeftHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  swipeRightHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  swipeHintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  cardInner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeftCol: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  headerTitleGroup: {
    flex: 1,
  },
  nameBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  stageBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
    borderWidth: 1,
  },
  stageBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tagPillText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
  ratingCol: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    letterSpacing: -0.1,
  },
  verdictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  verdictContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verdictText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.1,
  },
  founderSignalText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    maxWidth: 160,
  },
  miniMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  miniMetricItem: {
    flex: 1,
  },
  miniMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniMetricLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
  miniMetricNum: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  miniBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  descContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  auditTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  descText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 19,
  },
  thesisCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  thesisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  thesisTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  thesisText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    minHeight: 32,
  },
  upvoteDefault: {},
  upvotedActive: {
    borderWidth: 1,
  },
  upvoteCountText: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  upvoteLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});
