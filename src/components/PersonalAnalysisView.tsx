import { useState, useMemo } from 'react';
import {
  MoodEntry,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
  SobrietyRecoveryContext,
  PersonalAnalysisPeriod,
} from '../types/journal';
import { generatePersonalAnalysisReport } from '../utils/personalAnalysisEngine';
import {
  ShieldCheck,
  TrendingUp,
  Brain,
  Sparkles,
  Quote,
  Activity,
  Heart,
  AlertTriangle,
  Award,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface PersonalAnalysisViewProps {
  entries: MoodEntry[];
  welltory: WelltoryBiometrics;
  samsungHealth: SamsungHealthData;
  tasks: TaskProjectData;
  sobriety: SobrietyRecoveryContext;
  onSelectPrompt: (promptText: string) => void;
  onOpenIntegrations: () => void;
}

export const PersonalAnalysisView = ({
  entries,
  welltory,
  samsungHealth,
  tasks,
  sobriety,
  onSelectPrompt,
  onOpenIntegrations,
}: PersonalAnalysisViewProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PersonalAnalysisPeriod>('30d');
  const [activeTab, setActiveTab] = useState<'all' | 'strengths' | 'weaknesses' | 'emerging'>('all');

  // Generate dynamic analysis report based on period
  const report = useMemo(
    () =>
      generatePersonalAnalysisReport(
        entries,
        welltory,
        samsungHealth,
        tasks,
        sobriety,
        selectedPeriod
      ),
    [entries, welltory, samsungHealth, tasks, sobriety, selectedPeriod]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* EXECUTIVE ARCHETYPE HEADER */}
      <section className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-950/70 border border-purple-500/30 text-purple-300 font-semibold">
                Psychological Analysis & Trait Growth
              </span>
              <span>·</span>
              <span className="text-indigo-400 font-semibold">
                Longitudinal Reflection Engine
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight">
              Personality & Inner World Portrait
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Objective personality traits, core strengths, psychological blind spots, and emerging qualities mapped across your journal reflections and biometric telemetry.
            </p>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs shrink-0">
            {(['7d', '30d', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period === '7d' ? 'Past 7 Days' : period === '30d' ? 'Past 30 Days' : 'All Time (43d)'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Archetype Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  Primary Psychological Archetype
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  {report.periodLabel}
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
                {report.archetypeTitle}
              </h2>
              <p className="text-xs text-purple-300/90 font-mono mt-0.5">
                {report.archetypeSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                Sobriety: <strong className="text-emerald-400">Day 43</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                Entries Analyzed: <strong className="text-indigo-400">{entries.length}</strong>
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {report.executiveSummary}
          </p>

          <div className="pt-2 text-xs text-slate-400 leading-relaxed border-t border-slate-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Evolution Vector: </strong>
              {report.psychologicalEvolutionNarrative}
            </span>
          </div>
        </div>

        {/* Growth Metrics Bar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="text-slate-300 font-medium">Emotional Granularity</span>
              <span className="font-mono text-indigo-400 font-bold">
                {report.growthMetrics.emotionalGranularityScore}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${report.growthMetrics.emotionalGranularityScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Tier 3 feelings precision</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="text-slate-300 font-medium">Resilience Capacity</span>
              <span className="font-mono text-emerald-400 font-bold">
                {report.growthMetrics.resilienceCapacityScore}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${report.growthMetrics.resilienceCapacityScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">GABA baseline recovery</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="text-slate-300 font-medium">Vulnerability Openness</span>
              <span className="font-mono text-amber-400 font-bold">
                {report.growthMetrics.vulnerabilityOpennessScore}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${report.growthMetrics.vulnerabilityOpennessScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Honest admission of fatigue</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="text-slate-300 font-medium">Somatic Interoception</span>
              <span className="font-mono text-teal-400 font-bold">
                {report.growthMetrics.somaticAwarenessScore}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${report.growthMetrics.somaticAwarenessScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">HRV / autonomic integration</span>
          </div>
        </div>
      </section>

      {/* FILTER TABS: ALL / STRENGTHS / WEAKNESSES / EMERGING */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Dimensions
          </button>
          <button
            onClick={() => setActiveTab('strengths')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'strengths'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Strengths ({report.strengths.length})
          </button>
          <button
            onClick={() => setActiveTab('weaknesses')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'weaknesses'
                ? 'bg-amber-950 text-amber-200 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blind Spots & Weaknesses ({report.weaknesses.length})
          </button>
          <button
            onClick={() => setActiveTab('emerging')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'emerging'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emerging Qualities ({report.emergingQualities.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Evidence sourced directly from journal entries & telemetry
        </span>
      </div>

      {/* TRAIT CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: STRENGTHS */}
        {(activeTab === 'all' || activeTab === 'strengths') &&
          report.strengths.map((trait) => (
            <div
              key={trait.traitName}
              className="bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl p-6 backdrop-blur-xl shadow-md space-y-4 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Core Strength
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {trait.dimension}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100 mt-0.5">
                      {trait.traitName}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-emerald-400">
                    {trait.score}/100
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 capitalize">
                    {trait.trend} trend
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {trait.description}
              </p>

              {/* Verbatim Journal Quotes Evidence */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Exhibited in Your Journal Entries:
                </span>
                <div className="space-y-1.5">
                  {trait.journalEvidenceQuotes.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Quote className="w-2.5 h-2.5 text-indigo-400" />
                          <span>Entry from {item.date}</span>
                        </span>
                        <span className="text-emerald-400">Mood: {item.emotion}</span>
                      </div>
                      <p className="text-slate-300 italic font-serif text-[11px] leading-relaxed">
                        "{item.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biometrics & Constructive Tip */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-300 text-[11px] font-mono">
                  <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{trait.biometricCorrelations}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-900 text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-emerald-300">How to Leverage: </strong>
                  {trait.actionableRecommendation}
                </div>
              </div>
            </div>
          ))}

        {/* SECTION 2: BLIND SPOTS & WEAKNESSES */}
        {(activeTab === 'all' || activeTab === 'weaknesses') &&
          report.weaknesses.map((trait) => (
            <div
              key={trait.traitName}
              className="bg-slate-900/60 border border-amber-500/30 hover:border-amber-500/60 rounded-3xl p-6 backdrop-blur-xl shadow-md space-y-4 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/20">
                        Blind Spot / Vulnerability
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {trait.dimension}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100 mt-0.5">
                      {trait.traitName}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-amber-400">
                    {trait.score}/100
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 capitalize">
                    {trait.trend} trend
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {trait.description}
              </p>

              {/* Verbatim Journal Quotes Evidence */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Exhibited in Your Journal Entries:
                </span>
                <div className="space-y-1.5">
                  {trait.journalEvidenceQuotes.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Quote className="w-2.5 h-2.5 text-amber-400" />
                          <span>Entry from {item.date}</span>
                        </span>
                        <span className="text-amber-400">Mood: {item.emotion}</span>
                      </div>
                      <p className="text-slate-300 italic font-serif text-[11px] leading-relaxed">
                        "{item.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biometrics & Constructive Action */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-mono">
                  <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{trait.biometricCorrelations}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-900 text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-amber-300">Clinical Counter-Strategy: </strong>
                  {trait.actionableRecommendation}
                </div>
              </div>
            </div>
          ))}

        {/* SECTION 3: EMERGING QUALITIES */}
        {(activeTab === 'all' || activeTab === 'emerging') &&
          report.emergingQualities.map((trait) => (
            <div
              key={trait.traitName}
              className="bg-slate-900/60 border border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-6 backdrop-blur-xl shadow-md space-y-4 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/20">
                        Emerging Quality
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {trait.dimension}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100 mt-0.5">
                      {trait.traitName}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-purple-400">
                    {trait.score}/100
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 capitalize">
                    {trait.trend} trend
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {trait.description}
              </p>

              {/* Verbatim Journal Quotes Evidence */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Exhibited in Your Journal Entries:
                </span>
                <div className="space-y-1.5">
                  {trait.journalEvidenceQuotes.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Quote className="w-2.5 h-2.5 text-purple-400" />
                          <span>Entry from {item.date}</span>
                        </span>
                        <span className="text-purple-400">Mood: {item.emotion}</span>
                      </div>
                      <p className="text-slate-300 italic font-serif text-[11px] leading-relaxed">
                        "{item.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biometrics & Growth Suggestion */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-mono">
                  <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{trait.biometricCorrelations}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-900 text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-purple-300">Reinforcement Strategy: </strong>
                  {trait.actionableRecommendation}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Guided Self-Reflection Inquiry Callout */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h4 className="font-serif font-bold text-slate-100 text-base">
              Deepen This Personal Analysis in Your Journal
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            "Looking across my {report.periodLabel.toLowerCase()}, where am I ready to release perfectionism and trust my emerging somatic distress endurance?"
          </p>
        </div>

        <button
          onClick={() =>
            onSelectPrompt(
              `Reflecting on my ${report.archetypeTitle} psychological profile: Where am I still tempted to over-extend myself, and what boundaries will protect my recovery and peace this week?`
            )
          }
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <span>Journal on This Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
};
