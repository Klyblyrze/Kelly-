import React, { useState, useMemo } from 'react';
import {
  PatternInsight,
  GeneratedPrompt,
  MoodEntry,
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  AiCoWorkData,
  GeminiSparkData,
  MoodForecast,
  MoodForecastDay,
  SobrietyRecoveryContext,
} from '../types/journal';
import {
  Sparkles,
  RefreshCw,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sun,
  Flame,
  Watch,
  CheckSquare,
  HeartPulse,
  Moon,
  Footprints,
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Compass,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  Pin,
  PinOff,
  Copy,
  Check,
  Sliders,
  Eye,
  Gauge,
  CloudRain,
  CloudSun,
  Wind,
  CheckCircle2,
  HelpCircle,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';

export type SubTabMode =
  | 'predictive'
  | 'scatter'
  | 'simulator'
  | 'radar'
  | 'prompts'
  | 'all';

interface PatternInsightsViewProps {
  entries: MoodEntry[];
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth?: SamsungHealthData;
  tasks?: TaskProjectData;
  aiCoWork?: AiCoWorkData;
  geminiSpark?: GeminiSparkData;
  sobriety?: SobrietyRecoveryContext;
  initialTab?: SubTabMode;
  onSelectPrompt: (promptText: string) => void;
  onOpenIntegrations: () => void;
}

export type BiometricMetricKey =
  | 'restingHeartRate'
  | 'sleepQuality'
  | 'hrvScore'
  | 'stressScore'
  | 'deepSleepPercentage'
  | 'dailySteps'
  | 'energyScore'
  | 'cravingIntensity';

interface MetricOption {
  key: BiometricMetricKey;
  label: string;
  shortLabel: string;
  category:
    | 'Physical (Samsung Health)'
    | 'Mental & Autonomic (Welltory)'
    | 'Sobriety & Recovery Protocol';
  unit: string;
  optimalThreshold: number;
  optimalLabel: string;
  minDomain: number;
  maxDomain: number;
  inverse: boolean; // true if lower is better (e.g. resting HR, stress)
  color: string;
  icon: React.ReactNode;
  description: string;
  scientificContext: string;
}

const METRIC_OPTIONS: MetricOption[] = [
  {
    key: 'restingHeartRate',
    label: 'Resting Heart Rate',
    shortLabel: 'Resting HR',
    category: 'Physical (Samsung Health)',
    unit: 'bpm',
    optimalThreshold: 60,
    optimalLabel: 'Optimal Resting HR (<60 bpm)',
    minDomain: 45,
    maxDomain: 85,
    inverse: true,
    color: '#EF4444',
    icon: <HeartPulse className="w-3.5 h-3.5" />,
    description: 'Cardiovascular resting rhythm tracked via Samsung Health sensors.',
    scientificContext:
      'Lower resting heart rate indicates strong vagal brake tone and parasympathetic dominance, buffering against panic and impulsive frustration.',
  },
  {
    key: 'sleepQuality',
    label: 'Sleep Quality',
    shortLabel: 'Sleep Quality',
    category: 'Physical (Samsung Health)',
    unit: '%',
    optimalThreshold: 80,
    optimalLabel: 'Restorative Sleep (>80%)',
    minDomain: 45,
    maxDomain: 100,
    inverse: false,
    color: '#3B82F6',
    icon: <Moon className="w-3.5 h-3.5" />,
    description: 'Overall sleep architecture, latency, and sleep stage balance.',
    scientificContext:
      'High sleep quality replenishes prefrontal executive control, allowing proactive reframing of difficult projects and emotional triggers.',
  },
  {
    key: 'hrvScore',
    label: 'Autonomic HRV',
    shortLabel: 'HRV (RMSSD)',
    category: 'Mental & Autonomic (Welltory)',
    unit: 'ms',
    optimalThreshold: 65,
    optimalLabel: 'High Resilience (>65 ms)',
    minDomain: 35,
    maxDomain: 95,
    inverse: false,
    color: '#10B981',
    icon: <Activity className="w-3.5 h-3.5" />,
    description: 'Heart Rate Variability (RMSSD), the gold standard biomarker for nervous system adaptability.',
    scientificContext:
      'Elevated HRV sends afferent neurochemical signals to the amygdala that the body is safe, directly enabling self-compassion and gratitude.',
  },
  {
    key: 'stressScore',
    label: 'Physiological Stress',
    shortLabel: 'Stress Level',
    category: 'Mental & Autonomic (Welltory)',
    unit: '%',
    optimalThreshold: 45,
    optimalLabel: 'Mild Stress Barrier (<45%)',
    minDomain: 10,
    maxDomain: 90,
    inverse: true,
    color: '#F97316',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    description: 'Autonomic nervous system tension index computed from vascular pulse wave analysis.',
    scientificContext:
      'Elevated stress scores precede cognitive biases such as catastrophizing and black-and-white thinking during project crunches.',
  },
  {
    key: 'deepSleepPercentage',
    label: 'Deep Sleep Ratio',
    shortLabel: 'Deep Sleep %',
    category: 'Physical (Samsung Health)',
    unit: '%',
    optimalThreshold: 18,
    optimalLabel: 'Restorative Threshold (>18%)',
    minDomain: 8,
    maxDomain: 28,
    inverse: false,
    color: '#6366F1',
    icon: <Moon className="w-3.5 h-3.5" />,
    description: 'Percentage of sleep spent in restorative stage-3 slow-wave sleep.',
    scientificContext:
      'Slow-wave deep sleep consolidates procedural memory, resets baseline cortisol, and prevents irritability during morning meetings.',
  },
  {
    key: 'dailySteps',
    label: 'Daily Steps & Ambulation',
    shortLabel: 'Daily Steps',
    category: 'Physical (Samsung Health)',
    unit: 'steps',
    optimalThreshold: 8000,
    optimalLabel: 'Activity Anchor (>8,000 steps)',
    minDomain: 2500,
    maxDomain: 14000,
    inverse: false,
    color: '#14B8A6',
    icon: <Footprints className="w-3.5 h-3.5" />,
    description: 'Physical movement logged through wearable pedometer and ambient sensors.',
    scientificContext:
      'Bilateral movement during outdoor walking stimulates optic flow, dampening amygdala hyperactivity and reducing somatic agitation.',
  },
  {
    key: 'energyScore',
    label: 'Energy Battery',
    shortLabel: 'Energy Battery',
    category: 'Mental & Autonomic (Welltory)',
    unit: '%',
    optimalThreshold: 70,
    optimalLabel: 'High Bandwidth (>70%)',
    minDomain: 25,
    maxDomain: 95,
    inverse: false,
    color: '#F59E0B',
    icon: <BatteryCharging className="w-3.5 h-3.5" />,
    description: 'Metabolic and emotional stamina reservoir computed from circadian and HRV data.',
    scientificContext:
      'Adequate energy reserves give you the cognitive RAM required to maintain boundaries instead of yielding to reactive people-pleasing.',
  },
  {
    key: 'cravingIntensity',
    label: 'Alcohol Craving & Urge Level',
    shortLabel: 'Craving Level',
    category: 'Sobriety & Recovery Protocol',
    unit: '/10',
    optimalThreshold: 2,
    optimalLabel: 'Safe Urge Baseline (<2 / 10)',
    minDomain: 0,
    maxDomain: 10,
    inverse: true,
    color: '#059669',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    description: 'Subjective alcohol craving and urge intensity rating (0 = zero desire, 10 = acute urge wave).',
    scientificContext:
      'Alcohol cravings correlate with dopamine dips and sleep deficits. Practicing urge surfing and HALT resets reliably drops craving intensity by 4-6 points within 3 minutes.',
  },
];

// Helper to compute Pearson correlation coefficient between two numeric arrays
function computePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : Number((numerator / denom).toFixed(2));
}

