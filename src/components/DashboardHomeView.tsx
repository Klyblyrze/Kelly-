import React, { useState, useMemo } from 'react';
import {
  MoodEntry,
  SobrietyRecoveryContext,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
  MindsaraContext,
  DailyIntention,
  IntentionCategory,
} from '../types/journal';
import {
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  Heart,
  Activity,
  Flame,
  Sparkles,
  TrendingUp,
  Brain,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Compass,
  RefreshCw,
  Plus,
  Wind,
  CheckSquare,
  Award,
  Zap,
  Target,
  Check,
  Edit3,
} from 'lucide-react';

interface DashboardHomeViewProps {
  entries: MoodEntry[];
  sobriety: SobrietyRecoveryContext;
  onUpdateSobriety: (updated: SobrietyRecoveryContext) => void;
  welltory: WelltoryBiometrics;
  samsungHealth: SamsungHealthData;
  tasks: TaskProjectData;
  mindsara: MindsaraContext;
  onNavigateToView: (
    view: 'dashboard' | 'journal' | 'sobriety' | 'analysis' | 'personal' | 'forecast' | 'integrations'
  ) => void;
  onOpenCheckIn: (prompt?: string) => void;
  onOpenUrgeSurfing: () => void;
  onOpenClinicalReport: () => void;
  onOpenIntegrations: () => void;
  dailyIntention?: DailyIntention;
  onSetDailyIntention?: (intention: DailyIntention) => void;
  onToggleDailyIntentionComplete?: () => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  entries,
  sobriety,
  onUpdateSobriety,
  welltory,
  samsungHealth,
  tasks,
  mindsara,
  onNavigateToView,
  onOpenCheckIn,
  onOpenUrgeSurfing,
  onOpenClinicalReport,
  onOpenIntegrations,
  dailyIntention,
  onSetDailyIntention,
  onToggleDailyIntentionComplete,
}) => {
  // Calendar month state (defaults to September 2026 based on mock timeline)
  const [currentDate, setCurrentDate] = useState(() => new Date('2026-09-28T12:00:00'));
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-28');
  const [isQuickSyncing, setIsQuickSyncing] = useState(false);
  const [syncBanner, setSyncBanner] = useState<string | null>(null);

  // Daily Intention local edit state
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [customIntentionText, setCustomIntentionText] = useState(
    dailyIntention?.text || 'Pause for 3 physiological breaths before answering high-pressure messages'
  );
  const [customIntentionCategory, setCustomIntentionCategory] = useState<IntentionCategory>(
    dailyIntention?.category || 'Somatic'
  );
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);

  const INTENTION_PRESETS: Array<{ text: string; category: IntentionCategory }> = [
    { text: 'Pause for 3 physiological breaths before replying to urgent requests', category: 'Somatic' },
    { text: 'State one clear boundary around my evening wind-down time', category: 'Boundary' },
    { text: 'Drink ice-cold sparkling water with citrus during 5 PM transition', category: 'Sobriety' },
    { text: 'Execute single highest-leverage deep work sprint before opening email', category: 'Productivity' },
    { text: 'Send one genuine message of appreciation to a friend or ally', category: 'Connection' },
    { text: '10-minute quiet walk without devices in natural light', category: 'Mindfulness' },
  ];

  const handleSaveIntention = () => {
    if (!customIntentionText.trim() || !onSetDailyIntention) return;
    onSetDailyIntention({
      id: `intention-${Date.now()}`,
      date: '2026-09-28',
      text: customIntentionText.trim(),
      category: customIntentionCategory,
      completed: false,
    });
    setIsEditingIntention(false);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const today = new Date('2026-09-28T12:00:00');
    setCurrentDate(today);
    setSelectedDateStr('2026-09-28');
  };

  // Month metadata
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map entries by date for fast O(1) lookup
  const entriesByDate = useMemo(() => {
    const map = new Map<string, MoodEntry[]>();
    entries.forEach((e) => {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    });
    return map;
  }, [entries]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateNumber: d,
        dateStr,
        isCurrentMonth: false,
        entries: entriesByDate.get(dateStr) || [],
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateNumber: d,
        dateStr,
        isCurrentMonth: true,
        entries: entriesByDate.get(dateStr) || [],
      });
    }

    // Next month filler days (fill up grid to multiples of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextDay = 1;
    while (days.length < totalCells) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      days.push({
        dateNumber: nextDay++,
        dateStr,
        isCurrentMonth: false,
        entries: entriesByDate.get(dateStr) || [],
      });
    }

    return days;
  }, [year, month, entriesByDate]);

  // Selected date details
  const selectedEntries = useMemo(() => {
    return entriesByDate.get(selectedDateStr) || [];
  }, [entriesByDate, selectedDateStr]);

  // Calculate high-level executive metrics
  const executiveMetrics = useMemo(() => {
    const totalEntries = entries.length;
    const avgIntensity = entries.length
      ? (entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length).toFixed(1)
      : '0';

    // Emotional valence balance
    const positiveCount = entries.filter((e) =>
      ['Joyful', 'Peaceful', 'Powerful'].includes(e.primaryEmotion)
    ).length;
    const emotionalStabilityScore = totalEntries > 0
      ? Math.round((positiveCount / totalEntries) * 100)
      : 80;

    // Days sober calculation
    const daysSober = sobriety.enabled ? sobriety.currentStreakDays : 0;
    const alcoholUnitsSaved = sobriety.enabled ? sobriety.alcoholAvoidedUnits : 0;
    const moneySaved = sobriety.enabled ? sobriety.moneySavedEstimated : 0;

    // Upcoming health milestone
    const nextMilestone = sobriety.healthMilestones.find((m) => !m.achieved) || {
      days: 60,
      title: 'Neurochemical Baseline Restoration',
      scientificImpact: 'Dopamine D2 receptor density returns to neurotypical balance.',
      achieved: false,
    };
    const daysUntilNext = Math.max(0, nextMilestone.days - daysSober);

    return {
      totalEntries,
      avgIntensity,
      emotionalStabilityScore,
      daysSober,
      alcoholUnitsSaved,
      moneySaved,
      nextMilestone,
      daysUntilNext,
      hrv: welltory.hrvScore,
      stressScore: welltory.stressScore,
      sleepHours: samsungHealth.sleepHours,
      sleepQuality: samsungHealth.sleepQuality,
      sprintPressure: tasks.currentSprintPressure,
    };
  }, [entries, sobriety, welltory, samsungHealth, tasks]);

  // Quick sync handler
  const handleQuickSync = () => {
    setIsQuickSyncing(true);
    setTimeout(() => {
      setIsQuickSyncing(false);
      setSyncBanner('All 5 connected telemetry services synced successfully.');
      setTimeout(() => setSyncBanner(null), 4000);
    }, 1000);
  };

  // Helper to determine if a date is within sobriety range
  const isSoberDate = (dateStr: string) => {
    if (!sobriety.enabled) return false;
    // Simple check: date is on or after sobriety start date and up to current
    return dateStr >= sobriety.sobrietyStartDate && dateStr <= '2026-09-28';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {syncBanner && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncBanner}</span>
        </div>
      )}

      {/* TOP EXECUTIVE COMMAND HEADER */}
      <section className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-semibold">
                Executive Health Console
              </span>
              <span>·</span>
              <span>Monday, September 28, 2026</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">
              Biometric & Recovery Dual Dashboard
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Consolidated longitudinal tracking of autonomic nervous system states, emotional wheel vectors, and SMART recovery milestones.
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenCheckIn()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Mood Entry</span>
            </button>

            <button
              onClick={onOpenUrgeSurfing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              title="Launch 3-minute somatic urge surfing reset"
            >
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Urge Surfing</span>
            </button>

            <button
              onClick={onOpenClinicalReport}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              title="Export formatted clinical PDF summary"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleQuickSync}
              disabled={isQuickSyncing}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-all cursor-pointer"
              title="Synchronize all telemetry streams"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isQuickSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync All</span>
            </button>
          </div>
        </div>

        {/* HIGH LEVEL KPI RIBBON */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          {/* KPI 1: Sobriety Streak */}
          <div
            onClick={() => onNavigateToView('sobriety')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sobriety Track
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Day {executiveMetrics.daysSober}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-100">
                {executiveMetrics.daysSober}
              </span>
              <span className="text-xs text-slate-400">days sober</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {executiveMetrics.daysUntilNext}d to {executiveMetrics.nextMilestone.title}
            </div>
          </div>

          {/* KPI 2: Emotional Stability */}
          <div
            onClick={() => onNavigateToView('analysis')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-amber-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Mood Balance
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{executiveMetrics.emotionalStabilityScore}%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-100">
                {executiveMetrics.avgIntensity}
              </span>
              <span className="text-xs text-slate-400">/10 intensity</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {executiveMetrics.totalEntries} logged reflections
            </div>
          </div>

          {/* KPI 3: Autonomic Nervous System (HRV) */}
          <div
            onClick={() => onNavigateToView('integrations')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-indigo-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Welltory HRV
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{executiveMetrics.stressScore}% stress</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-100">
                {executiveMetrics.hrv}
              </span>
              <span className="text-xs text-slate-400">ms RMSSD</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {welltory.autonomicBalance.split('(')[0]}
            </div>
          </div>

          {/* KPI 4: Circadian Sleep Architecture */}
          <div
            onClick={() => onNavigateToView('integrations')}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-teal-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Samsung Sleep
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{executiveMetrics.sleepQuality}% score</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-100">
                {executiveMetrics.sleepHours}
              </span>
              <span className="text-xs text-slate-400">hours rest</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {samsungHealth.deepSleepPercentage}% Deep restorative phase
            </div>
          </div>

          {/* KPI 5: Workload Pressure & MCP */}
          <div
            onClick={() => onNavigateToView('forecast')}
            className="col-span-2 md:col-span-4 lg:col-span-1 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-purple-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                TickTick Sprint
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{executiveMetrics.sprintPressure}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-slate-100">
                {tasks.pendingHighPriorityTasks}
              </span>
              <span className="text-xs text-slate-400">P1 tasks pending</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {tasks.completedTasksToday} completed today
            </div>
          </div>
        </div>
      </section>

      {/* DAILY INTENTION SECTION */}
      <section className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/50 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-lg relative overflow-hidden transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={onToggleDailyIntentionComplete}
              title={dailyIntention?.completed ? 'Mark intention pending' : 'Complete today\'s intention'}
              className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                dailyIntention?.completed
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                  : 'border-indigo-400/50 hover:border-indigo-300 bg-slate-950 text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  Today's Daily Intention
                </span>
                <span>·</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-indigo-500/30 text-indigo-200">
                  {dailyIntention?.category || 'Somatic Focus'}
                </span>
                {dailyIntention?.completed && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Achieved Today
                  </span>
                )}
              </div>

              {!isEditingIntention ? (
                <div className="flex items-baseline gap-2">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 leading-snug">
                    "{dailyIntention?.text || 'Pause for 3 physiological breaths before replying to urgent requests'}"
                  </h3>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={customIntentionText}
                    onChange={(e) => setCustomIntentionText(e.target.value)}
                    placeholder="Enter your small, actionable focus for today..."
                    className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />

                  {/* Category options & presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Domain:</span>
                    {(['Somatic', 'Boundary', 'Sobriety', 'Productivity', 'Connection', 'Mindfulness'] as IntentionCategory[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCustomIntentionCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                            customIntentionCategory === cat
                              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block">Quick Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {INTENTION_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomIntentionText(preset.text);
                            setCustomIntentionCategory(preset.category);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-left transition-colors cursor-pointer"
                        >
                          {preset.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveIntention}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Save Intention
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingIntention(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!isEditingIntention && (
                <p className="text-xs text-slate-400">
                  {dailyIntention?.completed
                    ? 'Solidified in your daily practice. Reinforced across your Context-Aware Action Suggestions engine.'
                    : 'A singular micro-commitment to protect cognitive clarity and emotional stability today.'}
                </p>
              )}
            </div>
          </div>

          {!isEditingIntention && (
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => setIsEditingIntention(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Focus</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DUAL-TRACKER CALENDAR & CHRONOLOGICAL TIMELINE */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Dual-Tracker Longitudinal Matrix
              </h2>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md font-semibold">
                Mood × Sobriety
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Simultaneous daily tracking of emotional states, somatic intensity, and alcohol-free recovery milestones.
            </p>
          </div>

          {/* View Mode & Calendar Controls */}
          <div className="flex items-center gap-3">
            {/* View Switcher: Calendar vs Timeline */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Monthly Calendar</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Linear Timeline</span>
              </button>
            </div>

            {/* Month Nav Buttons (Calendar mode) */}
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CALENDAR VIEW MODE */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-lg text-slate-200">
                {monthName} {year}
              </span>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Sober Day Logged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Mood Entry Logged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Craving / HALT Flag</span>
                </div>
              </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono font-semibold text-slate-500 py-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((day, idx) => {
                const isSelected = day.dateStr === selectedDateStr;
                const isToday = day.dateStr === '2026-09-28';
                const hasEntries = day.entries.length > 0;
                const primaryEmotion = day.entries[0]?.primaryEmotion;
                const emotionColor = day.entries[0]?.emotionColor || '#94a3b8';
                const isSober = isSoberDate(day.dateStr);
                const hasCraving = day.entries.some(
                  (e) => (e.recoverySnapshot?.cravingLevel || 0) >= 4
                );

                return (
                  <div
                    key={`${day.dateStr}-${idx}`}
                    onClick={() => setSelectedDateStr(day.dateStr)}
                    className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      day.isCurrentMonth
                        ? 'bg-slate-950/70'
                        : 'bg-slate-950/20 text-slate-600 border-slate-900/60'
                    } ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-slate-900/90'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold'
                            : day.isCurrentMonth
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {day.dateNumber}
                      </span>

                      {/* Sobriety Checkmark */}
                      {isSober && day.isCurrentMonth && (
                        <span
                          title="Alcohol-free day recorded"
                          className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        </span>
                      )}
                    </div>

                    {/* Middle: Mood Log Summary */}
                    {hasEntries ? (
                      <div className="space-y-1 my-1">
                        <div
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center gap-1"
                          style={{
                            backgroundColor: `${emotionColor}18`,
                            color: emotionColor,
                            border: `1px solid ${emotionColor}35`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: emotionColor }}
                          />
                          <span className="truncate">{primaryEmotion}</span>
                        </div>
                        {day.entries.length > 1 && (
                          <div className="text-[9px] text-slate-500 font-mono px-1">
                            +{day.entries.length - 1} more entry
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="my-auto text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-slate-600">·</span>
                      </div>
                    )}

                    {/* Bottom Row: Craving / Recovery Status */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                      {hasCraving ? (
                        <span className="text-rose-400 flex items-center gap-0.5" title="Elevated craving or trigger logged">
                          <Flame className="w-2.5 h-2.5 text-rose-400" />
                          <span>Craving</span>
                        </span>
                      ) : isSober && day.isCurrentMonth ? (
                        <span className="text-emerald-500/70">Clean</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}

                      {hasEntries && (
                        <span className="text-slate-400">
                          {day.entries[0].intensity}/10
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIMELINE VIEW MODE */}
        {viewMode === 'timeline' && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {entries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedDateStr(entry.date)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  entry.date === selectedDateStr
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Date & Emotion */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${entry.emotionColor}15`,
                      borderColor: `${entry.emotionColor}40`,
                    }}
                  >
                    <Heart
                      className="w-5 h-5"
                      style={{ color: entry.emotionColor }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm">
                        {entry.primaryEmotion}
                      </span>
                      {entry.secondaryEmotion && (
                        <>
                          <span className="text-slate-600">/</span>
                          <span className="text-slate-300 text-xs">
                            {entry.secondaryEmotion}
                          </span>
                        </>
                      )}
                      <span className="text-xs font-mono text-slate-500">
                        ({entry.intensity}/10 intensity)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1 max-w-xl">
                      {entry.journalText}
                    </p>
                  </div>
                </div>

                {/* Right: Recovery & Biometrics Snapshot */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
                  {entry.recoverySnapshot && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Day {entry.recoverySnapshot.daysSober || 43} Sober</span>
                    </div>
                  )}
                  {entry.biometricsSnapshot?.hrvScore && (
                    <div className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{entry.biometricsSnapshot.hrvScore}ms HRV</span>
                    </div>
                  )}
                  <span className="text-slate-500 text-xs">
                    {entry.date} · {entry.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERACTIVE DAY INSPECTOR CARD */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  Day Inspector
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-sm font-semibold text-slate-200">
                  {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedEntries.length} mood entries logged · Sobriety track active
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCheckIn()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Log Check-in for this Date</span>
              </button>
              <button
                onClick={() => onNavigateToView('analysis')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Dual Inspector Details */}
          {selectedEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mood Record */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Emotional State</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Intensity: {selectedEntries[0].intensity}/10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEntries[0].emotionColor }}
                  />
                  <span className="font-serif font-bold text-slate-100 text-base">
                    {selectedEntries[0].primaryEmotion}
                  </span>
                  {selectedEntries[0].secondaryEmotion && (
                    <span className="text-slate-400 text-xs">
                      → {selectedEntries[0].secondaryEmotion}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  "{selectedEntries[0].journalText}"
                </p>
                {selectedEntries[0].sentimentAnalysis && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedEntries[0].sentimentAnalysis.emotionTags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                    {selectedEntries[0].sentimentAnalysis.themeTags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Recovery & Biometrics Record */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Recovery & Biometric Telemetry
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Day {selectedEntries[0].recoverySnapshot?.daysSober || 43} Sober
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-500 block text-[10px]">CRAVING LEVEL</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {selectedEntries[0].recoverySnapshot?.cravingLevel || 2}/10
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-500 block text-[10px]">WELLTORY HRV</span>
                    <span className="text-indigo-300 font-bold text-sm">
                      {selectedEntries[0].biometricsSnapshot?.hrvScore || 62} ms
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-500 block text-[10px]">SLEEP REST</span>
                    <span className="text-teal-300 font-bold text-sm">
                      {selectedEntries[0].biometricsSnapshot?.sleepHours || 7.2} hrs
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="text-slate-500 block text-[10px]">TICKTICK SPRINT</span>
                    <span className="text-purple-300 font-bold text-sm">
                      {selectedEntries[0].projectContextSnapshot?.sprintPressure || 'High'}
                    </span>
                  </div>
                </div>

                {selectedEntries[0].aiReflection && (
                  <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <span className="text-indigo-400 font-semibold">Gemini Reflection: </span>
                    {selectedEntries[0].aiReflection}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <span>No direct journal entry recorded on {selectedDateStr}. Sobriety streak uninterrupted.</span>
              <div className="mt-2">
                <button
                  onClick={() => onOpenCheckIn()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Entry for {selectedDateStr}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPONENT DRILL-DOWN JUMP CARDS (TABULAR ARCHITECTURE) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            App Modules & Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Navigate directly into dedicated tabular workspaces for journaling, recovery protocols, deep pattern analytics, and predictive forecasting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Journaling & Feelings Wheel */}
          <div
            onClick={() => onNavigateToView('journal')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold bg-indigo-950/50 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                  Wheel & Prompts
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
                Feelings Wheel & Guided Journal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                3-tier concentric emotion wheel mapping primary, secondary, and tertiary feelings with AI cognitive reframing prompts.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-slate-500">{entries.length} reflections stored</span>
              <span className="font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Wheel <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Sobriety & Recovery Hub */}
          <div
            onClick={() => onNavigateToView('sobriety')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/50 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  SMART Recovery
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-emerald-300 transition-colors">
                Sobriety & Relapse Prevention Hub
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Milestone progress ring, HALT craving vulnerability tracker, 3-minute somatic urge surfing protocols, and clinical support directory.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-emerald-400">Day {sobriety.currentStreakDays} Alcohol-Free</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Hub <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Data Analysis & Trends */}
          <div
            onClick={() => onNavigateToView('analysis')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-950/50 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  Analytics & Heatmap
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-amber-300 transition-colors">
                Data Trends & Scatter Analytics
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Biometric cross-referencing (HRV vs Valence), Time-of-Day × Emotion trigger heatmap, and PDF clinical export engine.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-slate-500">Scatter + Risk Matrix</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Trends <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 4: Personal Analysis & Personality Traits */}
          <div
            onClick={() => onNavigateToView('personal')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold bg-purple-950/50 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                  Strengths & Blind Spots
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-purple-300 transition-colors">
                Personal Analysis & Archetype
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                7-day, 30-day, and all-time personality portrait: core identified strengths, vulnerability vectors, and emerging somatic coping traits.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-purple-400">Psychological Growth</span>
              <span className="font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Portrait <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 4: Forecast & Forward Looking */}
          <div
            onClick={() => onNavigateToView('forecast')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold bg-purple-950/50 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                  Predictive AI
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-purple-300 transition-colors">
                Forecast & Forward Simulator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                7-day burnout risk projections, circadian fatigue modeling, and preemptive resilience inoculations before high-pressure sprints.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-purple-400">7-Day Trajectory</span>
              <span className="font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Forecast <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 5: Integrations & Sync Hub */}
          <div
            onClick={() => onNavigateToView('integrations')}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold bg-blue-950/50 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                  Sync & Devices
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-blue-300 transition-colors">
                Integrations & Identity Sync
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Account verification to ensure correct account telemetry is ingested. Connect Apple HealthKit, Oura, Whoop, Fitbit, or custom webhooks.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-slate-500">5 Verified Active</span>
              <span className="font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage Sync <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 6: Clinical PDF Report Preview */}
          <div
            onClick={onOpenClinicalReport}
            className="group p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold bg-rose-950/50 px-2.5 py-0.5 rounded-md border border-rose-500/20">
                  Export PDF
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-100 group-hover:text-rose-300 transition-colors">
                Monthly Clinical Summary
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate formatted, downloadable clinical reports ready for psychiatric review, therapy consultations, or personal health dossiers.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-mono text-slate-500">September 2026 Dossier</span>
              <span className="font-semibold text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Generate Report <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
