import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Header } from '../../components/Header';
import { IdeaCard } from '../../components/IdeaCard';
import { useIdeaStore } from '../../store/useIdeaStore';
import { useTheme } from '../../theme/colors';
import { tap } from '../../utils/haptics';

type SortMode = 'rating' | 'votes';

export default function IdeasScreen() {
  const [sortMode, setSortMode] = useState<SortMode>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isWide = width >= 960;

  const ideas = useIdeaStore((s) => s.ideas);
  const theme = useTheme();

  // Sliding indicator for Segmented Control
  const indicatorX = useSharedValue(0);

  const halfWidth = segmentWidth > 0 ? (segmentWidth - 8) / 2 : 0;

  useEffect(() => {
    if (halfWidth > 0) {
      indicatorX.value = withSpring(sortMode === 'rating' ? 0 : halfWidth, {
        damping: 18,
        stiffness: 220,
      });
    }
  }, [sortMode, halfWidth, indicatorX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: halfWidth,
  }));

  // Stats calculation
  const totalVotes = useMemo(() => {
    return ideas.reduce((acc, curr) => acc + curr.votes, 0);
  }, [ideas]);

  const avgScore = useMemo(() => {
    if (ideas.length === 0) return 0;
    const sum = ideas.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round(sum / ideas.length);
  }, [ideas]);

  // Animated Count-Up for Stats
  const prevStats = useRef({ ideas: ideas.length, votes: totalVotes, avg: avgScore });
  const [displayIdeasCount, setDisplayIdeasCount] = useState(ideas.length);
  const [displayVotesCount, setDisplayVotesCount] = useState(totalVotes);
  const [displayAvgScore, setDisplayAvgScore] = useState(avgScore);

  useEffect(() => {
    let frameId: number;
    const startTime = Date.now();
    const duration = 800;

    const startIdeas = prevStats.current.ideas;
    const startVotes = prevStats.current.votes;
    const startAvg = prevStats.current.avg;

    const targetIdeas = ideas.length;
    const targetVotes = totalVotes;
    const targetAvg = avgScore;

    const step = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setDisplayIdeasCount(Math.round(startIdeas + (targetIdeas - startIdeas) * ease));
      setDisplayVotesCount(Math.round(startVotes + (targetVotes - startVotes) * ease));
      setDisplayAvgScore(Math.round(startAvg + (targetAvg - startAvg) * ease));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        prevStats.current = { ideas: targetIdeas, votes: targetVotes, avg: targetAvg };
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [ideas.length, totalVotes, avgScore]);

  // Filtered & Sorted Ideas
  const filteredIdeas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = ideas.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );

    return list.sort((a, b) => {
      if (sortMode === 'rating') {
        return b.rating - a.rating;
      }
      return b.votes - a.votes;
    });
  }, [ideas, searchQuery, sortMode]);

  const handleSortChange = (mode: SortMode) => {
    if (mode !== sortMode) {
      tap('light');
      setSortMode(mode);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    tap('medium');
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleSegmentLayout = (e: LayoutChangeEvent) => {
    setSegmentWidth(e.nativeEvent.layout.width);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Header />

      <View style={styles.webContentWrapper}>
        <FlatList
          key={isWide ? 'desktop-grid-2' : 'mobile-list-1'}
          numColumns={isWide ? 2 : 1}
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <IdeaCard
              idea={item}
              index={index}
              style={isWide ? { flex: 1, marginHorizontal: 8 } : undefined}
            />
          )}
          columnWrapperStyle={isWide ? styles.gridColumnWrapper : undefined}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: isDesktop ? 40 : 110 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary, theme.accent]}
            />
          }
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Dashboard Stats Strip (Responsive for Web & Mobile) */}
              <View style={styles.statsStripContainer}>
                {isDesktop ? (
                  // Desktop 3-Card Metrics Row
                  <View style={styles.desktopStatsRow}>
                    <View
                      style={[
                        styles.desktopStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.soft,
                      ]}
                    >
                      <View style={[styles.statIconBadge, { backgroundColor: theme.cardSecondary }]}>
                        <Feather name="layers" size={20} color={theme.primary} />
                      </View>
                      <View style={styles.statContentCol}>
                        <Text style={[styles.statValue, { color: theme.text }]}>
                          {displayIdeasCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.muted }]}>
                          Total Ideas Evaluated
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.desktopStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.soft,
                      ]}
                    >
                      <View style={[styles.statIconBadge, { backgroundColor: theme.cardSecondary }]}>
                        <Feather name="activity" size={20} color={theme.gold} />
                      </View>
                      <View style={styles.statContentCol}>
                        <Text style={[styles.statValue, { color: theme.gold }]}>
                          {displayVotesCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.muted }]}>
                          Community Votes Cast
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.desktopStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.soft,
                      ]}
                    >
                      <View style={[styles.statIconBadge, { backgroundColor: theme.cardSecondary }]}>
                        <Feather name="award" size={20} color={theme.accent} />
                      </View>
                      <View style={styles.statContentCol}>
                        <Text style={[styles.statValue, { color: theme.accent }]}>
                          {displayAvgScore}/100
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.muted }]}>
                          Average AI Score
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  // Mobile Single-Pill Stats Strip
                  <View
                    style={[
                      styles.statsStrip,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder,
                      },
                      theme.shadow.soft,
                    ]}
                  >
                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { color: theme.text }]}>
                        {displayIdeasCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.muted }]}>
                        Total Ideas
                      </Text>
                    </View>

                    <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { color: theme.gold }]}>
                        {displayVotesCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.muted }]}>
                        Total Votes
                      </Text>
                    </View>

                    <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { color: theme.accent }]}>
                        {displayAvgScore}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.muted }]}>
                        Avg Score
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Desktop & Mobile Search + Sort Section */}
              <View
                style={[
                  styles.filterSection,
                  isDesktop && styles.desktopFilterSectionRow,
                ]}
              >
                {/* Search Bar */}
                <View
                  style={[
                    styles.searchBar,
                    isDesktop && styles.desktopSearchBar,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                    },
                    theme.shadow.soft,
                  ]}
                >
                  <Feather name="search" size={17} color={theme.muted} style={styles.searchIcon} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search startups by name, tagline, or keyword..."
                    placeholderTextColor={theme.muted}
                    style={[styles.searchInput, { color: theme.text }]}
                    clearButtonMode="while-editing"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => {
                        tap('light');
                        setSearchQuery('');
                      }}
                      style={styles.clearBtn}
                      accessibilityLabel="Clear search"
                    >
                      <Feather name="x-circle" size={16} color={theme.muted} />
                    </Pressable>
                  )}
                </View>

                {/* Meta Count & Segmented Sort */}
                <View style={[styles.sortControlsRow, isDesktop && styles.desktopSortControls]}>
                  {!isDesktop && (
                    <View style={styles.metaRow}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Explore Ideas
                      </Text>
                      <View
                        style={[
                          styles.countPill,
                          {
                            backgroundColor: theme.cardSecondary,
                            borderColor: theme.cardBorder,
                          },
                        ]}
                      >
                        <Text style={[styles.countText, { color: theme.accent }]}>
                          {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Segmented Control with Sliding Indicator */}
                  <View
                    onLayout={handleSegmentLayout}
                    style={[
                      styles.segmentedContainer,
                      isDesktop && { minWidth: 260 },
                      {
                        backgroundColor: theme.cardSecondary,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    {halfWidth > 0 && (
                      <Animated.View
                        pointerEvents="none"
                        style={[styles.slidingSegmentIndicator, animatedIndicatorStyle]}
                      >
                        <LinearGradient
                          colors={theme.gradients.primary}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.segmentGradient}
                        />
                      </Animated.View>
                    )}

                    {/* Rating Segment */}
                    <Pressable
                      onPress={() => handleSortChange('rating')}
                      style={styles.segmentButton}
                      accessibilityRole="button"
                      accessibilityLabel="Sort by rating"
                    >
                      <Feather
                        name="star"
                        size={14}
                        color={sortMode === 'rating' ? '#FFFFFF' : theme.muted}
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color: sortMode === 'rating' ? '#FFFFFF' : theme.muted,
                            fontFamily: sortMode === 'rating' ? 'Inter_700Bold' : 'Inter_600SemiBold',
                          },
                        ]}
                      >
                        Top Rating
                      </Text>
                    </Pressable>

                    {/* Votes Segment */}
                    <Pressable
                      onPress={() => handleSortChange('votes')}
                      style={styles.segmentButton}
                      accessibilityRole="button"
                      accessibilityLabel="Sort by votes"
                    >
                      <Feather
                        name="activity"
                        size={14}
                        color={sortMode === 'votes' ? '#FFFFFF' : theme.muted}
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color: sortMode === 'votes' ? '#FFFFFF' : theme.muted,
                            fontFamily: sortMode === 'votes' ? 'Inter_700Bold' : 'Inter_600SemiBold',
                          },
                        ]}
                      >
                        Most Votes
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIllustration}>
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={[styles.emptyOuterRing, theme.shadow.glow]}
                >
                  <View
                    style={[
                      styles.emptyInnerCircle,
                      { backgroundColor: theme.cardSecondary },
                    ]}
                  >
                    <Feather name="send" size={38} color={theme.accent} />
                  </View>
                </LinearGradient>
                <View
                  style={[
                    styles.sparkleBadge,
                    { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  ]}
                >
                  <Feather name="zap" size={14} color={theme.gold} />
                </View>
              </View>

              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'No Startups Found' : 'No Startup Ideas Yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.muted }]}>
                {searchQuery
                  ? `No startup concepts matched "${searchQuery}". Try a different keyword or reset search.`
                  : 'Be the first visionary to evaluate your startup concept with our AI investor engine.'}
              </Text>
              <Pressable
                onPress={() => {
                  tap('medium');
                  if (searchQuery) {
                    setSearchQuery('');
                  } else {
                    router.push('/(tabs)/submit');
                  }
                }}
                style={styles.submitFirstBtn}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.submitFirstGradient, theme.shadow.soft]}
                >
                  <Feather
                    name={searchQuery ? 'rotate-ccw' : 'plus-circle'}
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.submitFirstText}>
                    {searchQuery ? 'Clear Search' : 'Submit Startup Idea'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 8,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statsStripContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 6,
  },
  // Desktop 3-Card Metrics Row
  desktopStatsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  desktopStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.2,
    gap: 14,
  },
  statIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContentCol: {
    justifyContent: 'center',
  },
  // Mobile Strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  filterSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  desktopFilterSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1.2,
    paddingHorizontal: 14,
  },
  desktopSearchBar: {
    flex: 1,
    height: 48,
  },
  sortControlsRow: {
    gap: 8,
  },
  desktopSortControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  clearBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.4,
  },
  countPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1.2,
    position: 'relative',
  },
  slidingSegmentIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1,
  },
  segmentGradient: {
    flex: 1,
    borderRadius: 12,
  },
  segmentButton: {
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
  segmentText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 60,
  },
  emptyIllustration: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  emptyOuterRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyInnerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 420,
  },
  submitFirstBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  submitFirstGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    gap: 8,
    minHeight: 46,
  },
  submitFirstText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
