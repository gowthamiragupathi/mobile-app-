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
        withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
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
      showToast('You have already committed backing for this deal.', 'info');
      return;
    }
    tap('medium');
    const success = upvoteIdea(id);
    if (success) {
      successHaptic();
      showToast(`+1 Syndicate vote logged for ${name}!`, 'success');
    }
  };

  const handleShare = async (idea: Idea, rank: number) => {
    tap('light');
    const content = `🏆 #${rank} on IdeaForge Syndicate: ${idea.name} (${idea.category || 'Tech'}) – ${idea.tagline} (AI Deal Score: ${idea.rating}/100, ${idea.votes} Backers, ${idea.tam || 'Global TAM'})`;
    const copied = await copyToClipboard(content);
    if (copied) {
      showToast('Deal memo summary copied to clipboard!', 'success');
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
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
                  style={[styles.trophyBadge, theme.shadow.soft]}
                >
                  <Feather name="award" size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.titleTextCol}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={[styles.title, { color: theme.text }]}>Syndicate Leaderboard</Text>
                    <View style={[styles.liveTag, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                      <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
                      <Text style={[styles.liveTagText, { color: theme.success }]}>Q4 TOP DEALS</Text>
                    </View>
                  </View>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Top venture deals ranked by institutional backing and partner evaluation scores
                  </Text>
                </View>
              </View>

              {/* Votes | Rating Toggle with Sliding Indicator */}
              <View
                onLayout={handleSegmentLayout}
                style={[
                  styles.toggleContainer,
                  isDesktop && { minWidth: 320 },
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
                  accessibilityLabel="Rank by Syndicate Backers"
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
                    By Backers
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleToggleSort('rating')}
                  style={styles.toggleButton}
                  accessibilityRole="button"
                  accessibilityLabel="Rank by Partner Deal Score"
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
                    By Partner Score
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
                theme.shadow.card,
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
                      {/* Initials Avatar */}
                      <LinearGradient
                        colors={theme.gradients.silver}
                        style={[styles.podiumAvatarCircle, { borderColor: theme.cardBorder }]}
                      >
                        <Text style={styles.podiumAvatarInitials}>
                          {getInitials(secondPlace.name)}
                        </Text>
                      </LinearGradient>
                      <View style={[styles.metallicBadge, { backgroundColor: '#64748B' }]}>
                        <Text style={styles.metallicBadgeText}>#2 SILVER</Text>
                      </View>
                    </View>

                    <Text style={[styles.podiumName, { color: theme.text }]} numberOfLines={1}>
                      {secondPlace.name}
                    </Text>

                    {/* Sector & TAM Pills */}
                    <View style={styles.podiumTagsRow}>
                      <View style={[styles.microTag, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.microTagText, { color: theme.textSecondary }]}>
                          {secondPlace.category || 'Tech'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.podiumVotes, { color: theme.textSecondary }]}>
                      {sortMode === 'votes'
                        ? `${secondPlace.votes} Backers`
                        : `${secondPlace.rating}/100 Score`}
                    </Text>

                    <LinearGradient
                      colors={theme.gradients.silver}
                      style={[styles.pillar, isDesktop ? styles.pillarSilverDesktop : styles.pillarSilver]}
                    >
                      <View style={styles.pillarHeader}>
                        <Text style={styles.pillarRankNumber}>#2</Text>
                        <RatingRing rating={secondPlace.rating} size={38} showLabel={false} />
                      </View>

                      <Pressable
                        onPress={() => handleUpvote(secondPlace.id, secondPlace.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Back ${secondPlace.name}`}
                        style={[
                          styles.podiumBackBtn,
                          {
                            backgroundColor: votedIds.includes(secondPlace.id)
                              ? theme.success
                              : 'rgba(15, 23, 42, 0.75)',
                          },
                        ]}
                      >
                        <Feather
                          name={votedIds.includes(secondPlace.id) ? 'check' : 'arrow-up'}
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text style={styles.podiumBackBtnText}>
                          {votedIds.includes(secondPlace.id) ? 'Backed' : 'Back Deal'}
                        </Text>
                      </Pressable>
                    </LinearGradient>
                  </View>
                )}

                {/* 1st Place: Gold (Center - Tallest with gentle Floating Animation) */}
                {firstPlace && (
                  <Animated.View style={[styles.podiumPillarCol, styles.centerPillarCol, animatedFloatStyle]}>
                    <View style={styles.podiumAvatar}>
                      {/* Initials Avatar Gold */}
                      <LinearGradient
                        colors={theme.gradients.gold}
                        style={[styles.podiumAvatarCircleGold, theme.shadow.soft]}
                      >
                        <Text style={styles.podiumAvatarInitialsGold}>
                          {getInitials(firstPlace.name)}
                        </Text>
                      </LinearGradient>
                      <View style={[styles.metallicBadgeGold, { backgroundColor: '#D97706' }]}>
                        <Feather name="zap" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.metallicBadgeTextGold}>#1 SYNDICATE LEAD</Text>
                      </View>
                    </View>

                    <Text style={[styles.podiumNameGold, { color: theme.text }]} numberOfLines={1}>
                      {firstPlace.name}
                    </Text>

                    {/* Sector & TAM Pills */}
                    <View style={styles.podiumTagsRow}>
                      <View style={[styles.microTag, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.microTagText, { color: theme.primary, fontFamily: 'Inter_700Bold' }]}>
                          {firstPlace.category || 'Tech'}
                        </Text>
                      </View>
                      {Boolean(firstPlace.tam) && (
                        <View style={[styles.microTag, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                          <Text style={[styles.microTagText, { color: theme.accent }]}>
                            {firstPlace.tam}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.podiumVotesGold, { color: theme.gold }]}>
                      {sortMode === 'votes'
                        ? `${firstPlace.votes} Syndicate Backers`
                        : `${firstPlace.rating}/100 Partner Score`}
                    </Text>

                    <LinearGradient
                      colors={theme.gradients.gold}
                      style={[styles.pillar, isDesktop ? styles.pillarGoldDesktop : styles.pillarGold]}
                    >
                      <View style={styles.pillarHeader}>
                        <Text style={styles.pillarRankNumberGold}>#1</Text>
                        <RatingRing rating={firstPlace.rating} size={44} showLabel={false} />
                      </View>

                      <Pressable
                        onPress={() => handleUpvote(firstPlace.id, firstPlace.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Back ${firstPlace.name}`}
                        style={[
                          styles.podiumBackBtnGold,
                          {
                            backgroundColor: votedIds.includes(firstPlace.id)
                              ? theme.success
                              : 'rgba(15, 23, 42, 0.85)',
                          },
                        ]}
                      >
                        <Feather
                          name={votedIds.includes(firstPlace.id) ? 'check' : 'arrow-up'}
                          size={14}
                          color="#FFFFFF"
                        />
                        <Text style={styles.podiumBackBtnTextGold}>
                          {votedIds.includes(firstPlace.id) ? 'Backed' : 'Back Deal'}
                        </Text>
                      </Pressable>
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* 3rd Place: Bronze (Right) */}
                {thirdPlace && (
                  <View style={styles.podiumPillarCol}>
                    <View style={styles.podiumAvatar}>
                      {/* Initials Avatar Bronze */}
                      <LinearGradient
                        colors={theme.gradients.bronze}
                        style={[styles.podiumAvatarCircle, { borderColor: theme.cardBorder }]}
                      >
                        <Text style={styles.podiumAvatarInitials}>
                          {getInitials(thirdPlace.name)}
                        </Text>
                      </LinearGradient>
                      <View style={[styles.metallicBadge, { backgroundColor: '#B45309' }]}>
                        <Text style={styles.metallicBadgeText}>#3 BRONZE</Text>
                      </View>
                    </View>

                    <Text style={[styles.podiumName, { color: theme.text }]} numberOfLines={1}>
                      {thirdPlace.name}
                    </Text>

                    {/* Sector & TAM Pills */}
                    <View style={styles.podiumTagsRow}>
                      <View style={[styles.microTag, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.microTagText, { color: theme.textSecondary }]}>
                          {thirdPlace.category || 'Tech'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.podiumVotes, { color: theme.textSecondary }]}>
                      {sortMode === 'votes'
                        ? `${thirdPlace.votes} Backers`
                        : `${thirdPlace.rating}/100 Score`}
                    </Text>

                    <LinearGradient
                      colors={theme.gradients.bronze}
                      style={[styles.pillar, isDesktop ? styles.pillarBronzeDesktop : styles.pillarBronze]}
                    >
                      <View style={styles.pillarHeader}>
                        <Text style={styles.pillarRankNumber}>#3</Text>
                        <RatingRing rating={thirdPlace.rating} size={36} showLabel={false} />
                      </View>

                      <Pressable
                        onPress={() => handleUpvote(thirdPlace.id, thirdPlace.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Back ${thirdPlace.name}`}
                        style={[
                          styles.podiumBackBtn,
                          {
                            backgroundColor: votedIds.includes(thirdPlace.id)
                              ? theme.success
                              : 'rgba(15, 23, 42, 0.75)',
                          },
                        ]}
                      >
                        <Feather
                          name={votedIds.includes(thirdPlace.id) ? 'check' : 'arrow-up'}
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text style={styles.podiumBackBtnText}>
                          {votedIds.includes(thirdPlace.id) ? 'Backed' : 'Back Deal'}
                        </Text>
                      </Pressable>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </View>

            {/* Cards 4 and 5 Below the Podium */}
            {runnersUp.length > 0 && (
              <View style={styles.runnersUpSection}>
                <View style={styles.contendersHeaderRow}>
                  <Text style={[styles.runnersUpSectionTitle, { color: theme.text }]}>
                    Syndicate Contenders & Rising Deals
                  </Text>
                  <Text style={[styles.contendersCount, { color: theme.muted }]}>
                    Positions #4 – #5
                  </Text>
                </View>

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
                          theme.shadow.card,
                        ]}
                      >
                        <View style={styles.runnerLeft}>
                          {/* Rank Circle */}
                          <View
                            style={[
                              styles.runnerRankBadge,
                              {
                                backgroundColor: theme.cardSecondary,
                                borderColor: theme.cardBorder,
                              },
                            ]}
                          >
                            <Text style={[styles.runnerRankText, { color: theme.textSecondary }]}>
                              #{rank}
                            </Text>
                          </View>

                          {/* Initials Avatar */}
                          <LinearGradient
                            colors={theme.gradients.surface}
                            style={[styles.runnerAvatar, { borderColor: theme.cardBorder }]}
                          >
                            <Text style={[styles.runnerAvatarText, { color: theme.primary }]}>
                              {getInitials(item.name)}
                            </Text>
                          </LinearGradient>

                          <View style={styles.runnerDetails}>
                            <View style={styles.runnerNameRow}>
                              <Text style={[styles.runnerName, { color: theme.text }]} numberOfLines={1}>
                                {item.name}
                              </Text>
                              {Boolean(item.stage) && (
                                <View style={[styles.runnerStageBadge, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                                  <Text style={[styles.runnerStageText, { color: theme.muted }]}>
                                    {item.stage}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Category & TAM */}
                            <View style={styles.runnerMetaRow}>
                              <Text style={[styles.runnerCategory, { color: theme.textSecondary }]}>
                                {item.category || 'Tech'}
                              </Text>
                              {Boolean(item.tam) && (
                                <>
                                  <Text style={[styles.dotSep, { color: theme.muted }]}>•</Text>
                                  <Text style={[styles.runnerTam, { color: theme.accent }]}>
                                    {item.tam}
                                  </Text>
                                </>
                              )}
                            </View>

                            <Text style={[styles.runnerTagline, { color: theme.textSecondary }]} numberOfLines={1}>
                              {item.tagline}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.runnerRight}>
                          <RatingRing rating={item.rating} size={44} showLabel={false} />

                          <Pressable
                            onPress={() => handleShare(item, rank)}
                            accessibilityRole="button"
                            accessibilityLabel="Share memo"
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
                            accessibilityLabel={`Back ${item.name}`}
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
                              {sortMode === 'votes' ? `${item.votes} Backers` : `${item.rating} Score`}
                            </Text>
                          </Pressable>
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Institutional Syndicate Banner */}
            <View
              style={[
                styles.syndicateNoticeBanner,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Feather name="shield" size={16} color={theme.primary} />
              <Text style={[styles.syndicateNoticeText, { color: theme.textSecondary }]}>
                Rankings represent live syndicate interest and weighted partner memos across Market TAM, Moat, and Execution Velocity.
              </Text>
            </View>
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
    marginBottom: 20,
    gap: 14,
  },
  desktopHeaderTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trophyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trophyBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextCol: {
    justifyContent: 'center',
    gap: 2,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.4,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveTagText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
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
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  desktopPodiumContainer: {
    paddingTop: 32,
    paddingBottom: 22,
    paddingHorizontal: 30,
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
    paddingTop: 12,
  },
  podiumPillarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
  },
  centerPillarCol: {
    flex: 1.2,
  },
  podiumAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  podiumAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  podiumAvatarInitials: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
  },
  podiumAvatarCircleGold: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  podiumAvatarInitialsGold: {
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
  },
  metallicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metallicBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  metallicBadgeGold: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metallicBadgeTextGold: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  podiumName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  podiumNameGold: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    textAlign: 'center',
    marginBottom: 3,
  },
  podiumTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  microTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  microTagText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  podiumVotes: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  podiumVotesGold: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
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
    paddingHorizontal: 8,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
  },
  pillarGold: {
    height: 145,
  },
  pillarGoldDesktop: {
    height: 180,
  },
  pillarSilver: {
    height: 115,
  },
  pillarSilverDesktop: {
    height: 140,
  },
  pillarBronze: {
    height: 95,
  },
  pillarBronzeDesktop: {
    height: 115,
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
  podiumBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
    width: '100%',
  },
  podiumBackBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  podiumBackBtnGold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 5,
    width: '100%',
  },
  podiumBackBtnTextGold: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_800ExtraBold',
  },
  runnersUpSection: {
    marginTop: 6,
    marginBottom: 20,
  },
  contendersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  runnersUpSectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  contendersCount: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  runnerRankText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  runnerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  runnerAvatarText: {
    fontSize: 13,
    fontFamily: 'Inter_800ExtraBold',
  },
  runnerDetails: {
    flex: 1,
  },
  runnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  runnerName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  runnerStageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  runnerStageText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  runnerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  runnerCategory: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  dotSep: {
    marginHorizontal: 5,
    fontSize: 11,
  },
  runnerTam: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
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
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 5,
    minHeight: 38,
  },
  runnerUpvoteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  syndicateNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  syndicateNoticeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    lineHeight: 18,
  },
});
