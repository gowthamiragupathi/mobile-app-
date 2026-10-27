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
  'Auditing addressable market TAM…',
  'Simulating tier-1 VC partner reactions…',
  'Benchmarking defensibility moat & retention…',
  'Analyzing gross margins & unit economics…',
  'Synthesizing investment committee memo…',
];

const SECTORS = [
  'AI Infrastructure',
  'B2B SaaS',
  'FinTech',
  'ClimateTech',
  'BioTech',
  'Cybersecurity',
];

const STAGES = ['Pre-Seed', 'Seed Stage', 'Series A Ready'];

const TAM_TIERS = ['$10B+ TAM', '$25B+ TAM', '$50B+ TAM'];

export default function SubmitScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI Infrastructure');
  const [stage, setStage] = useState('Seed Stage');
  const [tam, setTam] = useState('$25B+ TAM');

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
      }, 340);
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
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const validate = () => {
    const newErrors: { name?: string; tagline?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Startup venture name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Startup name must be at least 2 characters';
    }

    if (!tagline.trim()) {
      newErrors.tagline = 'Executive one-line pitch is required';
    } else if (tagline.trim().length < 6) {
      newErrors.tagline = 'Pitch must be at least 6 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Moat & unit economics breakdown is required';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getVerdictLabel = (score: number) => {
    if (score >= 90) return 'Unicorn Potential 🦄';
    if (score >= 80) return 'Series A Ready 🦈';
    if (score >= 70) return 'Growth Machine 🚀';
    if (score >= 60) return 'Defensible Moat 💡';
    return 'Early Validation 🔬';
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
      const generatedRating = Math.floor(Math.random() * 41) + 58;
      const verdict = getVerdictLabel(generatedRating);

      const metrics = {
        market: Math.min(99, Math.max(50, generatedRating + Math.floor(Math.random() * 8) - 3)),
        innovation: Math.min(99, Math.max(50, generatedRating + Math.floor(Math.random() * 10) - 4)),
        feasibility: Math.min(99, Math.max(50, generatedRating + Math.floor(Math.random() * 6) - 2)),
      };

      const thesis =
        generatedRating >= 88
          ? 'Exceptional expansion velocity; high customer willingness to pay with clear competitive moat.'
          : generatedRating >= 75
          ? 'Strong domain timing; focus on tightening initial customer acquisition costs and payback period.'
          : 'Promising technology premise; requires deeper validation of enterprise sales cycles.';

      const created = addIdea({
        name,
        tagline,
        description,
        rating: generatedRating,
        verdict,
        metrics,
        category,
        stage,
        tam,
        founderSignal: 'Executive Leadership Team',
        thesis,
      });

      successHaptic();
      setIsAnalysing(false);
      setEvaluatedIdea(created);
      showToast(`Venture Audited: Score ${generatedRating}/100! 🚀`, 'success');
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
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: isDesktop ? 40 : 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.webContentWrapper}>
            {/* Page Header */}
            <View style={styles.pageHeader}>
              <View style={styles.pageTitleRow}>
                <Feather name="file-plus" size={22} color={theme.primary} />
                <Text style={[styles.pageTitle, { color: theme.text }]}>
                  AI Venture Deal Evaluation Room
                </Text>
              </View>
              <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
                Submit your startup pitch to receive an institutional investment committee evaluation, TAM audit, and defensibility score.
              </Text>
            </View>

            {/* Desktop 2-Column or Mobile Layout */}
            <View style={[styles.mainLayout, isDesktop && styles.desktopMainLayout]}>
              {/* Form Column */}
              <View style={[styles.formColumn, isDesktop && styles.desktopFormColumn]}>
                <Animated.View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadow.card, animatedShakeStyle]}>
                  {/* Field 1: Name */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Startup Venture Name</Text>
                      <Text style={[styles.charCount, { color: theme.muted }]}>{name.length}/40</Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: theme.cardSecondary,
                          borderColor: errors.name ? theme.danger : nameFocused ? theme.primary : theme.cardBorder,
                        },
                      ]}
                    >
                      <Feather name="briefcase" size={16} color={nameFocused ? theme.primary : theme.muted} style={styles.inputIcon} />
                      <TextInput
                        value={name}
                        onChangeText={(txt) => {
                          setName(txt);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        placeholder="e.g. Synthetix Cloud, OrbitPay"
                        placeholderTextColor={theme.muted}
                        maxLength={40}
                        style={[styles.textInput, { color: theme.text }]}
                      />
                    </View>
                    {Boolean(errors.name) && (
                      <Text style={[styles.errorText, { color: theme.danger }]}>{errors.name}</Text>
                    )}
                  </View>

                  {/* Sector Pills Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Industry Sector</Text>
                    <View style={styles.pillSelectorRow}>
                      {SECTORS.map((sec) => {
                        const isSelected = category === sec;
                        return (
                          <Pressable
                            key={sec}
                            onPress={() => {
                              tap('light');
                              setCategory(sec);
                            }}
                            style={[
                              styles.choicePill,
                              {
                                backgroundColor: isSelected ? theme.primary : theme.cardSecondary,
                                borderColor: isSelected ? theme.primary : theme.cardBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.choicePillText,
                                { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                              ]}
                            >
                              {sec}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Stage & TAM Row */}
                  <View style={styles.splitRow}>
                    <View style={styles.splitCol}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Stage</Text>
                      <View style={styles.choiceGroup}>
                        {STAGES.map((stg) => {
                          const isSel = stage === stg;
                          return (
                            <Pressable
                              key={stg}
                              onPress={() => {
                                tap('light');
                                setStage(stg);
                              }}
                              style={[
                                styles.stageChoiceBtn,
                                {
                                  backgroundColor: isSel ? theme.primary : theme.cardSecondary,
                                  borderColor: isSel ? theme.primary : theme.cardBorder,
                                },
                              ]}
                            >
                              <Text style={[styles.stageChoiceText, { color: isSel ? '#FFFFFF' : theme.textSecondary }]}>
                                {stg}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.splitCol}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Target TAM</Text>
                      <View style={styles.choiceGroup}>
                        {TAM_TIERS.map((t) => {
                          const isSel = tam === t;
                          return (
                            <Pressable
                              key={t}
                              onPress={() => {
                                tap('light');
                                setTam(t);
                              }}
                              style={[
                                styles.stageChoiceBtn,
                                {
                                  backgroundColor: isSel ? theme.accent : theme.cardSecondary,
                                  borderColor: isSel ? theme.accent : theme.cardBorder,
                                },
                              ]}
                            >
                              <Text style={[styles.stageChoiceText, { color: isSel ? '#FFFFFF' : theme.textSecondary }]}>
                                {t}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* Field 2: Tagline */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Executive One-Line Tagline</Text>
                      <Text style={[styles.charCount, { color: theme.muted }]}>{tagline.length}/90</Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: theme.cardSecondary,
                          borderColor: errors.tagline ? theme.danger : taglineFocused ? theme.primary : theme.cardBorder,
                        },
                      ]}
                    >
                      <Feather name="zap" size={16} color={taglineFocused ? theme.primary : theme.muted} style={styles.inputIcon} />
                      <TextInput
                        value={tagline}
                        onChangeText={(txt) => {
                          setTagline(txt);
                          if (errors.tagline) setErrors((prev) => ({ ...prev, tagline: undefined }));
                        }}
                        onFocus={() => setTaglineFocused(true)}
                        onBlur={() => setTaglineFocused(false)}
                        placeholder="e.g. Autonomous cloud infrastructure telemetry & self-healing"
                        placeholderTextColor={theme.muted}
                        maxLength={90}
                        style={[styles.textInput, { color: theme.text }]}
                      />
                    </View>
                    {Boolean(errors.tagline) && (
                      <Text style={[styles.errorText, { color: theme.danger }]}>{errors.tagline}</Text>
                    )}
                  </View>

                  {/* Field 3: Description */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Problem, Technological Moat & Economics</Text>
                      <Text style={[styles.charCount, { color: theme.muted }]}>{description.length}/400</Text>
                    </View>
                    <View
                      style={[
                        styles.textAreaWrapper,
                        {
                          backgroundColor: theme.cardSecondary,
                          borderColor: errors.description ? theme.danger : descriptionFocused ? theme.primary : theme.cardBorder,
                        },
                      ]}
                    >
                      <TextInput
                        value={description}
                        onChangeText={(txt) => {
                          setDescription(txt);
                          if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                        }}
                        onFocus={() => setDescriptionFocused(true)}
                        onBlur={() => setDescriptionFocused(false)}
                        placeholder="Detail the target customer problem, unfair technological advantage, switching costs, and why now..."
                        placeholderTextColor={theme.muted}
                        maxLength={400}
                        multiline
                        numberOfLines={4}
                        style={[styles.textAreaInput, { color: theme.text }]}
                        textAlignVertical="top"
                      />
                    </View>
                    {Boolean(errors.description) && (
                      <Text style={[styles.errorText, { color: theme.danger }]}>{errors.description}</Text>
                    )}
                  </View>

                  {/* Submit Button */}
                  <Animated.View style={animatedButtonStyle}>
                    <Pressable
                      onPress={handleSubmit}
                      disabled={isAnalysing}
                      style={[styles.submitButton, theme.shadow.soft]}
                    >
                      <LinearGradient
                        colors={theme.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Feather name="cpu" size={18} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>
                          {isAnalysing ? 'Synthesizing Evaluation…' : 'Run Institutional AI Audit'}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                </Animated.View>
              </View>

              {/* Right Column: Institutional Audit Methodology (Desktop) */}
              <View style={[styles.infoColumn, isDesktop && styles.desktopInfoColumn]}>
                <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadow.card]}>
                  <View style={styles.infoHeaderRow}>
                    <Feather name="shield" size={18} color={theme.primary} />
                    <Text style={[styles.infoCardTitle, { color: theme.text }]}>Evaluation Framework</Text>
                  </View>
                  <Text style={[styles.infoCardDesc, { color: theme.muted }]}>
                    Our algorithmic evaluator simulates criteria used by institutional venture funds and angel syndicates:
                  </Text>

                  <View style={styles.criteriaItem}>
                    <View style={[styles.criteriaDot, { backgroundColor: theme.primary }]} />
                    <View style={styles.criteriaTextCol}>
                      <Text style={[styles.criteriaTitle, { color: theme.text }]}>Addressable Market & TAM</Text>
                      <Text style={[styles.criteriaDesc, { color: theme.muted }]}>
                        Buyer segment willingness to pay, budget headroom, and expansion velocity.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.criteriaItem}>
                    <View style={[styles.criteriaDot, { backgroundColor: theme.accent }]} />
                    <View style={styles.criteriaTextCol}>
                      <Text style={[styles.criteriaTitle, { color: theme.text }]}>Moat & IP Defensibility</Text>
                      <Text style={[styles.criteriaDesc, { color: theme.muted }]}>
                        Proprietary data flywheels, high switching costs, and immunity to big-tech clones.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.criteriaItem}>
                    <View style={[styles.criteriaDot, { backgroundColor: theme.success }]} />
                    <View style={styles.criteriaTextCol}>
                      <Text style={[styles.criteriaTitle, { color: theme.text }]}>Unit Economics & Feasibility</Text>
                      <Text style={[styles.criteriaDesc, { color: theme.muted }]}>
                        Technical viability, CAC/LTV trajectory, and capital efficiency.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.proTipBox, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                    <Feather name="info" size={14} color={theme.primary} />
                    <Text style={[styles.proTipText, { color: theme.text }]}>
                      Pro Tip: Startups articulating an unfair proprietary advantage consistently score in the top 90th percentile.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full-Screen AI Evaluation Overlay */}
      {isAnalysing && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.overlayContainer, { backgroundColor: theme.overlay }]}
        >
          <View style={[styles.radarModal, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadow.glow]}>
            <Animated.View style={[styles.radarCircle, { borderColor: theme.primary }, animatedRadarStyle]}>
              <LinearGradient
                colors={['transparent', theme.accentGlow]}
                style={styles.radarSweep}
              />
              <Feather name="cpu" size={28} color={theme.primary} />
            </Animated.View>

            <Text style={[styles.analysingTitle, { color: theme.text }]}>
              Evaluating Venture Deal
            </Text>

            <Text style={[styles.analysingMessage, { color: theme.primary }]}>
              {FUN_AI_MESSAGES[messageIndex]}
            </Text>

            <View style={styles.shimmerWrapper}>
              <Shimmer height={5} borderRadius={3} />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Evaluation Results Modal */}
      {evaluatedIdea && (
        <Animated.View
          entering={FadeIn.duration(250)}
          style={[styles.overlayContainer, { backgroundColor: theme.overlay }]}
        >
          {evaluatedIdea.rating >= 85 && <ConfettiBurst />}

          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            style={[
              styles.resultModal,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.shadow.card,
            ]}
          >
            {/* Header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultScoreRow}>
                <RatingRing rating={evaluatedIdea.rating} size={76} />
                <View style={styles.resultMetaCol}>
                  <Text style={[styles.resultVentureName, { color: theme.text }]} numberOfLines={1}>
                    {evaluatedIdea.name}
                  </Text>
                  <View style={[styles.resultVerdictPill, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.resultVerdictText, { color: theme.primary }]}>
                      {evaluatedIdea.verdict}
                    </Text>
                  </View>
                  <Text style={[styles.resultSectorText, { color: theme.muted }]}>
                    {evaluatedIdea.category} • {evaluatedIdea.tam}
                  </Text>
                </View>
              </View>
            </View>

            {/* Metric Bars */}
            <View style={[styles.resultMetricsBox, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}>
              <View style={styles.metricItemRow}>
                <Text style={[styles.metricName, { color: theme.text }]}>Addressable TAM</Text>
                <View style={[styles.modalMetricBarBg, { backgroundColor: theme.cardBorder }]}>
                  <Animated.View style={[styles.modalMetricBarFill, { backgroundColor: theme.primary }, animatedMarketStyle]} />
                </View>
                <Text style={[styles.metricScoreText, { color: theme.text }]}>{evaluatedIdea.metrics.market}%</Text>
              </View>

              <View style={styles.metricItemRow}>
                <Text style={[styles.metricName, { color: theme.text }]}>Moat & Innovation</Text>
                <View style={[styles.modalMetricBarBg, { backgroundColor: theme.cardBorder }]}>
                  <Animated.View style={[styles.modalMetricBarFill, { backgroundColor: theme.accent }, animatedInnovationStyle]} />
                </View>
                <Text style={[styles.metricScoreText, { color: theme.text }]}>{evaluatedIdea.metrics.innovation}%</Text>
              </View>

              <View style={styles.metricItemRow}>
                <Text style={[styles.metricName, { color: theme.text }]}>Unit Feasibility</Text>
                <View style={[styles.modalMetricBarBg, { backgroundColor: theme.cardBorder }]}>
                  <Animated.View style={[styles.modalMetricBarFill, { backgroundColor: theme.success }, animatedFeasibilityStyle]} />
                </View>
                <Text style={[styles.metricScoreText, { color: theme.text }]}>{evaluatedIdea.metrics.feasibility}%</Text>
              </View>
            </View>

            {/* Thesis */}
            {Boolean(evaluatedIdea.thesis) && (
              <View style={[styles.resultThesisBox, { borderColor: theme.cardBorder }]}>
                <Text style={[styles.thesisLabel, { color: theme.primary }]}>INVESTMENT COMMITTEE MEMO</Text>
                <Text style={[styles.thesisBody, { color: theme.textSecondary }]}>{evaluatedIdea.thesis}</Text>
              </View>
            )}

            {/* Modal Buttons */}
            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={handleResetForm}
                style={[styles.modalSecondaryBtn, { backgroundColor: theme.cardSecondary, borderColor: theme.cardBorder }]}
              >
                <Text style={[styles.modalSecondaryText, { color: theme.text }]}>Audit Another</Text>
              </Pressable>

              <Pressable
                onPress={handleDoneAndNavigate}
                style={[styles.modalPrimaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.modalPrimaryText}>View in Syndicate Directory</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
  },
  webContentWrapper: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 680,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 20,
  },
  desktopMainLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formColumn: {
    width: '100%',
  },
  desktopFormColumn: {
    flex: 1.4,
  },
  infoColumn: {
    width: '100%',
  },
  desktopInfoColumn: {
    flex: 1,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12.5,
    letterSpacing: 0.1,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  pillSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  choicePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  choicePillText: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  splitCol: {
    flex: 1,
  },
  choiceGroup: {
    gap: 6,
    marginTop: 6,
  },
  stageChoiceBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  stageChoiceText: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
  },
  textAreaWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
  },
  textAreaInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  infoCardDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  criteriaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  criteriaTextCol: {
    flex: 1,
  },
  criteriaTitle: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  criteriaDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  proTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  proTipText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    fontFamily: 'Inter_500Medium',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  radarModal: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  radarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 18,
    overflow: 'hidden',
  },
  radarSweep: {
    ...StyleSheet.absoluteFillObject,
  },
  analysingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    marginBottom: 6,
  },
  analysingMessage: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center',
  },
  shimmerWrapper: {
    width: '100%',
  },
  resultModal: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resultMetaCol: {
    flex: 1,
  },
  resultVentureName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    marginBottom: 4,
  },
  resultVerdictPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  resultVerdictText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  resultSectorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
  },
  resultMetricsBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  metricItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricName: {
    width: 110,
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
  },
  modalMetricBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  modalMetricBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricScoreText: {
    width: 34,
    textAlign: 'right',
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  resultThesisBox: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
  },
  thesisLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  thesisBody: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: 'Inter_500Medium',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalSecondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
  },
  modalPrimaryBtn: {
    flex: 1.5,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 12.5,
  },
});