export const PatternInsightsView: React.FC<PatternInsightsViewProps> = ({
  entries,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  aiCoWork,
  geminiSpark,
  sobriety,
  initialTab = 'predictive',
  onSelectPrompt,
  onOpenIntegrations,
}) => {
  // Navigation sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<SubTabMode>(initialTab);

  // Pattern analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<string>(
    'Your journal history reflects deep links between sprint deadlines and somatic tension. Restorative sleep and evening walking rituals reliably break cognitive loops.'
  );

  const [insights, setInsights] = useState<PatternInsight[]>([
    {
      id: 'insight-1',
      title: 'TickTick Sprint Crunch & Somatic Tension',
      timeframe: 'Project Deadlines',
      observation:
        'When high-priority task deadlines exceed 4 in TickTick, entries show an immediate elevation in chest tightness and anxiety, mitigated when boundaries are actively declared.',
      patternType: 'trigger',
      suggestedPrompts: [
        'What non-negotiable boundary can you set at 2 PM before cognitive fatigue transforms into irritability?',
      ],
      dominantEmotions: [
        { name: 'Anxious', percentage: 45, color: '#8B5CF6' },
        { name: 'Frustrated', percentage: 35, color: '#EF4444' },
        { name: 'Peaceful', percentage: 20, color: '#F59E0B' },
      ],
    },
    {
      id: 'insight-2',
      title: 'Samsung Health Sleep & Baseline Irritability',
      timeframe: 'Sleep Deficit Cycles',
      observation:
        'Nights with under 6.5 hours of sleep coincide with 2.8× higher frequency of annoyance during afternoon meetings.',
      patternType: 'rhythm',
      suggestedPrompts: [
        'How can you introduce a 10-minute sensory micro-walk into stressful weekdays to preempt burnout?',
      ],
      dominantEmotions: [
        { name: 'Content', percentage: 65, color: '#F59E0B' },
        { name: 'Amazed', percentage: 35, color: '#06B6D4' },
      ],
    },
    {
      id: 'insight-3',
      title: 'Claude Co-Work & Presentation Breakthroughs',
      timeframe: 'Recent 14 Days',
      observation:
        'Using structured AI co-work sessions to unpack complex dependencies before major presentations directly helped anticipatory anxiety resolve into pride and self-trust.',
      patternType: 'shift',
      suggestedPrompts: [
        'What complex project knot can you externalize onto the page right now to free up mental RAM?',
      ],
      dominantEmotions: [
        { name: 'Confident', percentage: 50, color: '#F59E0B' },
        { name: 'Proud', percentage: 30, color: '#F59E0B' },
        { name: 'Fragile', percentage: 20, color: '#3B82F6' },
      ],
    },
  ]);

  const [patternPrompts, setPatternPrompts] = useState<GeneratedPrompt[]>([
    {
      id: 'pp-1',
      category: 'Cognitive Shift',
      prompt:
        'Looking across your past month of entries, you frequently experience anxiety before delivering presentations, followed by profound pride. How can your current self reassure your future self before the next milestone?',
      rationale:
        'Anchors the observed pattern of anticipatory anxiety resolving into pride and competence.',
    },
    {
      id: 'pp-2',
      category: 'Somatic & Grounding',
      prompt:
        'Your body repeatedly registers tension in the chest and jaw when meetings run over. What somatic pause (unclenching jaw, three physiological sighs) can you practice right now?',
      rationale:
        'Targets recurring somatic clues noted in your high-stress journal entries.',
    },
    {
      id: 'pp-3',
      category: 'Deep Reflection',
      prompt:
        'You have logged multiple entries celebrating simple, quiet moments (fresh water, golden hour walks). What daily life complexity can you simplify to make more room for these peaceful anchors?',
      rationale:
        'Reinforces the restorative rhythm highlighted by your highest-scoring contentment entries.',
    },
  ]);

  // Scatter plot visualization state
  const [activeMetricKey, setActiveMetricKey] = useState<BiometricMetricKey>('restingHeartRate');
  const [scatterTimeframe, setScatterTimeframe] = useState<'30d' | '14d' | '7d'>('30d');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');

  // Interactive scatter point selection/pinning
  const [pinnedPointId, setPinnedPointId] = useState<string | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [copiedPointId, setCopiedPointId] = useState<string | null>(null);

  // Mood forecast state (expanded 5-day predictive trajectory)
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecast, setForecast] = useState<MoodForecast>({
    projectedHorizon: 'Midweek Sprint Peak with Weekend Decompression Window',
    forecastSummary:
      'Given recent emotional stability paired with ongoing sprint demands on Product Launch v2.0, watch for slight afternoon cognitive fatigue on Thursday before restorative momentum rebuilds heading into the weekend.',
    resilienceBufferScore: 78,
    days: [
      {
        dayLabel: 'Tomorrow (Day 1)',
        dateStr: 'Tomorrow',
        predictedValence: 'Focused',
        predictedIntensity: 7.2,
        riskFactors: ['High sprint deliverable workload', 'Back-to-back calendar calls'],
        protectiveFactors: ['Adequate baseline sleep (82% quality)', 'Clear morning priorities'],
        somaticRecommendation:
          'Practice 2-minute physiological sighing between meetings to prevent adrenaline spikes.',
      },
      {
        dayLabel: 'In 2 Days (Day 2)',
        dateStr: 'Midweek Crunch',
        predictedValence: 'Strained',
        predictedIntensity: 8.1,
        riskFactors: ['Frontend release candidate deadline', 'Cognitive context switching'],
        protectiveFactors: ['Structured boundary setting', 'Scheduled Claude Co-Work session'],
        somaticRecommendation:
          'Unclench jaw and do 5 shoulder rolls every 2 hours to release trapezius tension.',
      },
      {
        dayLabel: 'In 3 Days (Day 3)',
        dateStr: 'Sprint Milestone',
        predictedValence: 'Relieved',
        predictedIntensity: 6.8,
        riskFactors: ['Residual nervous fatigue from project sprint'],
        protectiveFactors: ['Post-milestone relief', 'Planned evening outdoor nature walk'],
        somaticRecommendation:
          'Take a 45-minute tech-free sensory immersion walk during golden hour.',
      },
      {
        dayLabel: 'In 4 Days (Day 4)',
        dateStr: 'Weekend Horizon',
        predictedValence: 'Peaceful',
        predictedIntensity: 6.0,
        riskFactors: ['Cognitive hangover from previous deadline intensity'],
        protectiveFactors: ['Clear calendar space', 'Morning light exposure & reading'],
        somaticRecommendation:
          'Slow diaphragm breathing while listening to ambient instrumental soundscapes.',
      },
      {
        dayLabel: 'In 5 Days (Day 5)',
        dateStr: 'Rebound Rest',
        predictedValence: 'Flourishing',
        predictedIntensity: 8.5,
        riskFactors: ['Anticipatory Monday prep urge'],
        protectiveFactors: ['Restored HRV balance (>70 ms)', 'Deep sleep recovery buffer'],
        somaticRecommendation:
          'Brisk morning trail walk followed by a hot recovery tea ritual.',
      },
    ],
    preemptiveJournalPrompt:
      'Before tomorrow’s project sprint picks up speed, what is the single non-negotiable boundary that will protect your peace of mind?',
    preemptivePromptRationale:
      'Preemptively anchors self-regulation before task pressure triggers reactive anxiety.',
  });

  // What-If Predictive Scenario Simulator State
  const [simSleepDuration, setSimSleepDuration] = useState<number>(8.0);
  const [simTaskLoad, setSimTaskLoad] = useState<number>(3);
  const [simWalkingSteps, setSimWalkingSteps] = useState<number>(8500);
  const [simSomaticMinutes, setSimSomaticMinutes] = useState<number>(15);

  const simulatedPredictions = useMemo(() => {
    // Baseline calculations
    const sleepDelta = simSleepDuration - 7.0; // Baseline 7 hours
    const taskDelta = simTaskLoad - 3; // Baseline 3 tasks
    const stepsDelta = (simWalkingSteps - 6000) / 1000;
    const somaticDelta = simSomaticMinutes / 10;

    // Projected mood (scale 1 - 10)
    let projectedMood = 7.0 + sleepDelta * 0.7 - taskDelta * 0.45 + stepsDelta * 0.15 + somaticDelta * 0.35;
    projectedMood = Math.max(1, Math.min(9.8, Number(projectedMood.toFixed(1))));

    // Projected Stress % (lower is better)
    let projectedStress = 48 - sleepDelta * 6 + taskDelta * 7 - stepsDelta * 2 - somaticDelta * 5;
    projectedStress = Math.max(12, Math.min(88, Math.round(projectedStress)));

    // Projected HRV ms (higher is better)
    let projectedHrv = 62 + sleepDelta * 4 - taskDelta * 3 + stepsDelta * 1.5 + somaticDelta * 3.5;
    projectedHrv = Math.max(30, Math.min(95, Math.round(projectedHrv)));

    // Burnout risk calculation
    const allostaticLoad = Math.max(
      8,
      Math.min(92, Math.round(projectedStress * 0.55 + (10 - projectedMood) * 3.5 + (80 - projectedHrv) * 0.3))
    );

    return {
      projectedMood,
      projectedStress,
      projectedHrv,
      allostaticLoad,
      valenceRating:
        projectedMood >= 7.8
          ? 'High Flourishing'
          : projectedMood >= 6.5
          ? 'Calm & Productive'
          : projectedMood >= 5.0
          ? 'Mild Strain'
          : 'High Vulnerability',
    };
  }, [simSleepDuration, simTaskLoad, simWalkingSteps, simSomaticMinutes]);

  const activeMetric = useMemo(
    () => METRIC_OPTIONS.find((m) => m.key === activeMetricKey) || METRIC_OPTIONS[0],
    [activeMetricKey]
  );

  // Filter entries for the scatter plot
  const filteredScatterEntries = useMemo(() => {
    const daysLimit = scatterTimeframe === '7d' ? 7 : scatterTimeframe === '14d' ? 14 : 30;
    const now = new Date().getTime();

    return entries.filter((entry) => {
      const entryTime = new Date(entry.timestamp || entry.date).getTime();
      const diffDays = Math.max(0, (now - entryTime) / (1000 * 60 * 60 * 24));
      if (diffDays > daysLimit) return false;

      if (selectedEmotionFilter !== 'all') {
        if (entry.primaryEmotion.toLowerCase() !== selectedEmotionFilter.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [entries, scatterTimeframe, selectedEmotionFilter]);

  // Construct scatter data points with detailed metadata
  const scatterData = useMemo(() => {
    return filteredScatterEntries.map((entry) => {
      const snap = entry.biometricsSnapshot;
      let val = 0;

      switch (activeMetricKey) {
        case 'restingHeartRate':
          val = snap?.restingHeartRate ?? (samsungHealth?.restingHeartRate || 64);
          break;
        case 'sleepQuality':
          val = snap?.sleepQuality ?? (samsungHealth?.sleepQuality || 76);
          break;
        case 'hrvScore':
          val = snap?.hrvScore ?? (welltory?.hrvScore || 62);
          break;
        case 'stressScore':
          val = snap?.stressScore ?? (welltory?.stressScore || 50);
          break;
        case 'deepSleepPercentage':
          val = snap?.sleepHours
            ? Math.round((snap.sleepHours / 8) * 20)
            : samsungHealth?.deepSleepPercentage || 18;
          break;
        case 'dailySteps':
          val = snap?.dailySteps ?? (samsungHealth?.dailySteps || 7500);
          break;
        case 'energyScore':
          val = snap?.energyScore ?? (welltory?.energyScore || 65);
          break;
        case 'cravingIntensity':
          val = entry.recoverySnapshot?.cravingLevel ?? (sobriety?.currentCravingLevel ?? 2);
          break;
        default:
          val = snap?.restingHeartRate || 64;
      }

      const restingHr = snap?.restingHeartRate ?? (samsungHealth?.restingHeartRate || 62);
      const sleepQual = snap?.sleepQuality ?? (samsungHealth?.sleepQuality || 78);
      const hrv = snap?.hrvScore ?? (welltory?.hrvScore || 64);
      const stress = snap?.stressScore ?? (welltory?.stressScore || 45);
      const deepSleep = snap?.sleepHours ? Math.round((snap.sleepHours / 8) * 20) : 18;
      const steps = snap?.dailySteps ?? (samsungHealth?.dailySteps || 7800);
      const energy = snap?.energyScore ?? (welltory?.energyScore || 68);

      const deltaToOptimal = activeMetric.inverse
        ? activeMetric.optimalThreshold - val
        : val - activeMetric.optimalThreshold;

      return {
        id: entry.id,
        date: entry.date,
        time: entry.time || '12:00 PM',
        primaryEmotion: entry.primaryEmotion,
        secondaryEmotion: entry.secondaryEmotion || '',
        tertiaryEmotion: entry.tertiaryEmotion || '',
        emotionPath: [entry.primaryEmotion, entry.secondaryEmotion, entry.tertiaryEmotion]
          .filter(Boolean)
          .join(' > '),
        color: entry.emotionColor || '#F59E0B',
        moodScore: entry.intensity, // X-axis (1 - 10)
        biometricValue: val, // Y-axis
        restingHeartRate: restingHr,
        sleepQuality: sleepQual,
        hrvScore: hrv,
        stressScore: stress,
        deepSleepPercentage: deepSleep,
        dailySteps: steps,
        energyScore: energy,
        deltaToOptimal,
        isOptimal: activeMetric.inverse
          ? val <= activeMetric.optimalThreshold
          : val >= activeMetric.optimalThreshold,
        somaticSensations: entry.somaticSensations || [],
        journalSnippet: entry.journalText.slice(0, 160),
        fullJournalText: entry.journalText,
        promptUsed: entry.promptUsed,
        tags: entry.tags || [],
        sprintPressure:
          entry.projectContextSnapshot?.sprintPressure ||
          tasks?.currentSprintPressure ||
          'Normal',
        pendingTasks:
          entry.projectContextSnapshot?.pendingTasks ||
          tasks?.pendingHighPriorityTasks ||
          2,
        activeProject:
          entry.projectContextSnapshot?.activeProject ||
          tasks?.activeProjects?.[0] ||
          'Core Sprints',
      };
    });
  }, [filteredScatterEntries, activeMetricKey, activeMetric, samsungHealth, welltory, tasks]);

  // Active inspected point (either pinned or hovered)
  const activeInspectedPoint = useMemo(() => {
    if (pinnedPointId) {
      return scatterData.find((p) => p.id === pinnedPointId) || null;
    }
    if (hoveredPointId) {
      return scatterData.find((p) => p.id === hoveredPointId) || null;
    }
    return scatterData[0] || null;
  }, [pinnedPointId, hoveredPointId, scatterData]);

  // Compute correlation statistics
  const correlationStats = useMemo(() => {
    if (scatterData.length < 3) {
      return {
        r: 0,
        strength: 'Insufficient Data',
        takeaway: 'Log more check-ins to reveal statistically sound biometric trends.',
      };
    }

    const xVals = scatterData.map((d) => d.moodScore);
    const yVals = scatterData.map((d) => d.biometricValue);
    const r = computePearsonCorrelation(xVals, yVals);

    let strength = 'Neutral / Weak';
    let takeaway = '';

    if (activeMetric.inverse) {
      if (r <= -0.55) {
        strength = 'Strong Inverse Correlation';
        takeaway = `When your mood score rises above 7, your ${activeMetric.label} drops significantly (averaging ${(
          scatterData.filter((d) => d.moodScore >= 7).reduce((acc, d) => acc + d.biometricValue, 0) /
          Math.max(1, scatterData.filter((d) => d.moodScore >= 7).length)
        ).toFixed(0)} ${activeMetric.unit}), showing that emotional serenity directly eases autonomic tension.`;
      } else if (r <= -0.25) {
        strength = 'Moderate Inverse Correlation';
        takeaway = `Noticeable trend: higher emotional fulfillment tracks with cooler, calmer ${activeMetric.label} readings.`;
      } else {
        strength = 'Weak / Dispersed Correlation';
        takeaway = `Your ${activeMetric.label} exhibits baseline variability across both high and low mood states.`;
      }
    } else {
      if (r >= 0.55) {
        strength = 'Strong Positive Correlation';
        takeaway = `Days following high ${activeMetric.label} (> ${activeMetric.optimalThreshold} ${activeMetric.unit}) show an average mood intensity of ${(
          scatterData.filter((d) => d.biometricValue >= activeMetric.optimalThreshold).reduce((acc, d) => acc + d.moodScore, 0) /
          Math.max(1, scatterData.filter((d) => d.biometricValue >= activeMetric.optimalThreshold).length)
        ).toFixed(1)}/10, confirming physical recovery as a vital psychological launchpad.`;
      } else if (r >= 0.25) {
        strength = 'Moderate Positive Correlation';
        takeaway = `Higher ${activeMetric.label} provides an observable emotional buffer during stressful sprint moments.`;
      } else {
        strength = 'Mild / Dispersed Correlation';
        takeaway = `Cognitive and interpersonal factors also strongly influence your mood alongside ${activeMetric.label}.`;
      }
    }

    return { r, strength, takeaway };
  }, [scatterData, activeMetric]);

  // Handle run pattern analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const payload = {
        entries: entries.slice(0, 20).map((e) => ({
          date: e.date,
          emotion: `${e.primaryEmotion} > ${e.secondaryEmotion || ''}`,
          intensity: e.intensity,
          somatic: e.somaticSensations,
          journalSnippet: e.journalText.slice(0, 160),
        })),
        welltoryContext: welltory,
        mindsaraContext: mindsara,
        samsungHealthContext: samsungHealth,
        taskProjectContext: tasks,
        aiCoWorkContext: aiCoWork,
      };

      const res = await fetch('/api/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.insights && data.insights.length > 0) setInsights(data.insights);
      if (data.patternPrompts && data.patternPrompts.length > 0)
        setPatternPrompts(data.patternPrompts);
    } catch (err) {
      console.warn('Notice analyzing mood patterns:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle AI Mood Forecast generation
  const handleGenerateForecast = async () => {
    setIsForecasting(true);
    try {
      const payload = {
        recentEntries: entries.slice(0, 7).map((e) => ({
          date: e.date,
          emotion: `${e.primaryEmotion} > ${e.secondaryEmotion || ''}`,
          intensity: e.intensity,
          somatic: e.somaticSensations,
          journalSnippet: e.journalText.slice(0, 160),
        })),
        taskContext: tasks,
        healthContext: samsungHealth,
        welltoryContext: welltory,
      };

      const res = await fetch('/api/mood-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: MoodForecast = await res.json();
      if (data.projectedHorizon && data.days && data.days.length > 0) {
        setForecast(data);
      }
    } catch (err) {
      console.warn('Notice generating mood forecast:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  const handleCopySnapshot = (point: (typeof scatterData)[0]) => {
    const text = `Mood Check-in: ${point.primaryEmotion} (${point.moodScore}/10)\nDate: ${point.date} ${point.time}\n${activeMetric.label}: ${point.biometricValue} ${activeMetric.unit}\nResting HR: ${point.restingHeartRate} bpm | Sleep: ${point.sleepQuality}% | HRV: ${point.hrvScore}ms | Stress: ${point.stressScore}%\nReflection: "${point.journalSnippet}"`;
    navigator.clipboard?.writeText(text);
    setCopiedPointId(point.id);
    setTimeout(() => setCopiedPointId(null), 2500);
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'resilience':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'shift':
        return <Flame className="w-4 h-4 text-indigo-500" />;
      default:
        return <Brain className="w-4 h-4 text-blue-500" />;
    }
  };

  const getWeatherIcon = (valence: string, intensity: number) => {
    const v = valence.toLowerCase();
    if (v.includes('peace') || v.includes('flourish') || v.includes('rebound')) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
    if (v.includes('strain') || v.includes('crunch') || intensity >= 8) {
      return <CloudRain className="w-5 h-5 text-rose-500" />;
    }
    if (v.includes('focus') || v.includes('relieved')) {
      return <CloudSun className="w-5 h-5 text-indigo-500" />;
    }
    return <Wind className="w-5 h-5 text-cyan-500" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 🔮 TOP PREDICTIVE & PATTERN INTELLIGENCE SUITE NAVIGATION BAR            */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white shadow-md">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold font-serif-heading text-white">
                Predictive Intelligence & Pattern Analytics
              </h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm ring-1 ring-white/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                AI Predictive Engine Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Synthesizing historical journal trajectories with wearable biometric recovery (Samsung Health sleep & resting HR, Welltory autonomic HRV) and TickTick sprint deadlines to project upcoming emotional weather, burnout risk, and personalized inoculations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={handleGenerateForecast}
              disabled={isForecasting}
              className="flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isForecasting ? 'animate-spin' : ''}`} />
              <span>{isForecasting ? 'Forecasting Horizon...' : 'Refresh AI Forecast'}</span>
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs md:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl transition-all border border-slate-700 active:scale-95"
            >
              <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Patterns</span>
            </button>
          </div>
        </div>

        {/* Predictive Quick-Telemetry KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">72h Horizon</span>
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="font-bold text-sm text-white line-clamp-1">Midweek Crunch</div>
            <span className="text-[10px] text-indigo-300">Peak strain predicted Thu</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Resilience Buffer</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="font-bold text-sm text-emerald-400">
              {forecast.resilienceBufferScore}% Buffer
            </div>
            <span className="text-[10px] text-slate-400">Optimal autonomic cushion</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Burnout Radar</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="font-bold text-sm text-amber-400">
              {simulatedPredictions.allostaticLoad}% Load (Low)
            </div>
            <span className="text-[10px] text-slate-400">Safe allostatic reserve</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Biometric Scatter</span>
              <Activity className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="font-bold text-sm text-rose-300">
              {scatterData.length} Plotted Points
            </div>
            <span className="text-[10px] text-slate-400">Interactive metadata active</span>
          </div>
        </div>

        {/* SUB-TAB SELECTOR BAR */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-xs font-semibold text-slate-400 mr-2">Focus Mode:</span>
          {[
            {
              id: 'predictive' as const,
              label: '🔮 AI Predictive Horizon (5-Day)',
              badge: 'Predictive',
              color: 'bg-indigo-600 text-white',
            },
            {
              id: 'scatter' as const,
              label: '📊 Biometric Scatter Plot',
              badge: 'Interactive Tooltip',
              color: 'bg-slate-800 text-slate-200 hover:text-white',
            },
            {
              id: 'simulator' as const,
              label: '🧪 "What-If" Scenario Simulator',
              badge: 'Live Engine',
              color: 'bg-slate-800 text-slate-200 hover:text-white',
            },
            {
              id: 'radar' as const,
              label: '🛡️ Burnout & Fatigue Risk Radar',
              badge: 'Allostatic',
              color: 'bg-slate-800 text-slate-200 hover:text-white',
            },
            {
              id: 'prompts' as const,
              label: '⚡ Preemptive Inoculations',
              badge: 'Proactive',
              color: 'bg-slate-800 text-slate-200 hover:text-white',
            },
            {
              id: 'all' as const,
              label: '👁️ Complete View (All Sections)',
              badge: 'Full Suite',
              color: 'bg-slate-800 text-slate-200 hover:text-white',
            },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md font-bold ring-2 ring-indigo-400/40'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-slate-900 text-slate-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔮 SECTION A: AI PREDICTIVE MOOD FORECAST (5-DAY WEATHER & TRAJECTORY)    */}
      {/* ========================================================================= */}
      {(activeSubTab === 'predictive' || activeSubTab === 'all') && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <Compass className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                  AI Predictive Mood Weather & Horizon (Upcoming 3–5 Days)
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Forecasting upcoming emotional weather by correlating your 7-day emotional velocity with wearable sleep debt, TickTick sprint deadlines ({tasks?.currentSprintPressure || 'High'} Pressure), and autonomic HRV recovery.
              </p>
            </div>

            <button
              onClick={handleGenerateForecast}
              disabled={isForecasting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs self-start"
            >
              <RefreshCw className={`w-4 h-4 ${isForecasting ? 'animate-spin' : ''}`} />
              <span>{isForecasting ? 'Forecasting Trajectory...' : 'Regenerate Forecast'}</span>
            </button>
          </div>

          {/* Projected Horizon Card with Resilience Buffer */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden space-y-4">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                    Projected Emotional Horizon
                  </span>
                  <span className="text-xs text-slate-400">Next 72–120 Hours</span>
                </div>
                <h4 className="text-lg md:text-xl font-bold font-serif-heading text-white">
                  {forecast.projectedHorizon}
                </h4>
              </div>

              {/* Resilience Buffer Score Badge */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0 min-w-56 text-right">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Resilience Buffer:</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {forecast.resilienceBufferScore}%
                  </span>
                </div>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${forecast.resilienceBufferScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">
                  {forecast.resilienceBufferScore >= 75
                    ? 'Optimal Autonomic Capacity • Strong Protective Margin'
                    : forecast.resilienceBufferScore >= 50
                    ? 'Moderate Reserve • Monitor Sprint Deadlines'
                    : 'Nearing Allostatic Depletion • Prioritize Rest'}
                </span>
              </div>
            </div>

            <p className="text-sm text-indigo-100/90 font-serif-heading leading-relaxed relative z-10 border-t border-white/10 pt-3">
              "{forecast.forecastSummary}"
            </p>
          </div>

          {/* 5-Day Forecast Weather Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {forecast.days.map((day, idx) => {
              const isHighStrain =
                day.predictedIntensity >= 8 ||
                day.predictedValence.toLowerCase().includes('strain') ||
                day.predictedValence.toLowerCase().includes('crunch');
              const isPeaceful =
                day.predictedValence.toLowerCase().includes('peace') ||
                day.predictedValence.toLowerCase().includes('rebound') ||
                day.predictedValence.toLowerCase().includes('flourish');

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all shadow-2xs flex flex-col justify-between space-y-3.5 ${
                    isHighStrain
                      ? 'bg-rose-50/50 border-rose-200/90'
                      : isPeaceful
                      ? 'bg-emerald-50/50 border-emerald-200/90'
                      : 'bg-slate-50/80 border-slate-200/90'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {day.dayLabel}
                      </span>
                      <div className="p-1 rounded-lg bg-white shadow-2xs">
                        {getWeatherIcon(day.predictedValence, day.predictedIntensity)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isHighStrain
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isPeaceful
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        }`}
                      >
                        {day.predictedValence}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {day.predictedIntensity}/10
                      </span>
                    </div>

                    {/* Intensity Meter */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isHighStrain
                              ? 'bg-rose-500'
                              : isPeaceful
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${day.predictedIntensity * 10}%` }}
                        />
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {day.riskFactors?.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Risk
                        </span>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {day.riskFactors[0]}
                        </p>
                      </div>
                    )}

                    {/* Protective Factors */}
                    {day.protectiveFactors?.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Buffer
                        </span>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {day.protectiveFactors[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Somatic Recommendation */}
                  {day.somaticRecommendation && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Somatic Reset
                      </span>
                      <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-xl border border-slate-200/60 leading-snug">
                        "{day.somaticRecommendation}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Preemptive Journal Inoculation Box */}
          {forecast.preemptiveJournalPrompt && (
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Preemptive Stress Inoculation Prompt (Write Before Stress Arrives)
                </div>
                <p className="text-sm font-semibold text-amber-950 font-serif-heading leading-snug">
                  "{forecast.preemptiveJournalPrompt}"
                </p>
                {forecast.preemptivePromptRationale && (
                  <p className="text-xs text-amber-800/80 italic">
                    💡 {forecast.preemptivePromptRationale}
                  </p>
                )}
              </div>

              <button
                onClick={() => onSelectPrompt(forecast.preemptiveJournalPrompt)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-xl transition-all shadow-xs shrink-0 self-start md:self-auto active:scale-95"
              >
                <span>Journal with this Preemptive Prompt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧪 SECTION B: INTERACTIVE "WHAT-IF" PREDICTIVE SCENARIO SIMULATOR        */}
      {/* ========================================================================= */}
      {(activeSubTab === 'simulator' || activeSubTab === 'predictive' || activeSubTab === 'all') && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                  Interactive "What-If" Predictive Scenario Simulator
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Simulate how adjusting tonight’s sleep, task deadlines, outdoor walking, or somatic pauses will dynamically shift tomorrow’s emotional energy and physiological stress index.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 self-start">
              Live Predictive Model
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders Control Panel */}
            <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Adjust Projected Interventions:
              </span>

              {/* Slider 1: Sleep Duration */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-blue-600" />
                    Target Sleep Tonight
                  </span>
                  <span className="text-blue-700 font-extrabold text-sm">{simSleepDuration} hrs</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.5"
                  step="0.5"
                  value={simSleepDuration}
                  onChange={(e) => setSimSleepDuration(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5.0h (Deficit)</span>
                  <span>7.5h (Optimal)</span>
                  <span>9.5h (Deep Recovery)</span>
                </div>
              </div>

              {/* Slider 2: Sprint Task Load */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    High-Priority Tasks Pending (TickTick)
                  </span>
                  <span className="text-indigo-700 font-extrabold text-sm">{simTaskLoad} tasks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={simTaskLoad}
                  onChange={(e) => setSimTaskLoad(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Light)</span>
                  <span>3 (Balanced)</span>
                  <span>8 (Crunch Overload)</span>
                </div>
              </div>

              {/* Slider 3: Daily Steps */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                    Outdoor Walking / Ambulation
                  </span>
                  <span className="text-emerald-700 font-extrabold text-sm">
                    {simWalkingSteps.toLocaleString()} steps
                  </span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="13500"
                  step="500"
                  value={simWalkingSteps}
                  onChange={(e) => setSimWalkingSteps(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2,500 (Sedentary)</span>
                  <span>8,000 (Anchor)</span>
                  <span>13,500 (Vigorous)</span>
                </div>
              </div>

              {/* Slider 4: Somatic Pauses */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                    Somatic Breathing & Grounding Pauses
                  </span>
                  <span className="text-rose-700 font-extrabold text-sm">{simSomaticMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={simSomaticMinutes}
                  onChange={(e) => setSimSomaticMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 min (Continuous)</span>
                  <span>15 min (Recommended)</span>
                  <span>40 min (Deep Reset)</span>
                </div>
              </div>
            </div>

            {/* Dynamic Predicted Outcome Display */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                  Projected Trajectory for Tomorrow
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {simulatedPredictions.projectedMood}
                  </span>
                  <span className="text-sm font-semibold text-slate-300">/ 10 Mood Energy</span>
                </div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15">
                  Rating: {simulatedPredictions.valenceRating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Projected Stress:
                  </span>
                  <span
                    className={`text-base font-extrabold ${
                      simulatedPredictions.projectedStress <= 40
                        ? 'text-emerald-400'
                        : simulatedPredictions.projectedStress <= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {simulatedPredictions.projectedStress}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Projected HRV:
                  </span>
                  <span className="text-base font-extrabold text-indigo-300">
                    {simulatedPredictions.projectedHrv} ms
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Burnout Index:
                  </span>
                  <span className="text-base font-extrabold text-emerald-300">
                    {simulatedPredictions.allostaticLoad}% Load
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Vagal Brake:
                  </span>
                  <span className="text-base font-extrabold text-white">Active (High)</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-indigo-200/90 leading-relaxed font-serif-heading italic">
                  💡 "With {simSleepDuration}h sleep and a {simSomaticMinutes}-minute somatic pause, your nervous system buffers against task density, keeping cortisol low even during crunch tasks."
                </p>
                <button
                  onClick={() =>
                    onSelectPrompt(
                      `Based on your simulated scenario with ${simSleepDuration} hours of sleep and ${simTaskLoad} pending sprint tasks: What proactive commitment will you make to protect your emotional clarity tomorrow?`
                    )
                  }
                  className="w-full py-2 px-3 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Commit to This Target in Journal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 SECTION C: SCATTER PLOT WITH INTERACTIVE CUSTOM TOOLTIP & METADATA      */}
      {/* ========================================================================= */}
      {(activeSubTab === 'scatter' || activeSubTab === 'all') && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <HeartPulse className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                  Biometric Health & Mood Scatter Correlation
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Hover or click any data point to explore comprehensive metadata: full emotion paths, clinical baselines, somatic clues, wearable telemetry, and journal snippets.
              </p>
            </div>

            {/* Timeframe & Emotion filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
                {(['30d', '14d', '7d'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setScatterTimeframe(tf)}
                    className={`px-3 py-1 font-medium rounded-lg transition-all ${
                      scatterTimeframe === tf
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf === '30d' ? 'Last 30 Days' : tf === '14d' ? 'Last 14 Days' : 'Last 7 Days'}
                  </button>
                ))}
              </div>

              <select
                value={selectedEmotionFilter}
                onChange={(e) => setSelectedEmotionFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Emotion Categories</option>
                <option value="Joyful">Joyful</option>
                <option value="Sad">Sad</option>
                <option value="Angry">Angry</option>
                <option value="Fearful">Fearful</option>
                <option value="Surprised">Surprised</option>
                <option value="Disgusted">Disgusted</option>
              </select>
            </div>
          </div>

          {/* Biometric Metric Selector Bar */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Biometric Overlay Metric (Physical & Mental Health)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {METRIC_OPTIONS.map((m) => {
                const isActive = activeMetricKey === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setActiveMetricKey(m.key)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/10'
                        : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`p-1 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 shadow-2xs'
                        }`}
                      >
                        {m.icon}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isActive ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {m.unit}
                      </span>
                    </div>
                    <span className="text-xs font-bold leading-tight line-clamp-1">{m.shortLabel}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {m.category.includes('Samsung') ? 'Samsung Health' : 'Welltory'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Statistical Correlation & Clinical Insights Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Correlation Index (r):
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    Math.abs(correlationStats.r) >= 0.5
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : Math.abs(correlationStats.r) >= 0.25
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  r = {correlationStats.r > 0 ? `+${correlationStats.r}` : correlationStats.r} ({correlationStats.strength})
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {correlationStats.takeaway}
              </p>
            </div>

            <div className="shrink-0 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-1">
              <div className="flex items-center justify-between gap-4 text-slate-500">
                <span>Points Plotted:</span>
                <span className="font-bold text-slate-800">{scatterData.length} entries</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-500">
                <span>Clinical Baseline:</span>
                <span className="font-bold text-indigo-700">{activeMetric.optimalLabel}</span>
              </div>
            </div>
          </div>

          {/* Recharts Scatter Plot with Custom Interactive Tooltip */}
          <div className="w-full h-80 sm:h-96 pt-2 relative">
            {scatterData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <HeartPulse className="w-8 h-8 text-slate-300 mb-2" />
                <span>No journal records match the selected {scatterTimeframe} timeframe.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="moodScore"
                    name="Mood Score"
                    domain={[1, 10]}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    unit="/10"
                    stroke="#94a3b8"
                    fontSize={11}
                    label={{
                      value: 'Mood Intensity / Emotional State (1 = Acute Distress / Low → 10 = Joyful / Flourishing)',
                      position: 'bottom',
                      offset: 12,
                      fontSize: 11,
                      fill: '#64748b',
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="biometricValue"
                    name={activeMetric.label}
                    domain={[activeMetric.minDomain, activeMetric.maxDomain]}
                    stroke="#94a3b8"
                    fontSize={11}
                    label={{
                      value: `${activeMetric.label} (${activeMetric.unit})`,
                      angle: -90,
                      position: 'left',
                      offset: 0,
                      fontSize: 11,
                      fill: '#64748b',
                    }}
                  />
                  <ZAxis range={[90, 90]} />
                  <ReferenceLine
                    y={activeMetric.optimalThreshold}
                    stroke={activeMetric.color}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Target: ${activeMetric.optimalThreshold} ${activeMetric.unit}`,
                      position: 'right',
                      fill: activeMetric.color,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />

                  {/* CUSTOM INTERACTIVE STYLED TOOLTIP WITH POINTER EVENTS */}
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                    wrapperStyle={{ pointerEvents: 'auto', zIndex: 100 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      const isPinned = pinnedPointId === data.id;

                      return (
                        <div
                          className="bg-slate-950/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 text-xs space-y-3 min-w-[320px] max-w-[360px] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                          style={{
                            boxShadow: `0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px ${data.color}30`,
                          }}
                        >
                          {/* Header: Date, Emotion Triad & Pin Button */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div>
                              <span className="font-bold text-slate-200 block text-xs">
                                {data.date} • {data.time}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {data.emotionPath}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px]"
                                style={{
                                  backgroundColor: `${data.color}30`,
                                  color: data.color,
                                  border: `1px solid ${data.color}50`,
                                }}
                              >
                                {data.primaryEmotion} ({data.moodScore}/10)
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPinnedPointId(isPinned ? null : data.id);
                                }}
                                title={isPinned ? 'Unpin inspection' : 'Pin inspection card'}
                                className={`p-1 rounded-md transition-colors ${
                                  isPinned
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-slate-800 text-slate-300 hover:text-white'
                                }`}
                              >
                                {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Hero Active Metric Highlight */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-medium flex items-center gap-1 text-[11px]">
                                {activeMetric.icon}
                                {activeMetric.label}:
                              </span>
                              <span className="font-extrabold text-sm" style={{ color: activeMetric.color }}>
                                {data.biometricValue} {activeMetric.unit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Target: {activeMetric.optimalThreshold} {activeMetric.unit}</span>
                              <span
                                className={`font-semibold ${
                                  data.isOptimal ? 'text-emerald-400' : 'text-amber-400'
                                }`}
                              >
                                {data.isOptimal ? '✓ Optimal Range' : '⚠ Elevated'} (
                                {data.deltaToOptimal > 0 ? `+${data.deltaToOptimal}` : data.deltaToOptimal}{' '}
                                {activeMetric.unit})
                              </span>
                            </div>
                          </div>

                          {/* 4-Cell Telemetry Snapshot Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Resting HR:</span>
                              <span className="font-bold text-white">{data.restingHeartRate} bpm</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Sleep Score:</span>
                              <span className="font-bold text-white">{data.sleepQuality}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Autonomic HRV:</span>
                              <span className="font-bold text-emerald-400">{data.hrvScore} ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Stress Tension:</span>
                              <span className="font-bold text-amber-400">{data.stressScore}%</span>
                            </div>
                          </div>

                          {/* Sprint Context (if available) */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-indigo-400" />
                              Sprint Pressure:
                            </span>
                            <span className="font-semibold text-slate-200">
                              {data.sprintPressure} ({data.pendingTasks} tasks)
                            </span>
                          </div>

                          {/* Somatic Clues Chips */}
                          {data.somaticSensations?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                                Somatic Clues:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {data.somaticSensations.map((som: string, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                                  >
                                    {som}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Journal Snippet Quote */}
                          <div className="pt-2 border-t border-slate-800">
                            <p className="text-[11px] text-slate-300 italic font-serif-heading line-clamp-2">
                              "{data.journalSnippet}..."
                            </p>
                          </div>

                          {/* Tooltip Interactive Quick Actions */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectPrompt(
                                  `Reflecting on your state of ${data.primaryEmotion} (${data.moodScore}/10) when your ${activeMetric.label} was ${data.biometricValue} ${activeMetric.unit}: What underlying need or boundary was asking for attention?`
                                );
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Reflect on This</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopySnapshot(data);
                              }}
                              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors flex items-center gap-1"
                            >
                              {copiedPointId === data.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }}
                  />

                  <Scatter
                    name="Mood vs Biometric Entry"
                    data={scatterData}
                    onMouseEnter={(node: any) => setHoveredPointId(node?.payload?.id || node?.id || null)}
                    onMouseLeave={() => setHoveredPointId(null)}
                    onClick={(node: any) => {
                      const pointId = node?.payload?.id || node?.id;
                      if (pointId) {
                        setPinnedPointId((prev) => (prev === pointId ? null : pointId));
                      }
                    }}
                  >
                    {scatterData.map((pt) => {
                      const isPinned = pinnedPointId === pt.id;
                      const isHovered = hoveredPointId === pt.id;
                      return (
                        <Cell
                          key={pt.id}
                          fill={pt.color}
                          stroke={isPinned ? '#ffffff' : isHovered ? '#38bdf8' : '#ffffff'}
                          strokeWidth={isPinned ? 3 : isHovered ? 2.5 : 1.5}
                          className="transition-all cursor-pointer"
                          onClick={() => setPinnedPointId((prev) => (prev === pt.id ? null : pt.id))}
                          onMouseEnter={() => setHoveredPointId(pt.id)}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Scatter Color Legend & Explainer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700">Point Colors (Emotion):</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Joyful
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Sad
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Angry
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> Fearful
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Surprised
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Disgusted
              </span>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Tip: Click any scatter node to pin its full metadata card for deep reading.
            </p>
          </div>

          {/* PERSISTENT / PINNED DATA POINT DEEP INSPECTOR CARD */}
          {activeInspectedPoint && (
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeInspectedPoint.color }}
                  />
                  <h4 className="font-bold text-white text-sm">
                    {activeInspectedPoint.emotionPath} ({activeInspectedPoint.moodScore}/10)
                  </h4>
                  <span className="text-xs text-slate-400">
                    • {activeInspectedPoint.date} at {activeInspectedPoint.time}
                  </span>
                  {pinnedPointId === activeInspectedPoint.id && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPinnedPointId(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => handleCopySnapshot(activeInspectedPoint)}
                    className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                  >
                    {copiedPointId === activeInspectedPoint.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Snapshot</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Comprehensive Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {activeMetric.shortLabel}
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: activeMetric.color }}>
                    {activeInspectedPoint.biometricValue} {activeMetric.unit}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Resting HR</span>
                  <span className="text-sm font-extrabold text-rose-300">
                    {activeInspectedPoint.restingHeartRate} bpm
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sleep Quality</span>
                  <span className="text-sm font-extrabold text-blue-300">
                    {activeInspectedPoint.sleepQuality}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Autonomic HRV</span>
                  <span className="text-sm font-extrabold text-emerald-300">
                    {activeInspectedPoint.hrvScore} ms
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Stress Score</span>
                  <span className="text-sm font-extrabold text-amber-300">
                    {activeInspectedPoint.stressScore}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Daily Steps</span>
                  <span className="text-sm font-extrabold text-teal-300">
                    {activeInspectedPoint.dailySteps.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Energy Battery</span>
                  <span className="text-sm font-extrabold text-indigo-300">
                    {activeInspectedPoint.energyScore}%
                  </span>
                </div>
              </div>

              {/* Full Journal Reflection Excerpt */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Journal Entry Reflection:
                </span>
                <p className="text-xs text-indigo-100 font-serif-heading leading-relaxed italic">
                  "{activeInspectedPoint.fullJournalText}"
                </p>
                {activeInspectedPoint.promptUsed && (
                  <p className="text-[10px] text-indigo-300 pt-1 border-t border-white/10">
                    Prompt Used: "{activeInspectedPoint.promptUsed}"
                  </p>
                )}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-400">
                  Sprint Context: <strong className="text-white">{activeInspectedPoint.sprintPressure}</strong> ({activeInspectedPoint.pendingTasks} tasks pending)
                </span>
                <button
                  onClick={() =>
                    onSelectPrompt(
                      `Reflecting on your entry logged on ${activeInspectedPoint.date} where you felt ${activeInspectedPoint.primaryEmotion} with ${activeMetric.label} at ${activeInspectedPoint.biometricValue} ${activeMetric.unit}: What did this experience teach you about your emotional rhythms?`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Journal with This Historical State</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛡️ SECTION D: BURNOUT & FATIGUE PREDICTIVE RISK RADAR                     */}
      {/* ========================================================================= */}
      {(activeSubTab === 'radar' || activeSubTab === 'predictive' || activeSubTab === 'all') && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                  Predictive Burnout & Fatigue Risk Radar
                </h3>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Early-warning risk radar identifying cumulative allostatic strain before emotional fatigue becomes clinical burnout.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
              <span className="text-slate-500">Projected Peak Strain Window:</span>
              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Thursday 2:00 PM – 5:30 PM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Risk Vector 1: Sleep Debt */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  Sleep Architecture
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Low Risk (18%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }} />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                7.4h 3-day average sleep provides adequate slow-wave memory consolidation.
              </p>
            </div>

            {/* Risk Vector 2: Sprint Deadline Density */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Task Density
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Elevated (64%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '64%' }} />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {tasks?.pendingHighPriorityTasks || 4} high-priority tasks in TickTick approach the threshold for cognitive fragmentation.
              </p>
            </div>

            {/* Risk Vector 3: Autonomic HRV Recovery */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Autonomic HRV
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Stable (22%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '22%' }} />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Morning Welltory reading ({welltory?.hrvScore || 64} ms) indicates high parasympathetic adaptability.
              </p>
            </div>

            {/* Risk Vector 4: Somatic Tension Frequency */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  Somatic Tension
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Mild (38%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '38%' }} />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Occasional chest tightness logged during multi-meeting afternoons.
              </p>
            </div>

            {/* Risk Vector 5: Relapse & Alcohol Craving Vulnerability */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Sobriety Resilience
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Day {sobriety?.currentStreakDays || 43} Sober
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-[11px] text-emerald-900 leading-snug">
                Low craving baseline ({sobriety?.currentCravingLevel || 2}/10). Pre-emptive urge surfing ready for Friday 5 PM witching hour.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚡ SECTION E: PATTERN-BASED PROACTIVE PROMPTS                             */}
      {/* ========================================================================= */}
      {(activeSubTab === 'prompts' || activeSubTab === 'all') && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                Pattern-Based Proactive Inquiries
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Grounded prompts synthesized from your multi-week biometric history and project stress cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {patternPrompts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 group"
              >
                <div className="space-y-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100/70 text-indigo-800 border border-indigo-200/60">
                    {p.category}
                  </span>
                  <p className="text-sm font-medium text-slate-900 font-serif-heading leading-snug">
                    "{p.prompt}"
                  </p>
                  {p.rationale && (
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                      💡 {p.rationale}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onSelectPrompt(p.prompt)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 hover:text-white bg-white hover:bg-slate-900 border border-slate-200 rounded-xl transition-all shadow-2xs active:scale-95"
                >
                  <span>Journal with this Pattern</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧠 SECTION F: DETECTED BEHAVIORAL & SOMATIC TRENDS                       */}
      {/* ========================================================================= */}
      {(activeSubTab === 'all' || activeSubTab === 'scatter') && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
              Observed Behavioral & Somatic Trends
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Recurring loops extracted from your multi-week timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    {getPatternIcon(insight.patternType)}
                    {insight.title}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {insight.timeframe}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{insight.observation}</p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Associated Feelings
                  </span>
                  <div className="flex items-center gap-1.5">
                    {insight.dominantEmotions.map((emo, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${emo.color}20`,
                          color: emo.color,
                        }}
                      >
                        {emo.name} ({emo.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>

                {insight.suggestedPrompts?.[0] && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block mb-1">
                      Proactive Inquiry
                    </span>
                    <p className="text-xs text-slate-800 italic font-serif-heading">
                      "{insight.suggestedPrompts[0]}"
                    </p>
                    <button
                      onClick={() => onSelectPrompt(insight.suggestedPrompts[0])}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Use this prompt</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
