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
} from '../types/journal';
import {
  Sparkles,
  RefreshCw,
  Brain,
  TrendingUp,
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
  Sparkle,
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

interface PatternInsightsViewProps {
  entries: MoodEntry[];
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth?: SamsungHealthData;
  tasks?: TaskProjectData;
  aiCoWork?: AiCoWorkData;
  geminiSpark?: GeminiSparkData;
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
  | 'energyScore';

interface MetricOption {
  key: BiometricMetricKey;
  label: string;
  shortLabel: string;
  category: 'Physical (Samsung Health)' | 'Mental & Autonomic (Welltory)';
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
  onSelectPrompt,
  onOpenIntegrations,
}) => {
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

  // Mood forecast state
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecast, setForecast] = useState<MoodForecast>({
    projectedHorizon: 'Midweek Sprint Peak with Weekend Decompression Window',
    forecastSummary:
      'Given recent emotional stability paired with ongoing sprint demands on Product Launch v2.0, watch for slight afternoon cognitive fatigue on Thursday before restorative momentum rebuilds heading into the weekend.',
    resilienceBufferScore: 78,
    days: [
      {
        dayLabel: 'Tomorrow (Day 1)',
        dateStr: 'Day 1',
        predictedValence: 'Focused',
        predictedIntensity: 7,
        riskFactors: ['High sprint deliverable workload', 'Back-to-back calendar calls'],
        protectiveFactors: ['Adequate baseline sleep (82% quality)', 'Clear morning priorities'],
        somaticRecommendation: 'Practice 2-minute physiological sighing between meetings to prevent adrenaline spikes.',
      },
      {
        dayLabel: 'Day 2',
        dateStr: 'Day 2',
        predictedValence: 'Strained',
        predictedIntensity: 8,
        riskFactors: ['Frontend release candidate deadline', 'Cognitive context switching'],
        protectiveFactors: ['Structured boundary setting', 'Scheduled Claude Co-Work session'],
        somaticRecommendation: 'Unclench jaw and do 5 shoulder rolls every 2 hours to release trapezius tension.',
      },
      {
        dayLabel: 'Day 3',
        dateStr: 'Day 3',
        predictedValence: 'Peaceful',
        predictedIntensity: 6,
        riskFactors: ['Residual nervous fatigue from project sprint'],
        protectiveFactors: ['Post-milestone relief', 'Planned evening outdoor nature walk'],
        somaticRecommendation: 'Take a 45-minute tech-free sensory immersion walk during golden hour.',
      },
    ],
    preemptiveJournalPrompt:
      'Before tomorrow’s project sprint picks up speed, what is the single non-negotiable boundary that will protect your peace of mind?',
    preemptivePromptRationale:
      'Preemptively anchors self-regulation before task pressure triggers reactive anxiety.',
  });

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

  // Construct scatter data points
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
          val = snap?.sleepHours ? Math.round((snap.sleepHours / 8) * 20) : (samsungHealth?.deepSleepPercentage || 18);
          break;
        case 'dailySteps':
          val = snap?.dailySteps ?? (samsungHealth?.dailySteps || 7500);
          break;
        case 'energyScore':
          val = snap?.energyScore ?? (welltory?.energyScore || 65);
          break;
        default:
          val = snap?.restingHeartRate || 64;
      }

      return {
        id: entry.id,
        date: entry.date,
        time: entry.time,
        primaryEmotion: entry.primaryEmotion,
        secondaryEmotion: entry.secondaryEmotion,
        tertiaryEmotion: entry.tertiaryEmotion,
        emotionPath: [entry.primaryEmotion, entry.secondaryEmotion, entry.tertiaryEmotion]
          .filter(Boolean)
          .join(' > '),
        color: entry.emotionColor || '#F59E0B',
        moodScore: entry.intensity, // X-axis (1 - 10)
        biometricValue: val, // Y-axis
        restingHeartRate: snap?.restingHeartRate || 62,
        sleepQuality: snap?.sleepQuality || 78,
        hrvScore: snap?.hrvScore || 64,
        stressScore: snap?.stressScore || 45,
        somaticSensations: entry.somaticSensations || [],
        journalSnippet: entry.journalText.slice(0, 120),
        promptUsed: entry.promptUsed,
        tags: entry.tags || [],
      };
    });
  }, [filteredScatterEntries, activeMetricKey, samsungHealth, welltory]);

  // Compute correlation statistics
  const correlationStats = useMemo(() => {
    if (scatterData.length < 3) {
      return { r: 0, strength: 'Insufficient Data', takeaway: 'Log more check-ins to reveal statistically sound biometric trends.' };
    }

    const xVals = scatterData.map((d) => d.moodScore);
    const yVals = scatterData.map((d) => d.biometricValue);
    const r = computePearsonCorrelation(xVals, yVals);

    let strength = 'Neutral / Weak';
    let takeaway = '';

    if (activeMetric.inverse) {
      // For metrics like Resting Heart Rate or Stress, negative r is optimal (higher mood = lower HR/stress)
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
      // For metrics like Sleep Quality, HRV, Deep Sleep, positive r is optimal
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

  return (
    <div className="space-y-8">
      {/* Overview & Integrations Telemetry Bar */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Brain className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                AI Pattern Insights & Biometric Dynamics
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Gemini analyzes recurring trajectories across your journal history, Samsung Health physical vitals, TickTick sprint pressure, and Welltory autonomic states.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-xs self-start"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Patterns...' : 'Refresh Pattern Analysis'}</span>
          </button>
        </div>

        {/* Overarching Summary Box */}
        <div className="mt-6 p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
              Holistic Trajectory Summary
            </span>
            <p className="text-sm text-indigo-950 font-serif-heading leading-relaxed">
              "{summary}"
            </p>
          </div>
        </div>

        {/* Integration Context Pill Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Active context engines:</span>
          {samsungHealth?.enabled && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
              <Watch className="w-3 h-3 text-blue-600" />
              Samsung Health (Sleep {samsungHealth.sleepHours}h • HR {samsungHealth.restingHeartRate} bpm)
            </span>
          )}
          {tasks?.enabled && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
              <CheckSquare className="w-3 h-3 text-indigo-600" />
              TickTick (Sprint {tasks.currentSprintPressure} • {tasks.pendingHighPriorityTasks} high-priority)
            </span>
          )}
          {welltory?.enabled && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200">
              <Activity className="w-3 h-3 text-rose-600" />
              Welltory (HRV {welltory.hrvScore}ms • Stress {welltory.stressScore}%)
            </span>
          )}
          {mindsara?.enabled && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200">
              <BookOpen className="w-3 h-3 text-purple-600" />
              Mindsera ({mindsara.recurringThemes.length} Themes)
            </span>
          )}
          <button
            onClick={onOpenIntegrations}
            className="text-xs text-slate-400 hover:text-slate-700 underline ml-1 font-medium"
          >
            Adjust integrations
          </button>
        </div>
      </div>

      {/* SECTION 1: SCATTER PLOT VISUALIZATION WITH BIOMETRIC OVERLAYS */}
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
              Toggle clinical physiological overlays (Resting Heart Rate, Sleep Quality, HRV, Stress) against your logged journal mood scores over the past 30 days.
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
                      ? 'bg-white text-slate-900 shadow-xs'
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

        {/* Recharts Scatter Plot */}
        <div className="w-full h-80 sm:h-96 pt-2">
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
                <ZAxis range={[70, 70]} />
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
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-2 max-w-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <span className="font-bold text-slate-200">
                            {data.date} • {data.time}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-md font-bold text-[10px]"
                            style={{ backgroundColor: `${data.color}30`, color: data.color }}
                          >
                            {data.primaryEmotion}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Mood Score:</span>
                            <span className="font-bold text-white">{data.moodScore} / 10</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>{activeMetric.label}:</span>
                            <span className="font-bold" style={{ color: activeMetric.color }}>
                              {data.biometricValue} {activeMetric.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span>Resting HR: {data.restingHeartRate} bpm</span>
                            <span>Sleep: {data.sleepQuality}%</span>
                            <span>HRV: {data.hrvScore}ms</span>
                          </div>
                        </div>

                        {data.somaticSensations?.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                              Somatic Sensations:
                            </span>
                            <span className="text-slate-300 text-[11px] italic">
                              {data.somaticSensations.join(', ')}
                            </span>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-slate-800/80">
                          <p className="text-[11px] text-slate-300 line-clamp-2 italic font-serif-heading">
                            "{data.journalSnippet}..."
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Mood vs Biometric Entry" data={scatterData}>
                  {scatterData.map((pt, idx) => (
                    <Cell
                      key={`scatter-pt-${idx}`}
                      fill={pt.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-transform hover:scale-125 cursor-pointer"
                    />
                  ))}
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
            Tip: Hover over any node to inspect the journal snippet, exact timestamp, and connected somatic clues.
          </p>
        </div>
      </div>

      {/* SECTION 2: AI MOOD FORECAST (7-DAY TREND + PROJECT PRESSURE TELEMETRY) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Compass className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                AI Mood Forecast (Upcoming 3–5 Days)
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Gemini synthesizes your 7-day emotional velocity, TickTick sprint deadlines ({tasks?.currentSprintPressure || 'High'} Pressure), and Samsung Health sleep recovery to project upcoming emotional weather.
            </p>
          </div>

          <button
            onClick={handleGenerateForecast}
            disabled={isForecasting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs self-start"
          >
            <RefreshCw className={`w-4 h-4 ${isForecasting ? 'animate-spin' : ''}`} />
            <span>{isForecasting ? 'Forecasting Trajectory...' : 'Generate AI Mood Forecast'}</span>
          </button>
        </div>

        {/* Projected Horizon Card with Resilience Buffer */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden space-y-4">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
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
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0 min-w-48 text-right">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-300">Resilience Buffer:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {forecast.resilienceBufferScore}%
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${forecast.resilienceBufferScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {forecast.resilienceBufferScore >= 75
                  ? 'Optimal Capacity'
                  : forecast.resilienceBufferScore >= 50
                  ? 'Moderate Reserve'
                  : 'Nearing Allostatic Depletion'}
              </span>
            </div>
          </div>

          <p className="text-sm text-indigo-100/90 font-serif-heading leading-relaxed relative z-10 border-t border-white/10 pt-3">
            "{forecast.forecastSummary}"
          </p>
        </div>

        {/* 3-Day Forecast Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {forecast.days.map((day, idx) => {
            const isHighStrain = day.predictedIntensity >= 8 || day.predictedValence.toLowerCase().includes('strain');
            const isPeaceful = day.predictedValence.toLowerCase().includes('peace') || day.predictedValence.toLowerCase().includes('rebound');

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{day.dayLabel}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isHighStrain
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isPeaceful
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {day.predictedValence} ({day.predictedIntensity}/10)
                    </span>
                  </div>

                  {/* Intensity Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Predicted Emotional Energy</span>
                      <span>{day.predictedIntensity} / 10</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isHighStrain ? 'bg-rose-500' : isPeaceful ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${day.predictedIntensity * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {day.riskFactors?.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Risk Factors
                      </span>
                      <ul className="text-slate-600 space-y-0.5 pl-3 list-disc text-[11px]">
                        {day.riskFactors.map((rf, rIdx) => (
                          <li key={rIdx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Protective Factors */}
                  {day.protectiveFactors?.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Protective Factors
                      </span>
                      <ul className="text-slate-600 space-y-0.5 pl-3 list-disc text-[11px]">
                        {day.protectiveFactors.map((pf, pIdx) => (
                          <li key={pIdx}>{pf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Somatic Recommendation */}
                {day.somaticRecommendation && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Somatic Regulation Prescription
                    </span>
                    <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200/60 leading-snug">
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
                Preemptive Stress Inoculation Prompt
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-xl transition-all shadow-xs shrink-0 self-start md:self-auto"
            >
              <span>Journal with this Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: PATTERN-BASED PROMPTS */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
              Pattern-Based Journal Prompts
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Proactive inquiries targeting long-term project cycles, sleep recovery, and recurring emotional loops.
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
                className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 hover:text-white bg-white hover:bg-slate-900 border border-slate-200 rounded-xl transition-all shadow-2xs"
              >
                <span>Journal with this Pattern</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: DETECTED BEHAVIORAL & SOMATIC TRENDS */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
            Observed Behavioral & Somatic Trends
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Recurring patterns extracted from your multi-week timeline.
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

              <p className="text-xs text-slate-700 leading-relaxed">
                {insight.observation}
              </p>

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
    </div>
  );
};
