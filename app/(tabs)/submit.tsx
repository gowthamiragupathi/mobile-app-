import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Header } from '../../components/Header';
import { RatingRing } from '../../components/RatingRing';
import { Shimmer } from '../../components/Shimmer';
import { ConfettiBurst } from '../../components/Confetti';
import { Idea, useIdeaStore } from '../../store/useIdeaStore';
import { useTheme } from '../../theme/colors';
import { tap, success as successHaptic, error as errorHaptic } from '../../utils/haptics';

const FUN_AI_MESSAGES = [
  'Scanning addressable market…',
  'Calling imaginary VCs…',
  'Benchmarking moat durability…',
  'Crunching TAM calculations…',
  'Synthesizing investor verdict…',
];

export default function SubmitScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  const [nameFocused, setNameFocused] = useState(false);
  const [taglineFocused, setTaglineFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; tagline?: string; description?: string }>({});
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [evaluatedIdea, setEvaluatedIdea] = useState<Idea | null>(null);

  const addIdea = useIdeaStore((s) => s.addIdea);
  const showToast = useIdeaStore((s) => s.showToast);

  // Reanimated values
  const shakeX = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const radarRotate = useSharedValue(0);

  // Metric bars animated progress (0 -> target)
  const marketBarProgress = useSharedValue(0);
  const innovationBarProgress = useSharedValue(0);
  const feasibilityBarProgress = useSharedValue(0);

  // Rotating messages timer during 1.5s AI analysis
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnalysing) {
      setMessageIndex(0);
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % FUN_AI_MESSAGES.length);
      }, 360);
    }
    return () => clearInterval(interval);
  }, [isAnalysing]);

  // Radar spinner for AI evaluation overlay
  useEffect(() => {
    if (isAnalysing) {
      radarRotate.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      radarRotate.value = 0;
    }
  }, [isAnalysing, radarRotate]);

  // Trigger metric bars animation when evaluatedIdea appears
  useEffect(() => {
    if (evaluatedIdea) {
      marketBarProgress.value = 0;
      innovationBarProgress.value = 0;
      feasibilityBarProgress.value = 0;

      marketBarProgress.value = withTiming(evaluatedIdea.metrics.market, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
      innovationBarProgress.value = withTiming(evaluatedIdea.metrics.innovation, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
      feasibilityBarProgress.value = withTiming(evaluatedIdea.metrics.feasibility, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [evaluatedIdea, marketBarProgress, innovationBarProgress, feasibilityBarProgress]);

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedRadarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotate.value}deg` }],
  }));

  const animatedMarketStyle = useAnimatedStyle(() => ({
    width: `${marketBarProgress.value}%`,
  }));

  const animatedInnovationStyle = useAnimatedStyle(() => ({
    width: `${innovationBarProgress.value}%`,
  }));

  const animatedFeasibilityStyle = useAnimatedStyle(() => ({
    width: `${feasibilityBarProgress.value}%`,
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-12, { duration: 60 }),
      withTiming(12, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const validate = () => {
    const newErrors: { name?: string; tagline?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Startup name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Startup name must be at least 2 characters';
    }

    if (!tagline.trim()) {
      newErrors.tagline = 'Tagline is required';
    } else if (tagline.trim().length < 6) {
      newErrors.tagline = 'Tagline must be at least 6 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getVerdictLabel = (score: number) => {
    if (score >= 90) return 'Unicorn potential 🦄';
    if (score >= 80) return 'Shark Tank ready 🦈';
    if (score >= 70) return 'Growth Machine 🚀';
    if (score >= 60) return 'Defensible Moat 💡';
    return 'Needs more coffee ☕';
  };

  const handleSubmit = () => {
    if (!validate()) {
      errorHaptic();
      triggerShake();
      return;
    }

    tap('heavy');
    setIsAnalysing(true);

    // 1.5s simulated AI analysis step
    setTimeout(() => {
      // Fake AI rating between 55 and 97
      const generatedRating = Math.floor(Math.random() * 43) + 55;
      const verdict = getVerdictLabel(generatedRating);

      const metrics = {
        market: Math.min(99, Math.max(45, generatedRating + Math.floor(Math.random() * 8) - 3)),
        innovation: Math.min(99, Math.max(45, generatedRating + Math.floor(Math.random() * 10) - 4)),
        feasibility: Math.min(99, Math.max(45, generatedRating + Math.floor(Math.random() * 6) - 2)),
      };

      const created = addIdea({
        name,
        tagline,
        description,
        rating: generatedRating,
        verdict,
        metrics,
      });

      successHaptic();
      setIsAnalysing(false);
      setEvaluatedIdea(created);
      showToast(`AI Evaluated: ${generatedRating}/100! 🚀`, 'success');
    }, 1500);
  };

  const handleResetForm = () => {
    tap('light');
    setEvaluatedIdea(null);
    setName('');
    setTagline('');
    setDescription('');
    setErrors({});
  };

  const handleDoneAndNavigate = () => {
    tap('light');
    setEvaluatedIdea(null);
    setName('');
    setTagline('');
    setDescription('');
    router.navigate('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isDesktop ? 40 : 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.webContentWrapper}>
            {/* Page Header */}
            <View style={styles.headingSection}>
              <Text style={[styles.title, { color: theme.text }]}>Submit Startup Idea</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Get real-time evaluations and investor feedback from our simulated AI investor engine.
              </Text>
            </View>

            {/* Desktop 2-Column or Mobile 1-Column Layout */}
            <View style={isDesktop ? styles.desktopTwoColRow : styles.mobileOneCol}>
              {/* Left Column: Form */}
              <Animated.View
                entering={FadeInDown.delay(100).springify().damping(14)}
                style={[
                  isDesktop ? styles.desktopFormCol : styles.mobileFormCol,
                  animatedShakeStyle,
                ]}
              >
                <View
                  style={[
                    styles.formCard,
                    isDesktop && [
                      styles.desktopFormCard,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                      theme.shadow.soft,
                    ],
                  ]}
                >
                  {/* Input 1: Startup Name */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.label, { color: theme.text }]}>Startup Name</Text>
                      <Text style={[styles.charCounter, { color: theme.muted }]}>
                        {name.length}/40
                      </Text>
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: errors.name
                            ? theme.danger
                            : nameFocused
                            ? theme.inputFocusBorder
                            : theme.inputBorder,
                        },
                        nameFocused && theme.shadow.glow,
                      ]}
                    >
                      <Feather
                        name="briefcase"
                        size={18}
                        color={nameFocused ? theme.primary : theme.muted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        value={name}
                        onChangeText={(text) => {
                          setName(text);
                          if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        placeholder="e.g. Synthetix Labs, OrbitPay"
                        placeholderTextColor={theme.muted}
                        style={[styles.textInput, { color: theme.text }]}
                        maxLength={40}
                      />
                    </View>
                  </View>

                  {/* Input 2: Tagline */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.label, { color: theme.text }]}>One-Line Tagline</Text>
                      <Text style={[styles.charCounter, { color: theme.muted }]}>
                        {tagline.length}/90
                      </Text>
                    </View>
                    {errors.tagline && <Text style={styles.errorText}>{errors.tagline}</Text>}
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: errors.tagline
                            ? theme.danger
                            : taglineFocused
                            ? theme.inputFocusBorder
                            : theme.inputBorder,
                        },
                        taglineFocused && theme.shadow.glow,
                      ]}
                    >
                      <Feather
                        name="zap"
                        size={18}
                        color={taglineFocused ? theme.primary : theme.muted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        value={tagline}
                        onChangeText={(text) => {
                          setTagline(text);
                          if (errors.tagline) setErrors({ ...errors, tagline: undefined });
                        }}
                        onFocus={() => setTaglineFocused(true)}
                        onBlur={() => setTaglineFocused(false)}
                        placeholder="e.g. Autonomous cloud telemetry and healing"
                        placeholderTextColor={theme.muted}
                        style={[styles.textInput, { color: theme.text }]}
                        maxLength={90}
                      />
                    </View>
                  </View>

                  {/* Input 3: Description */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.label, { color: theme.text }]}>Detailed Description</Text>
                      <Text style={[styles.charCounter, { color: theme.muted }]}>
                        {description.length}/400
                      </Text>
                    </View>
                    {errors.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                    <View
                      style={[
                        styles.textAreaWrapper,
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: errors.description
                            ? theme.danger
                            : descriptionFocused
                            ? theme.inputFocusBorder
                            : theme.inputBorder,
                        },
                        descriptionFocused && theme.shadow.glow,
                      ]}
                    >
                      <TextInput
                        value={description}
                        onChangeText={(text) => {
                          setDescription(text);
                          if (errors.description)
                            setErrors({ ...errors, description: undefined });
                        }}
                        onFocus={() => setDescriptionFocused(true)}
                        onBlur={() => setDescriptionFocused(false)}
                        placeholder="Describe your target market, unfair technological moat, unit economics, and customer problem..."
                        placeholderTextColor={theme.muted}
                        style={[styles.textArea, { color: theme.text }]}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={400}
                      />
                    </View>
                  </View>

                  {/* Submit Button with Reanimated Press-Scale */}
                  <Animated.View style={animatedButtonStyle}>
                    <Pressable
                      onPress={handleSubmit}
                      onPressIn={() => {
                        buttonScale.value = withSpring(0.96, { damping: 15 });
                      }}
                      onPressOut={() => {
                        buttonScale.value = withSpring(1, { damping: 15 });
                      }}
                      disabled={isAnalysing}
                      style={[styles.submitButton, theme.shadow.glow]}
                      accessibilityRole="button"
                      accessibilityLabel="Evaluate Idea with AI"
                    >
                      <LinearGradient
                        colors={theme.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                      >
                        <Feather name="cpu" size={19} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>
                          Evaluate Idea with AI
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                </View>
              </Animated.View>

              {/* Right Column (Desktop Web Application Side Panel): AI Evaluation Criteria */}
              {isDesktop && (
                <View style={styles.desktopSidePanelCol}>
                  <View
                    style={[
                      styles.methodologyCard,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                      theme.shadow.soft,
                    ]}
                  >
                    <View style={styles.sidePanelHeader}>
                      <View style={[styles.sideIconBadge, { backgroundColor: theme.cardSecondary }]}>
                        <Feather name="bar-chart-2" size={18} color={theme.primary} />
                      </View>
                      <Text style={[styles.sidePanelTitle, { color: theme.text }]}>
                        Evaluation Framework
                      </Text>
                    </View>

                    <Text style={[styles.sidePanelDesc, { color: theme.muted }]}>
                      Our simulated angel evaluator models criteria used by top-tier venture funds:
                    </Text>

                    <View style={styles.criteriaList}>
                      <View style={styles.criteriaItem}>
                        <View style={[styles.criteriaDot, { backgroundColor: theme.primary }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.criteriaName, { color: theme.text }]}>
                            Market Size & TAM
                          </Text>
                          <Text style={[styles.criteriaText, { color: theme.muted }]}>
                            Addressable buyer segment, expansion velocity, and budget headroom.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.criteriaItem}>
                        <View style={[styles.criteriaDot, { backgroundColor: theme.accent }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.criteriaName, { color: theme.text }]}>
                            Innovation & Defensibility
                          </Text>
                          <Text style={[styles.criteriaText, { color: theme.muted }]}>
                            Proprietary IP, network effects, and protection from clone competitors.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.criteriaItem}>
                        <View style={[styles.criteriaDot, { backgroundColor: theme.gold }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.criteriaName, { color: theme.text }]}>
                            Execution Feasibility
                          </Text>
                          <Text style={[styles.criteriaText, { color: theme.muted }]}>
                            Technical viability, capital requirements, and time-to-market.
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Pro Tip Box */}
                    <View
                      style={[
                        styles.proTipBox,
                        { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder },
                      ]}
                    >
                      <Feather name="check-circle" size={16} color={theme.primary} />
                      <Text style={[styles.proTipText, { color: theme.textSecondary }]}>
                        <Text style={{ fontFamily: 'Inter_700Bold' }}>Tip for 90+ Score: </Text>
                        Articulate your unfair advantage and specific target ICP in the description.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 1.5s AI Analysing Modal Overlay with Shimmer and Rotating Fun Messages */}
      {isAnalysing && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.analysingOverlay, { backgroundColor: theme.overlay }]}
        >
          <View
            style={[
              styles.analysingCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.accentGlow,
              },
              theme.shadow.glow,
            ]}
          >
            {/* Rotating Radar Icon */}
            <Animated.View style={[styles.scannerCircle, animatedRadarStyle]}>
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.scannerInner}
              >
                <Feather name="loader" size={30} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.analysingTitle, { color: theme.text }]}>
              AI Evaluator
            </Text>

            {/* Rotating Fun Message */}
            <Text style={[styles.analysingStatus, { color: theme.accent }]}>
              {FUN_AI_MESSAGES[messageIndex]}
            </Text>

            <View style={[styles.shimmerContainer, { backgroundColor: theme.cardSecondary }]}>
              <Shimmer height={6} width="100%" borderRadius={3} />
            </View>

            <View style={styles.aiPillRow}>
              <View style={[styles.miniBadge, { backgroundColor: theme.cardSecondary }]}>
                <Text style={[styles.miniBadgeText, { color: theme.muted }]}>
                  Market TAM
                </Text>
              </View>
              <View style={[styles.miniBadge, { backgroundColor: theme.cardSecondary }]}>
                <Text style={[styles.miniBadgeText, { color: theme.muted }]}>
                  Moat Defensibility
                </Text>
              </View>
              <View style={[styles.miniBadge, { backgroundColor: theme.cardSecondary }]}>
                <Text style={[styles.miniBadgeText, { color: theme.muted }]}>
                  Execution Risk
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Result Modal: animated rating ring counting up 0 to score, metric bars filling, confetti burst if score > 85 */}
      {evaluatedIdea && (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(200)}
          style={[styles.analysingOverlay, { backgroundColor: theme.overlay }]}
        >
          {/* Confetti burst if score > 85 */}
          {evaluatedIdea.rating > 85 && <ConfettiBurst />}

          <Animated.View
            entering={FadeInDown.springify().damping(14)}
            style={[
              styles.resultCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.accentGlow,
              },
              theme.shadow.glow,
            ]}
          >
            {/* Verdict Chip */}
            <View style={styles.resultBadgeRow}>
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.aiVerdictBadge}
              >
                <Feather name="award" size={13} color="#FFFFFF" />
                <Text style={styles.aiVerdictBadgeText}>
                  {evaluatedIdea.verdict}
                </Text>
              </LinearGradient>
            </View>

            <Text style={[styles.resultIdeaName, { color: theme.text }]}>
              {evaluatedIdea.name}
            </Text>
            <Text style={[styles.resultIdeaTagline, { color: theme.textSecondary }]}>
              {evaluatedIdea.tagline}
            </Text>

            {/* Rating Ring counting up 0 to score */}
            <View style={styles.resultRingContainer}>
              <RatingRing rating={evaluatedIdea.rating} size={96} animateCount delay={100} />
            </View>

            {/* 3 Metric Bars Filling Up */}
            <View style={[styles.metricsContainer, { backgroundColor: theme.cardSecondary }]}>
              <View style={styles.metricItem}>
                <View style={styles.metricItemHeader}>
                  <Text style={[styles.metricName, { color: theme.text }]}>Market Size</Text>
                  <Text style={[styles.metricScore, { color: theme.primary }]}>
                    {evaluatedIdea.metrics.market}%
                  </Text>
                </View>
                <View style={[styles.metricBarTrack, { backgroundColor: theme.card }]}>
                  <Animated.View
                    style={[
                      styles.metricBarFilled,
                      { backgroundColor: theme.primary },
                      animatedMarketStyle,
                    ]}
                  />
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricItemHeader}>
                  <Text style={[styles.metricName, { color: theme.text }]}>Innovation</Text>
                  <Text style={[styles.metricScore, { color: theme.accent }]}>
                    {evaluatedIdea.metrics.innovation}%
                  </Text>
                </View>
                <View style={[styles.metricBarTrack, { backgroundColor: theme.card }]}>
                  <Animated.View
                    style={[
                      styles.metricBarFilled,
                      { backgroundColor: theme.accent },
                      animatedInnovationStyle,
                    ]}
                  />
                </View>
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricItemHeader}>
                  <Text style={[styles.metricName, { color: theme.text }]}>Feasibility</Text>
                  <Text style={[styles.metricScore, { color: theme.gold }]}>
                    {evaluatedIdea.metrics.feasibility}%
                  </Text>
                </View>
                <View style={[styles.metricBarTrack, { backgroundColor: theme.card }]}>
                  <Animated.View
                    style={[
                      styles.metricBarFilled,
                      { backgroundColor: theme.gold },
                      animatedFeasibilityStyle,
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Actions: View in Feed / Submit Another */}
            <View style={styles.resultActionRow}>
              <Pressable
                onPress={handleDoneAndNavigate}
                style={[styles.resultPrimaryBtn, theme.shadow.soft]}
                accessibilityRole="button"
                accessibilityLabel="View in Feed"
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={styles.resultBtnGradient}
                >
                  <Feather name="compass" size={17} color="#FFFFFF" />
                  <Text style={styles.resultPrimaryText}>View in Ideas Feed</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={handleResetForm}
                style={[
                  styles.resultSecondaryBtn,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Submit another idea"
              >
                <Text style={[styles.resultSecondaryText, { color: theme.text }]}>
                  Submit Another Idea
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  webContentWrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  headingSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_500Medium',
  },
  // Responsive layout: 2-column on desktop, 1-column on mobile
  desktopTwoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    width: '100%',
  },
  mobileOneCol: {
    width: '100%',
  },
  desktopFormCol: {
    flex: 1.3,
  },
  mobileFormCol: {
    width: '100%',
  },
  desktopSidePanelCol: {
    flex: 1,
  },
  formCard: {
    width: '100%',
  },
  desktopFormCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.2,
  },
  methodologyCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.2,
    gap: 16,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sideIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanelTitle: {
    fontSize: 17,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.2,
  },
  sidePanelDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  criteriaList: {
    gap: 14,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  criteriaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  criteriaName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  criteriaText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Inter_400Regular',
  },
  proTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
  },
  proTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter_500Medium',
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.1,
  },
  charCounter: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.4,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  textAreaWrapper: {
    borderRadius: 16,
    borderWidth: 1.4,
    padding: 14,
    minHeight: 120,
  },
  textArea: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    minHeight: 50,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  analysingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  analysingCard: {
    width: '100%',
    maxWidth: 380,
    padding: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  scannerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  scannerInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysingTitle: {
    fontSize: 19,
    fontFamily: 'Inter_800ExtraBold',
    marginBottom: 6,
    textAlign: 'center',
  },
  analysingStatus: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  shimmerContainer: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 18,
  },
  aiPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniBadge: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  miniBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  resultCard: {
    width: '100%',
    maxWidth: 420,
    padding: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  resultBadgeRow: {
    marginBottom: 10,
  },
  aiVerdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
  },
  aiVerdictBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  resultIdeaName: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultIdeaTagline: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  resultRingContainer: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    gap: 12,
  },
  metricItem: {
    gap: 4,
  },
  metricItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  metricScore: {
    fontSize: 12,
    fontFamily: 'Inter_800ExtraBold',
  },
  metricBarTrack: {
    width: '100%',
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  metricBarFilled: {
    height: '100%',
    borderRadius: 3.5,
  },
  resultActionRow: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  resultPrimaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    width: '100%',
  },
  resultBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    minHeight: 48,
  },
  resultPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  resultSecondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resultSecondaryText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});
