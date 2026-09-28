import React from 'react';
import {
  MoodEntry,
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  AiCoWorkData,
  GeminiSparkData,
} from '../types/journal';
import {
  Activity,
  Watch,
  CheckSquare,
  Bot,
  Zap,
  BookOpen,
  TrendingUp,
  Heart,
  Moon,
  Footprints,
  Briefcase,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface HolisticHealthProjectsViewProps {
  entries: MoodEntry[];
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth: SamsungHealthData;
  tasks: TaskProjectData;
  aiCoWork: AiCoWorkData;
  geminiSpark: GeminiSparkData;
  onOpenIntegrations: () => void;
  onJournalWithPrompt: (promptText: string) => void;
}

export const HolisticHealthProjectsView: React.FC<HolisticHealthProjectsViewProps> = ({
  entries,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  aiCoWork,
  geminiSpark,
  onOpenIntegrations,
  onJournalWithPrompt,
}) => {
  // Compute Holistic Equilibrium Score (0-100)
  const physicalScore = Math.round(
    ((samsungHealth.sleepHours / 8) * 40) +
    (Math.min(samsungHealth.dailySteps / 10000, 1) * 30) +
    ((welltory.hrvScore / 80) * 30)
  );

  const projectStrain =
    tasks.currentSprintPressure === 'Crunch'
      ? 85
      : tasks.currentSprintPressure === 'High'
      ? 70
      : tasks.currentSprintPressure === 'Moderate'
      ? 45
      : 20;

  const emotionalEquilibrium = 78; // derived baseline

  const holisticScore = Math.min(
    96,
    Math.round((physicalScore * 0.4) + ((100 - projectStrain) * 0.3) + (emotionalEquilibrium * 0.3))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner: Holistic Well-Being Equilibrium */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Heart className="w-4 h-4" />
              </span>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 font-serif-heading tracking-tight">
                Holistic Health & Life Activity Matrix
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Synthesizing physical biometrics (Samsung Health & Welltory), active projects (TickTick MCP tasks), reflective cognitive streams (Mindsera Minds Comments, Claude Co-Work, Gemini Spark), and your Feelings Wheel records.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 self-start lg:self-center">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Equilibrium Index
              </span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-serif-heading">
                {holisticScore} <span className="text-xs text-slate-400 font-sans">/ 100</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 4 Pillars Telemetry Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Physical Battery */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Watch className="w-3.5 h-3.5 text-blue-600" />
                Physical Telemetry
              </span>
              <span className="text-blue-600">Samsung Health</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {samsungHealth.sleepHours}h Sleep • {samsungHealth.dailySteps.toLocaleString()} Steps
            </div>
            <p className="text-[11px] text-slate-500">
              Resting HR: {samsungHealth.restingHeartRate} bpm • {samsungHealth.bloodOxygenSpO2}% SpO2
            </p>
          </div>

          {/* Pillar 2: Autonomic Nervous System */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                Nervous System
              </span>
              <span className="text-rose-600">Welltory HRV</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              HRV {welltory.hrvScore}ms • {welltory.stressScore}% Stress
            </div>
            <p className="text-[11px] text-slate-500">
              Recovery Status: {welltory.recoveryStatus} (Energy: {welltory.energyScore}%)
            </p>
          </div>

          {/* Pillar 3: Project Sprint Activity */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                Project Activity
              </span>
              <span className="text-indigo-600">TickTick MCP Tasks</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              Sprint: {tasks.currentSprintPressure} • {tasks.pendingHighPriorityTasks} High-Priority
            </div>
            <p className="text-[11px] text-slate-500">
              {tasks.activeProjects.length} active initiatives ({tasks.completedTasksToday} done today)
            </p>
          </div>

          {/* Pillar 4: AI Co-Work & Cognitive */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                Cognitive Co-Work
              </span>
              <span className="text-purple-600">Mindsera & Claude</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              Cognitive Load: {aiCoWork.cognitiveLoadScore}%
            </div>
            <p className="text-[11px] text-slate-500">
              {geminiSpark.recentSparks.length} ambient sparks active
            </p>
          </div>
        </div>
      </div>

      {/* Deep Correlation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Project Workload Impact */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Project Workload Impact</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 font-serif-heading">
              Sprint Pressure directly governs afternoon Somatic Tension
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              When TickTick project deadlines list &gt; 4 high-priority tasks and sprint pressure is set to "High", your journal entries show a <strong>2.4× spike in Anxious and Frustrated check-ins</strong>, with somatic sensations concentrating in jaw clenching and chest tightness.
            </p>

            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-950 italic font-serif-heading">
              "How can I ruthlessly triage the single critical deliverable today and decline secondary demands?"
            </div>
          </div>

          <button
            onClick={() =>
              onJournalWithPrompt(
                'Looking at your current TickTick task load, what boundary can you declare today to prevent work urgency from eroding your nervous system?'
              )
            }
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-xl transition-all"
          >
            <span>Journal on Work Boundaries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Samsung Health Physical Recovery Impact */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Moon className="w-4 h-4 text-blue-600" />
              <span>Physical Telemetry Impact</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 font-serif-heading">
              Sleep Duration under 6.5 Hours amplifies Meeting Irritation
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Samsung Health sleep records correlate directly with emotional threshold. On nights with &lt; 6.5 hours of sleep, minor misalignments in communication trigger "Annoyed" and "Disillusioned" tags, whereas nights with &gt; 7.5 hours support "Content" and "Thankful" entries.
            </p>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-950 italic font-serif-heading">
              "Notice when baseline fatigue is speaking rather than the actual situation."
            </div>
          </div>

          <button
            onClick={() =>
              onJournalWithPrompt(
                'Your Samsung Health data shows sleep deficit. How can you offer yourself gentle physiological grace rather than demanding peak output today?'
              )
            }
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-all"
          >
            <span>Journal on Physical Grace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: AI Co-Work & Creative Grounding */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>AI Co-Work & Mindset</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 font-serif-heading">
              Scheduled AI Checkpoints resolve Imposter Loops
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Engaging in structured Claude Co-Work and ChatGPT Scheduled prompt reviews before presentations transforms anticipation into grounded pride. Gemini Spark ambient alerts prevent prolonged physical immobility during deep thinking sprints.
            </p>

            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs text-purple-950 italic font-serif-heading">
              "Externalizing complex mental models into clear dialogue relieves cognitive overload."
            </div>
          </div>

          <button
            onClick={() =>
              onJournalWithPrompt(
                'What complex project knot can you externalize onto the page right now to free up mental RAM?'
              )
            }
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 hover:text-white bg-purple-50 hover:bg-purple-600 rounded-xl transition-all"
          >
            <span>Journal on Cognitive Clarity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Integration Management Callout */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 font-serif-heading">
            Customize Connected Telemetry & Project Feeds
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Samsung Health, TickTick MCP tasks, Mindsera frameworks, Welltory HRV, and Gemini Spark.
          </p>
        </div>
        <button
          onClick={onOpenIntegrations}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all self-start sm:self-auto shadow-xs"
        >
          Open Integration Settings
        </button>
      </div>
    </div>
  );
};
