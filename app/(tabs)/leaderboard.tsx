import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Header } from '../../components/Header';
import { RatingRing } from '../../components/RatingRing';
import { Shimmer } from '../../components/Shimmer';
import { Idea, useIdeaStore } from '../../store/useIdeaStore';
import { useTheme } from '../../theme/colors';
import { tap, warning, success as successHaptic } from '../../utils/haptics';
import { copyToClipboard } from '../../utils/clipboard';

type LeaderboardSort = 'votes' | 'rating';

export default function LeaderboardScreen() {
  const [sortMode, setSortMode] = useState<LeaderboardSort>('votes');
  const [segmentWidth, setSegmentWidth] = useState(0);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isWide = width >= 900;

  const ideas = useIdeaStore((s) => s.ideas);
  const votedIds = useIdeaStore((s) => s.votedIds);
  const upvoteIdea = useIdeaStore((s) => s.upvoteIdea);
  const showToast = useIdeaStore((s) => s.showToast);
  const theme = useTheme();

  // Floating gentle oscillation for the #1 Gold Winner
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [floatY]);

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // Sliding indicator for Leaderboard Sort Toggle
  const indicatorX = useSharedValue(0);
  const halfWidth = segmentWidth > 0 ? (segmentWidth - 8) / 2 : 0;

  useEffect(() => {
    if (halfWidth > 0) {
      indicatorX.value = withSpring(sortMode === 'votes' ? 0 : halfWidth, {
        damping: 18,
        stiffness: 220,
      });
    }
  }, [sortMode, halfWidth, indicatorX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: halfWidth,
  }));

  // Top 5 ideas sorted by selected mode
  const topFiveIdeas = useMemo(() => {
    return [...ideas]
      .sort((a, b) => (sortMode === 'votes' ? b.votes - a.votes : b.rating - a.rating))
      .slice(0, 5);
  }, [ideas, sortMode]);

  const firstPlace = topFiveIdeas[0];
  const secondPlace = topFiveIdeas[1];
  const thirdPlace = topFiveIdeas[2];
  const runnersUp = topFiveIdeas.slice(3, 5);

  const handleUpvote = (id: string, name: string) => {
    if (votedIds.includes(id)) {
      warning();
      showToast('You already upvoted this startup!', 'info');
      return;
    }
    tap('medium');
    const success = upvoteIdea(id);
    if (success) {
      successHaptic();
      showToast(`+1 Vote added to ${name}!`, 'success');
    }
  };

  const handleShare = async (idea: Idea, rank: number) => {
    tap('light');
    const content = `🏆 #${rank} on IdeaForge: ${idea.name} – ${idea.tagline} (Score: ${idea.rating}/100, ${idea.votes} votes)`;
    const copied = await copyToClipboard(content);
    if (copied) {
      showToast('Leaderboard rank copied to clipboard!', 'success');
    }
  };

  const handleToggleSort = (mode: LeaderboardSort) => {
    if (mode !== sortMode) {
      tap('light');
      setSortMode(mode);
    }
  };

  const handleSegmentLayout = (e: LayoutChangeEvent) => {
    setSegmentWidth(e.nativeEvent.layout.width);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Header />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? 40 : 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.webContentWrapper}>
          <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
            {/* Header Title Section */}
            <View style={[styles.headerTitleSection, isDesktop && styles.desktopHeaderTitleSection]}>
              <View style={styles.trophyIconRow}>
                <LinearGradient
                  colors={theme.gradients.gold}
                  style={[styles.trophyBadge, theme.shadow.glow]}
                >
                  <Feather name="award" size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.titleTextCol}>
                  <Text style={[styles.title, { color: theme.text }]}>Top 5 Hall of Fame</Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Leading startups ranked by community traction & AI score
                  </Text>
                </View>
              </View>

              {/* Votes | Rating Toggle with Sliding Indicator */}
              <View
                onLayout={handleSegmentLayout}
                style={[
                  styles.toggleContainer,
                  isDesktop && { minWidth: 280 },
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                {halfWidth > 0 && (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.slidingToggleIndicator, animatedIndicatorStyle]}
                  >
                    <LinearGradient
                      colors={theme.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.toggleGradient}
                    />
                  </Animated.View>
                )}

                <Pressable
                  onPress={() => handleToggleSort('votes')}
                  style={styles.toggleButton}
                  accessibilityRole="button"
                  accessibilityLabel="Rank by Most Votes"
                >
                  <Feather
                    name="activity"
                    size={14}
                    color={sortMode === 'votes' ? '#FFFFFF' : theme.muted}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      {
                        color: sortMode === 'votes' ? '#FFFFFF' : theme.muted,
                        fontFamily: sortMode === 'votes' ? 'Inter_700Bold' : 'Inter_600SemiBold',
                      },
                    ]}
                  >
                    By Most Votes
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleToggleSort('rating')}
                  style={styles.toggleButton}
                  accessibilityRole="button"
                  accessibilityLabel="Rank by AI Score"
                >
                  <Feather
                    name="star"
                    size={14}
                    color={sortMode === 'rating' ? '#FFFFFF' : theme.muted}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      {
                        color: sortMode === 'rating' ? '#FFFFFF' : theme.muted,
                        fontFamily: sortMode === 'rating' ? 'Inter_700Bold' : 'Inter_600SemiBold',
                      },
                    ]}
                  >
                    By AI Score
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Top 3 Gradient Podium with Animated Shine Sweep and Floating #1 */}
            <View
              style={[
                styles.podiumContainer,
                isDesktop && styles.desktopPodiumContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
                theme.shadow.soft,
              ]}
            >
              {/* Animated Shine Sweep on top of Podium */}
              <View style={styles.shineSweepWrapper}>
                <Shimmer height={3} width="100%" borderRadius={0} />
              </View>

              <View style={styles.podiumRow}>
                {/* 2nd Place: Silver (Left) */}
                {secondPlace && (
                  <View style={styles.podiumPillarCol}>
                    <View style={styles.podiumAvatar}>
                      <Text style={styles.podiumEmoji}>🥈</Text>
                      <RatingRing rating={secondPlace.rating} size={isDesktop ? 56 : 48} showLabel={false} />
                    </View>
                    <Text style={[styles.podiumName, { color: theme.text }]} numberOfLines={1}>
                      {secondPlace.name}
                    </Text>
                    <Text style={[styles.podiumVotes, { color: theme.silver }]}>
                      {sortMode === 'votes'
                        ? `${secondPlace.votes} votes`
                        : `${secondPlace.rating} score`}
                    </Text>
                    <LinearGradient
                      colors={theme.gradients.silver}
                      style={[styles.pillar, isDesktop ? styles.pillarSilverDesktop : styles.pillarSilver]}
                    >
                      <Text style={styles.pillarRankNumber}>#2</Text>
                      <Pressable
                        onPress={() => handleUpvote(secondPlace.id, secondPlace.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Upvote ${secondPlace.name}`}
                        style={[
                          styles.podiumVoteBtn,
                          {
                            backgroundColor: votedIds.includes(secondPlace.id)
                              ? theme.success
                              : 'rgba(0,0,0,0.3)',
                          },
                        ]}
                      >
                        <Feather
                          name={votedIds.includes(secondPlace.id) ? 'check' : 'arrow-up'}
                          size={14}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    </LinearGradient>
                  </View>
                )}

                {/* 1st Place: Gold (Center - Tallest with gentle Floating Animation) */}
                {firstPlace && (
                  <Animated.View style={[styles.podiumPillarCol, styles.centerPillarCol, animatedFloatStyle]}>
                    <View style={styles.podiumAvatar}>
                      <Text style={styles.podiumEmojiGold}>🥇</Text>
                      <RatingRing rating={firstPlace.rating} size={isDesktop ? 68 : 58} showLabel={false} />
                    </View>
                    <Text style={[styles.podiumNameGold, { color: theme.text }]} numberOfLines={1}>
                      {firstPlace.name}
                    </Text>
                    <Text style={[styles.podiumVotes, { color: theme.gold }]}>
                      {sortMode === 'votes'
                        ? `${firstPlace.votes} votes`
                        : `${firstPlace.rating} score`}
                    </Text>
                    <LinearGradient
                      colors={theme.gradients.gold}
                      style={[styles.pillar, isDesktop ? styles.pillarGoldDesktop : styles.pillarGold]}
                    >
                      <Text style={styles.pillarRankNumberGold}>#1</Text>
                      <Pressable
                        onPress={() => handleUpvote(firstPlace.id, firstPlace.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Upvote ${firstPlace.name}`}
                        style={[
                          styles.podiumVoteBtn,
                          {
                            backgroundColor: votedIds.includes(firstPlace.id)
                              ? theme.success
                              : 'rgba(0,0,0,0.3)',
                          },
                        ]}
                      >
                        <Feather
                          name={votedIds.includes(firstPlace.id) ? 'check' : 'arrow-up'}
                          size={15}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* 3rd Place: Bronze (Right) */}
                {thirdPlace && (
                  <View style={styles.podiumPillarCol}>
                    <View style={styles.podiumAvatar}>
                      <Text style={styles.podiumEmoji}>🥉</Text>
                      <RatingRing rating={thirdPlace.rating} size={isDesktop ? 54 : 46} showLabel={false} />
                    </View>
                    <Text style={[styles.podiumName, { color: theme.text }]} numberOfLines={1}>
                      {thirdPlace.name}
                    </Text>
                    <Text style={[styles.podiumVotes, { color: theme.bronze }]}>
                      {sortMode === 'votes'
                        ? `${thirdPlace.votes} votes`
                        : `${thirdPlace.rating} score`}
                    </Text>
                    <LinearGradient
                      colors={theme.gradients.bronze}
                      style={[styles.pillar, isDesktop ? styles.pillarBronzeDesktop : styles.pillarBronze]}
                    >
                      <Text style={styles.pillarRankNumber}>#3</Text>
                      <Pressable
                        onPress={() => handleUpvote(thirdPlace.id, thirdPlace.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Upvote ${thirdPlace.name}`}
                        style={[
                          styles.podiumVoteBtn,
                          {
                            backgroundColor: votedIds.includes(thirdPlace.id)
                              ? theme.success
                              : 'rgba(0,0,0,0.3)',
                          },
                        ]}
                      >
                        <Feather
                          name={votedIds.includes(thirdPlace.id) ? 'check' : 'arrow-up'}
                          size={14}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </View>

            {/* Cards 4 and 5 Below the Podium */}
            {runnersUp.length > 0 && (
              <View style={styles.runnersUpSection}>
                <Text style={[styles.runnersUpSectionTitle, { color: theme.text }]}>
                  Contenders & Rising Startups
                </Text>

                <View style={isWide ? styles.desktopContendersRow : undefined}>
                  {runnersUp.map((item, index) => {
                    const rank = index + 4;
                    const isVoted = votedIds.includes(item.id);

                    return (
                      <Animated.View
                        key={item.id}
                        entering={FadeInDown.delay(index * 80 + 200).springify().damping(14)}
                        style={[
                          styles.runnerCard,
                          isWide && styles.desktopRunnerCard,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.cardBorder,
                          },
                          theme.shadow.soft,
                        ]}
                      >
                        <View style={styles.runnerLeft}>
                          <View
                            style={[
                              styles.runnerRankBadge,
                              {
                                backgroundColor: theme.cardSecondary,
                                borderColor: theme.cardBorder,
                              },
                            ]}
                          >
                            <Text style={[styles.runnerRankText, { color: theme.muted }]}>
                              #{rank}
                            </Text>
                          </View>
                          <View style={styles.runnerDetails}>
                            <Text style={[styles.runnerName, { color: theme.text }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={[styles.runnerTagline, { color: theme.textSecondary }]} numberOfLines={1}>
                              {item.tagline}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.runnerRight}>
                          <RatingRing rating={item.rating} size={46} showLabel={false} />

                          <Pressable
                            onPress={() => handleShare(item, rank)}
                            accessibilityRole="button"
                            accessibilityLabel="Share rank"
                            style={({ pressed }) => [
                              styles.runnerActionBtn,
                              {
                                backgroundColor: theme.cardSecondary,
                                borderColor: theme.cardBorder,
                                opacity: pressed ? 0.7 : 1,
                              },
                            ]}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Feather name="share-2" size={15} color={theme.accent} />
                          </Pressable>

                          <Pressable
                            onPress={() => handleUpvote(item.id, item.name)}
                            accessibilityRole="button"
                            accessibilityLabel={`Upvote ${item.name}`}
                            style={({ pressed }) => [
                              styles.runnerUpvoteBtn,
                              {
                                backgroundColor: isVoted ? theme.success : theme.primary,
                                opacity: pressed ? 0.8 : 1,
                              },
                            ]}
                          >
                            <Feather
                              name={isVoted ? 'check' : 'arrow-up'}
                              size={13}
                              color="#FFFFFF"
                            />
                            <Text style={styles.runnerUpvoteText}>
                              {sortMode === 'votes' ? item.votes : item.rating}
                            </Text>
                          </Pressable>
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  webContentWrapper: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  headerTitleSection: {
    marginBottom: 18,
    gap: 12,
  },
  desktopHeaderTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trophyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextCol: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1.2,
    position: 'relative',
  },
  slidingToggleIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1,
  },
  toggleGradient: {
    flex: 1,
    borderRadius: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    zIndex: 2,
    minHeight: 40,
  },
  toggleBtnText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  podiumContainer: {
    borderRadius: 24,
    borderWidth: 1.2,
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  desktopPodiumContainer: {
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 28,
  },
  shineSweepWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 8,
  },
  podiumPillarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
  },
  centerPillarCol: {
    flex: 1.15,
  },
  podiumAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  podiumEmojiGold: {
    fontSize: 32,
    marginBottom: 2,
  },
  podiumName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumNameGold: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumVotes: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  pillar: {
    width: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 10,
  },
  pillarGold: {
    height: 135,
  },
  pillarGoldDesktop: {
    height: 170,
  },
  pillarSilver: {
    height: 105,
  },
  pillarSilverDesktop: {
    height: 130,
  },
  pillarBronze: {
    height: 85,
  },
  pillarBronzeDesktop: {
    height: 105,
  },
  pillarRankNumber: {
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 4,
  },
  pillarRankNumberGold: {
    fontSize: 26,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 6,
  },
  podiumVoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  runnersUpSection: {
    marginTop: 4,
  },
  runnersUpSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  desktopContendersRow: {
    flexDirection: 'row',
    gap: 16,
  },
  runnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.2,
    marginBottom: 10,
  },
  desktopRunnerCard: {
    flex: 1,
    marginBottom: 0,
  },
  runnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  runnerRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  runnerRankText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  runnerDetails: {
    flex: 1,
  },
  runnerName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  runnerTagline: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  runnerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  runnerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  runnerUpvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 5,
    minHeight: 38,
  },
  runnerUpvoteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});
