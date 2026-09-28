import React, { useState, useMemo } from 'react';
import {
  MoodEntry,
  EmotionSelection,
  GeneratedPrompt,
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  AiCoWorkData,
  GeminiSparkData,
  SobrietyRecoveryContext,
  DailyIntention,
} from '../types/journal';
import { FeelingsWheel } from './FeelingsWheel';
import { PromptSuggestions } from './PromptSuggestions';
import { ActionSuggestionsSection } from './ActionSuggestionsSection';
import {
  BookOpen,
  Mic,
  Plus,
  Compass,
  TrendingUp,
  Sparkles,
  HeartPulse,
  Brain,
  ChevronDown,
  ChevronUp,
  Tag,
  Quote,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface JournalLandingViewProps {
  entries: MoodEntry[];
  selectedEmotion: EmotionSelection | null;
  onSelectEmotion: (selection: EmotionSelection) => void;
  prompts: GeneratedPrompt[];
  isPromptsLoading: boolean;
  onRefreshPrompts: (customNote?: string) => void;
  onSelectPromptForJournal: (promptText: string) => void;
  onOpenNewJournalEntry: (prompt?: string) => void;
  onOpenCallMode: () => void;
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth: SamsungHealthData;
  tasks: TaskProjectData;
  aiCoWork: AiCoWorkData;
  geminiSpark: GeminiSparkData;
  sobriety: SobrietyRecoveryContext;
  dailyIntention?: DailyIntention;
  onToggleDailyIntentionComplete?: () => void;
  onOpenIntegrations: () => void;
}

export const JournalLandingView: React.FC<JournalLandingViewProps> = ({
  entries,
  selectedEmotion,
  onSelectEmotion,
  prompts,
  isPromptsLoading,
  onRefreshPrompts,
  onSelectPromptForJournal,
  onOpenNewJournalEntry,
  onOpenCallMode,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  aiCoWork,
  geminiSpark,
  sobriety,
  dailyIntention,
  onToggleDailyIntentionComplete,
  onOpenIntegrations,
}) => {
  const [isWheelExpanded, setIsWheelExpanded] = useState(true);
  const [trendTimeframe, setTrendTimeframe] = useState<'7d' | '30d' | 'all'>('30d');
  const [activeAnalysisView, setActiveAnalysisView] = useState<'spectrum' | 'valence' | 'themes' | 'somatic'>('spectrum');

  // Filter entries strictly for journal analysis (Restricted strictly to journal entries, not integrations!)
  const filteredEntries = useMemo(() => {
    if (trendTimeframe === 'all') return entries;
    const now = new Date('2026-09-28T12:00:00');
    const days = trendTimeframe === '7d' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return entries.filter((e) => new Date(e.date) >= cutoff);
  }, [entries, trendTimeframe]);

  // 1. Emotion Spectrum Distribution (Strictly Journal Entries)
  const emotionSpectrum = useMemo(() => {
    const counts: Record<string, { count: number; color: string }> = {};
    const colorMap: Record<string, string> = {
      Joyful: '#F59E0B',
      Powerful: '#10B981',
      Peaceful: '#06B6D4',
      Sad: '#3B82F6',
      Mad: '#EF4444',
      Scared: '#8B5CF6',
    };

    filteredEntries.forEach((e) => {
      const primary = e.primaryEmotion || 'Reflective';
      if (!counts[primary]) {
        counts[primary] = { count: 0, color: colorMap[primary] || '#64748B' };
      }
      counts[primary].count += 1;
    });

    const total = filteredEntries.length || 1;
    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      percentage: Math.round((data.count / total) * 100),
      color: data.color,
    })).sort((a, b) => b.count - a.count);
  }, [filteredEntries]);

  // 2. Average Intensity and Valence Trend
  const journalMetrics = useMemo(() => {
    const total = filteredEntries.length;
    if (total === 0) {
      return { avgIntensity: 5.5, positiveRatio: 65, avgWordCount: 140, totalInsights: 0 };
    }

    const sumIntensity = filteredEntries.reduce((acc, e) => acc + (e.intensity || 5), 0);
    const avgIntensity = Number((sumIntensity / total).toFixed(1));

    const positiveCount = filteredEntries.filter((e) =>
      ['Joyful', 'Powerful', 'Peaceful'].includes(e.primaryEmotion)
    ).length;
    const positiveRatio = Math.round((positiveCount / total) * 100);

    const totalWords = filteredEntries.reduce((acc, e) => {
      return acc + (e.journalText ? e.journalText.trim().split(/\s+/).length : 0);
    }, 0);
    const avgWordCount = Math.round(totalWords / total);

    const totalInsights = filteredEntries.filter((e) => e.aiReflection || e.mindseraMindsComments?.length).length;

    return { avgIntensity, positiveRatio, avgWordCount, totalInsights };
  }, [filteredEntries]);

  // 3. Recurring Psychological Themes extracted from Journal Content
  const recurringThemes = useMemo(() => {
    const themeCounts: Record<string, number> = {};
    filteredEntries.forEach((e) => {
      const tags = e.tags || [];
      const sentimentThemes = e.sentimentAnalysis?.themeTags || [];
      const combined = Array.from(new Set([...tags, ...sentimentThemes]));
      combined.forEach((t) => {
        if (!['Daily Check-in', 'General'].includes(t)) {
          themeCounts[t] = (themeCounts[t] || 0) + 1;
        }
      });
    });

    return Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredEntries]);

  // 4. Somatic Cues Logged in Journal Reflections
  const somaticDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach((e) => {
      (e.somaticSensations || []).forEach((cue) => {
        counts[cue] = (counts[cue] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([cue, count]) => ({ cue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredEntries]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. PRIMARY JOURNAL LANDING COMMAND HEADER                                */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-semibold">
                Journaling Workspace
              </span>
              <span>·</span>
              <span>Feelings Wheel & Narrative Studio</span>
              <span>·</span>
              <span className="text-slate-300 font-semibold">{entries.length} reflections recorded</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">
              Personal Journal & Reflection Studio
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your private sanctuary for somatic awareness, emotional granularity, and introspective clarity. Explore feelings on the interactive wheel, talk aloud in Call Mode, or track your internal patterns over time.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenNewJournalEntry(selectedEmotion?.node.defaultPrompts[0])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Journal Entry</span>
            </button>

            <button
              onClick={onOpenCallMode}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs group"
              title="Launch interactive voice session with AI Companion"
            >
              <Mic className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Call Mode</span>
              <span className="text-[10px] text-purple-400 font-mono hidden sm:inline">· Voice</span>
            </button>

            <button
              onClick={() => setIsWheelExpanded(!isWheelExpanded)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>{isWheelExpanded ? 'Hide Wheel' : 'Open Wheel Tool'}</span>
              {isWheelExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Journaling Ribbon Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">AVG INTENSITY</span>
            <span className="font-bold text-slate-100 text-lg">{journalMetrics.avgIntensity} / 10</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">Emotional baseline</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">VALENCE RATIO</span>
            <span className="font-bold text-emerald-400 text-lg">{journalMetrics.positiveRatio}%</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">Nourishing vs Processing</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">DEPTH PER ENTRY</span>
            <span className="font-bold text-indigo-300 text-lg">{journalMetrics.avgWordCount}</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">Average words written</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">INSIGHTS GENERATED</span>
            <span className="font-bold text-purple-300 text-lg">{journalMetrics.totalInsights}</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">Reflections & Minds comments</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEELINGS WHEEL AS A PRIMARY TOOL (COLLAPSIBLE / EXPANDABLE)             */}
      {/* ========================================================================= */}
      {isWheelExpanded && (
        <div className="space-y-6 animate-in fade-in zoom-in-98 duration-200">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Feelings Wheel Navigator
              </h2>
              <span className="text-xs text-slate-500">· Tool 1 of 3</span>
            </div>
            <button
              onClick={() => setIsWheelExpanded(false)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Minimize Tool</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <FeelingsWheel
            selectedEmotion={selectedEmotion}
            onSelectEmotion={onSelectEmotion}
            onQuickJournal={() => {
              onOpenNewJournalEntry(
                prompts[0]?.prompt || selectedEmotion?.node.defaultPrompts[0] || ''
              );
            }}
          />

          {/* Prompt Suggestions connected to selected emotion */}
          <PromptSuggestions
            selectedEmotion={selectedEmotion}
            prompts={prompts}
            isLoading={isPromptsLoading}
            onRefreshPrompts={onRefreshPrompts}
            onSelectPromptForJournal={onSelectPromptForJournal}
            welltory={welltory}
            mindsara={mindsara}
            samsungHealth={samsungHealth}
            tasks={tasks}
            aiCoWork={aiCoWork}
            geminiSpark={geminiSpark}
            onOpenIntegrations={onOpenIntegrations}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PATTERN & TREND ANALYSIS (STRICTLY RESTRICTED TO JOURNAL ENTRIES)       */}
      {/* ========================================================================= */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                    Journal Pattern & Trend Analysis
                  </h2>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-md font-semibold">
                    Journal Entries Only
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Strictly derived from your narrative check-ins, written reflections, and somatic tags over time (external biometrics and tasks excluded).
            </p>
          </div>

          {/* Timeframe Selector (7d, 30d, all) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            {(['7d', '30d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTrendTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  trendTimeframe === tf
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === '7d' ? 'Past 7 Days' : tf === '30d' ? 'Past 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Tabs for Journal Analytics */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveAnalysisView('spectrum')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeAnalysisView === 'spectrum'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            🎨 Emotional Spectrum
          </button>
          <button
            onClick={() => setActiveAnalysisView('themes')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeAnalysisView === 'themes'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            🏷️ Recurring Themes ({recurringThemes.length})
          </button>
          <button
            onClick={() => setActiveAnalysisView('somatic')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeAnalysisView === 'somatic'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            🫀 Somatic Cues Logged
          </button>
          <button
            onClick={() => setActiveAnalysisView('valence')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeAnalysisView === 'valence'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            📈 Intensity & Valence Trajectory
          </button>
        </div>

        {/* View 1: Emotional Spectrum Distribution */}
        {activeAnalysisView === 'spectrum' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {emotionSpectrum.map((item) => (
                <div
                  key={item.name}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono text-slate-400">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {item.count} {item.count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Quote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="text-slate-200 font-semibold mr-1">Granularity Insight:</span>
                Your journal reflections highlight a balanced emotional spectrum where vulnerable states are processed rather than suppressed, supporting lasting neuro-affective flexibility.
              </p>
            </div>
          </div>
        )}

        {/* View 2: Recurring Themes from Journal Text */}
        {activeAnalysisView === 'themes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recurringThemes.map((item) => (
                <div
                  key={item.theme}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-200 block truncate">
                      {item.theme}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Explored in {item.count} {item.count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold">
                    {item.count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 3: Somatic Cues Logged in Reflections */}
        {activeAnalysisView === 'somatic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {somaticDistribution.map((item) => (
                <div
                  key={item.cue}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.cue}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {item.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 4: Intensity & Valence Trajectory */}
        {activeAnalysisView === 'valence' && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Emotional Intensity Trajectory across {filteredEntries.length} check-ins
              </span>
              <span className="font-mono text-slate-500">Scale: 1 (Faint) to 10 (Peak)</span>
            </div>

            {/* Simple sparkbar representation */}
            <div className="flex items-end gap-1.5 h-28 pt-4">
              {filteredEntries.slice(-14).map((entry, idx) => {
                const heightPct = Math.max(15, (entry.intensity / 10) * 100);
                const isHigh = entry.intensity >= 8;
                const isLow = entry.intensity <= 4;
                return (
                  <div key={entry.id || idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-slate-800/80 rounded-t-md h-full flex items-end">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isHigh
                            ? 'bg-rose-500'
                            : isLow
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                      {entry.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. CONTEXT-AWARE ACTION ENGINE (LINKED TO DAILY INTENTION)                 */}
      {/* ========================================================================= */}
      <ActionSuggestionsSection
        entries={entries}
        welltory={welltory}
        samsungHealth={samsungHealth}
        tasks={tasks}
        sobriety={sobriety}
        mindsara={mindsara}
        onSelectPrompt={onSelectPromptForJournal}
        dailyIntention={dailyIntention}
        onToggleDailyIntentionComplete={onToggleDailyIntentionComplete}
      />
    </div>
  );
};
