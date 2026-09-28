import { useState, useMemo } from 'react';
import {
  MoodEntry,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
  SobrietyRecoveryContext,
  MindsaraContext,
  ActionSuggestion,
  ActionDomain,
  DailyIntention,
} from '../types/journal';
import { generateActionSuggestions } from '../utils/actionSuggestionsEngine';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Briefcase,
  DollarSign,
  GraduationCap,
  Users,
  HeartPulse,
  BookOpen,
  Clock,
  Wind,
  ShieldCheck,
  Check,
  Zap,
  Target,
} from 'lucide-react';

interface ActionSuggestionsSectionProps {
  entries: MoodEntry[];
  welltory: WelltoryBiometrics;
  samsungHealth: SamsungHealthData;
  tasks: TaskProjectData;
  sobriety: SobrietyRecoveryContext;
  mindsara: MindsaraContext;
  onSelectPrompt: (promptText: string) => void;
  onOpenUrgeSurfing?: () => void;
  dailyIntention?: DailyIntention;
  onToggleDailyIntentionComplete?: () => void;
}

export const ActionSuggestionsSection = ({
  entries,
  welltory,
  samsungHealth,
  tasks,
  sobriety,
  mindsara,
  onSelectPrompt,
  onOpenUrgeSurfing,
  dailyIntention,
  onToggleDailyIntentionComplete,
}: ActionSuggestionsSectionProps) => {
  // Generate suggestions from current context
  const suggestions = useMemo(
    () => generateActionSuggestions(entries, welltory, samsungHealth, tasks, sobriety, mindsara),
    [entries, welltory, samsungHealth, tasks, sobriety, mindsara]
  );

  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const domainIcons: Record<ActionDomain, any> = {
    'Productivity & Work': Briefcase,
    'Finances & Life Admin': DollarSign,
    'School & Skill Growth': GraduationCap,
    'Relationships & Social': Users,
    'Therapeutic & Somatic': HeartPulse,
    'Journaling & Reflection': BookOpen,
  };

  const domainColors: Record<ActionDomain, { bg: string; text: string; border: string }> = {
    'Productivity & Work': { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-500/30' },
    'Finances & Life Admin': { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    'School & Skill Growth': { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-500/30' },
    'Relationships & Social': { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-500/30' },
    'Therapeutic & Somatic': { bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-500/30' },
    'Journaling & Reflection': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/30' },
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (selectedDomain === 'All') return true;
    return s.domain === selectedDomain;
  });

  const domainsList = [
    'All',
    'Productivity & Work',
    'Finances & Life Admin',
    'School & Skill Growth',
    'Relationships & Social',
    'Therapeutic & Somatic',
    'Journaling & Reflection',
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Context-Aware Action Engine
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
              Live Telemetry Grounded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Concrete next steps synthesized from your latest journal reflections, Welltory autonomic markers, Samsung sleep debt, and TickTick sprint tasks.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500">Suggested: </span>
            <span className="text-slate-200 font-bold">{suggestions.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500">Completed: </span>
            <span className="text-emerald-400 font-bold">
              {Object.values(completedMap).filter(Boolean).length}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Daily Intention Progress Reinforcement */}
      {dailyIntention && (
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            dailyIntention.completed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={onToggleDailyIntentionComplete}
              title={dailyIntention.completed ? 'Mark intention as pending' : 'Mark intention as completed'}
              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                dailyIntention.completed
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-xs'
                  : 'border-indigo-400/50 hover:border-indigo-300 bg-slate-900 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Today's Daily Focus
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {dailyIntention.category}
                </span>
                {dailyIntention.completed && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Achieved Today
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-100 font-serif leading-snug mt-0.5">
                "{dailyIntention.text}"
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono text-slate-400 block">
              {dailyIntention.completed
                ? 'Reinforced in Daily Practice ✓'
                : 'Action recommendations below reinforce this focus'}
            </span>
          </div>
        </div>
      )}

      {/* Domain Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {domainsList.map((domain) => (
          <button
            key={domain}
            onClick={() => setSelectedDomain(domain)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedDomain === domain
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/70 border border-slate-800/80'
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Suggestions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuggestions.map((item) => {
          const isDone = !!completedMap[item.id];
          const IconComp = domainIcons[item.domain] || Sparkles;
          const colors = domainColors[item.domain] || {
            bg: 'bg-slate-950',
            text: 'text-slate-300',
            border: 'border-slate-800',
          };

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Header row: Domain badge, Priority, Checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{item.domain}</span>
                    </span>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                        item.priority === 'High'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeEstimate}
                    </span>

                    <button
                      onClick={() => toggleComplete(item.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700 hover:border-slate-500 text-transparent'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4
                    className={`font-serif font-bold text-base leading-snug ${
                      isDone ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Context & Data Rationale */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    <strong className="text-slate-200">Data Driver: </strong>
                    {item.dataRationale}
                  </span>
                </div>

                {/* Concrete Steps Checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                    Action Checklist:
                  </span>
                  <ul className="space-y-1">
                    {item.concreteSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-indigo-400 font-mono text-[10px] shrink-0 mt-0.5">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Interactive Triggers */}
              <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
                {item.journalPrompt && (
                  <button
                    onClick={() => onSelectPrompt(item.journalPrompt!)}
                    className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Journal on This Action</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {item.exerciseType && (
                  <button
                    onClick={() => {
                      if (onOpenUrgeSurfing) onOpenUrgeSurfing();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/30 text-teal-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>Start Somatic Reset</span>
                  </button>
                )}

                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`text-xs font-mono transition-colors ml-auto cursor-pointer ${
                    isDone ? 'text-slate-500' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isDone ? 'Completed ✓' : 'Mark Done'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
