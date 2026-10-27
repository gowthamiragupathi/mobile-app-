import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { Header } from '../../components/Header';
import { IdeaCard } from '../../components/IdeaCard';
import { useIdeaStore } from '../../store/useIdeaStore';
import { useTheme } from '../../theme/colors';
import { tap } from '../../utils/haptics';

type SortMode = 'rating' | 'votes' | 'recent';

const CATEGORIES = [
  'All Sectors',
  'AI Infrastructure',
  'B2B SaaS',
  'NeuroTech',
  'ClimateTech',
  'BioTech',
];

export default function IdeasScreen() {
  const theme = useTheme();
  const ideas = useIdeaStore((s) => s.ideas);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Sectors');
  const [sortMode, setSortMode] = useState<SortMode>('rating');
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isWide = width >= 960;

  // Stats calculation
  const totalVotes = useMemo(() => {
    return ideas.reduce((acc, curr) => acc + curr.votes, 0);
  }, [ideas]);

  const avgScore = useMemo(() => {
    if (ideas.length === 0) return 0;
    const sum = ideas.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round(sum / ideas.length);
  }, [ideas]);

  const topIdea = useMemo(() => {
    if (ideas.length === 0) return null;
    return [...ideas].sort((a, b) => b.rating - a.rating)[0];
  }, [ideas]);

  // Animated Count-Up for Stats
  const prevStats = useRef({ ideas: ideas.length, votes: totalVotes, avg: avgScore });
  const [displayIdeasCount, setDisplayIdeasCount] = useState(ideas.length);
  const [displayVotesCount, setDisplayVotesCount] = useState(totalVotes);
  const [displayAvgScore, setDisplayAvgScore] = useState(avgScore);

  useEffect(() => {
    let frameId: number;
    const startTime = Date.now();
    const duration = 700;

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
    const list = ideas.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'All Sectors' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });

    return list.sort((a, b) => {
      if (sortMode === 'rating') {
        return b.rating - a.rating;
      }
      if (sortMode === 'votes') {
        return b.votes - a.votes;
      }
      return b.createdAt - a.createdAt;
    });
  }, [ideas, searchQuery, selectedCategory, sortMode]);

  const onRefresh = () => {
    setRefreshing(true);
    tap('medium');
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
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
              {/* Executive Metrics Dashboard Ribbon */}
              <View style={styles.statsStripContainer}>
                {isDesktop ? (
                  <View style={styles.desktopStatsGrid}>
                    {/* Stat 1 */}
                    <View
                      style={[
                        styles.executiveStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.card,
                      ]}
                    >
                      <View style={styles.statHeaderRow}>
                        <Text style={[styles.statTitle, { color: theme.muted }]}>ACTIVE DEAL FLOW</Text>
                        <Feather name="layers" size={16} color={theme.primary} />
                      </View>
                      <Text style={[styles.statMainValue, { color: theme.text }]}>
                        {displayIdeasCount} Ventures
                      </Text>
                      <View style={styles.statTrendRow}>
                        <Feather name="trending-up" size={12} color={theme.success} />
                        <Text style={[styles.statTrendText, { color: theme.success }]}>
                          100% Curated
                        </Text>
                        <Text style={[styles.statSubInfo, { color: theme.muted }]}>
                          across 5 sectors
                        </Text>
                      </View>
                    </View>

                    {/* Stat 2 */}
                    <View
                      style={[
                        styles.executiveStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.card,
                      ]}
                    >
                      <View style={styles.statHeaderRow}>
                        <Text style={[styles.statTitle, { color: theme.muted }]}>SYNDICATE BACKING</Text>
                        <Feather name="activity" size={16} color={theme.gold} />
                      </View>
                      <Text style={[styles.statMainValue, { color: theme.text }]}>
                        {displayVotesCount} Votes
                      </Text>
                      <View style={styles.statTrendRow}>
                        <Feather name="check" size={12} color={theme.gold} />
                        <Text style={[styles.statTrendText, { color: theme.gold }]}>
                          Verified Signals
                        </Text>
                        <Text style={[styles.statSubInfo, { color: theme.muted }]}>
                          anti-sybil locked
                        </Text>
                      </View>
                    </View>

                    {/* Stat 3 */}
                    <View
                      style={[
                        styles.executiveStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.card,
                      ]}
                    >
                      <View style={styles.statHeaderRow}>
                        <Text style={[styles.statTitle, { color: theme.muted }]}>AI BENCHMARK INDEX</Text>
                        <Feather name="cpu" size={16} color={theme.accent} />
                      </View>
                      <Text style={[styles.statMainValue, { color: theme.text }]}>
                        {displayAvgScore}/100
                      </Text>
                      <View style={styles.statTrendRow}>
                        <Feather name="bar-chart-2" size={12} color={theme.accent} />
                        <Text style={[styles.statTrendText, { color: theme.accent }]}>
                          Median: 87
                        </Text>
                        <Text style={[styles.statSubInfo, { color: theme.muted }]}>
                          simulated VCs
                        </Text>
                      </View>
                    </View>

                    {/* Stat 4 */}
                    <View
                      style={[
                        styles.executiveStatCard,
                        { backgroundColor: theme.card, borderColor: theme.cardBorder },
                        theme.shadow.card,
                      ]}
                    >
                      <View style={styles.statHeaderRow}>
                        <Text style={[styles.statTitle, { color: theme.muted }]}>TOP MOAT VENTURE</Text>
                        <Feather name="award" size={16} color={theme.success} />
                      </View>
                      <Text style={[styles.statMainValue, { color: theme.text }]} numberOfLines={1}>
                        {topIdea ? topIdea.name : 'N/A'}
                      </Text>
                      <View style={styles.statTrendRow}>
                        <Feather name="star" size={12} color={theme.success} />
                        <Text style={[styles.statTrendText, { color: theme.success }]}>
                          Score {topIdea?.rating || 0}/100
                        </Text>
                        <Text style={[styles.statSubInfo, { color: theme.muted }]}>
                          Unicorn Tier
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  // Mobile Stats Pill
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
                        Ventures
                      </Text>
                    </View>

                    <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { color: theme.gold }]}>
                        {displayVotesCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.muted }]}>
                        Votes
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

              {/* Category Filter Pills Bar */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => {
                        tap('light');
                        setSelectedCategory(cat);
                      }}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: isSelected ? theme.primary : theme.cardBorder,
                        },
                        isSelected && theme.shadow.soft,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          {
                            color: isSelected ? '#FFFFFF' : theme.textSecondary,
                            fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_500Medium',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Search & Sort Bar Row */}
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
                      backgroundColor: theme.card,
                      borderColor: theme.inputBorder,
                    },
                    theme.shadow.card,
                  ]}
                >
                  <Feather name="search" size={16} color={theme.muted} style={styles.searchIcon} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by venture name, thesis, tech moat, or TAM..."
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
                      <Feather name="x-circle" size={15} color={theme.muted} />
                    </Pressable>
                  )}
                </View>

                {/* Sort Mode Controls */}
                <View style={styles.sortTabsGroup}>
                  <Pressable
                    onPress={() => {
                      tap('light');
                      setSortMode('rating');
                    }}
                    style={[
                      styles.sortBtn,
                      sortMode === 'rating' && [styles.activeSortBtn, { backgroundColor: theme.primary, borderColor: theme.primary }],
                      sortMode !== 'rating' && { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Feather
                      name="star"
                      size={13}
                      color={sortMode === 'rating' ? '#FFFFFF' : theme.muted}
                    />
                    <Text
                      style={[
                        styles.sortBtnText,
                        { color: sortMode === 'rating' ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      Highest Score
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      tap('light');
                      setSortMode('votes');
                    }}
                    style={[
                      styles.sortBtn,
                      sortMode === 'votes' && [styles.activeSortBtn, { backgroundColor: theme.primary, borderColor: theme.primary }],
                      sortMode !== 'votes' && { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Feather
                      name="activity"
                      size={13}
                      color={sortMode === 'votes' ? '#FFFFFF' : theme.muted}
                    />
                    <Text
                      style={[
                        styles.sortBtnText,
                        { color: sortMode === 'votes' ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      Most Backed
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      tap('light');
                      setSortMode('recent');
                    }}
                    style={[
                      styles.sortBtn,
                      sortMode === 'recent' && [styles.activeSortBtn, { backgroundColor: theme.primary, borderColor: theme.primary }],
                      sortMode !== 'recent' && { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Feather
                      name="clock"
                      size={13}
                      color={sortMode === 'recent' ? '#FFFFFF' : theme.muted}
                    />
                    <Text
                      style={[
                        styles.sortBtnText,
                        { color: sortMode === 'recent' ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      Recent
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Results Count Line */}
              <View style={styles.resultsHeaderRow}>
                <Text style={[styles.resultsTitle, { color: theme.text }]}>
                  {selectedCategory === 'All Sectors' ? 'All Curated Ventures' : selectedCategory}
                </Text>
                <View style={[styles.resultsCountBadge, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.resultsCountText, { color: theme.primary }]}>
                    {filteredIdeas.length} {filteredIdeas.length === 1 ? 'Deal' : 'Deals'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder },
                ]}
              >
                <Feather name="search" size={28} color={theme.muted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Ventures Match Query
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.muted }]}>
                Try adjusting your search criteria or sector filter to discover more startup evaluations.
              </Text>
              <Pressable
                onPress={() => {
                  tap('light');
                  setSearchQuery('');
                  setSelectedCategory('All Sectors');
                }}
                style={[styles.resetSearchBtn, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}
              >
                <Text style={[styles.resetSearchText, { color: theme.primary }]}>
                  Reset All Filters
                </Text>
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
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
  },
  statsStripContainer: {
    marginBottom: 16,
  },
  desktopStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  executiveStatCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.6,
  },
  statMainValue: {
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  statTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statTrendText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  statSubInfo: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  statsStrip: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    height: '65%',
    alignSelf: 'center',
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  filterSection: {
    marginBottom: 16,
    gap: 10,
  },
  desktopFilterSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  desktopSearchBar: {
    flex: 1,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  clearBtn: {
    padding: 4,
  },
  sortTabsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    height: 42,
  },
  activeSortBtn: {},
  sortBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultsTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  resultsCountBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultsCountText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 19,
    marginBottom: 16,
  },
  resetSearchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetSearchText: {
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
  },
});
