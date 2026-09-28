import React, { useState } from 'react';
import {
  GeneratedPrompt,
  EmotionSelection,
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  AiCoWorkData,
  GeminiSparkData,
} from '../types/journal';
import {
  Sparkles,
  RefreshCw,
  Edit3,
  Copy,
  Check,
  Activity,
  BookOpen,
  Compass,
  Feather,
  Brain,
  ShieldCheck,
  Send,
  Watch,
  CheckSquare,
  Bot,
  Zap,
} from 'lucide-react';

interface PromptSuggestionsProps {
  selectedEmotion: EmotionSelection | null;
  prompts: GeneratedPrompt[];
  isLoading: boolean;
  onRefreshPrompts: (customNote?: string) => void;
  onSelectPromptForJournal: (promptText: string) => void;
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth?: SamsungHealthData;
  tasks?: TaskProjectData;
  aiCoWork?: AiCoWorkData;
  geminiSpark?: GeminiSparkData;
  onOpenIntegrations: () => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
  selectedEmotion,
  prompts,
  isLoading,
  onRefreshPrompts,
  onSelectPromptForJournal,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  aiCoWork,
  geminiSpark,
  onOpenIntegrations,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    onRefreshPrompts(customNote.trim());
    setCustomNote('');
    setShowCustomInput(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Deep Reflection':
        return <Compass className="w-4 h-4 text-indigo-500" />;
      case 'Somatic & Grounding':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Cognitive Shift':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Creative & Forward':
        return <Feather className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Deep Reflection':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Somatic & Grounding':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cognitive Shift':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Creative & Forward':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (!selectedEmotion) {
    return null;
  }

  const emotionLabel = selectedEmotion.fullPath.join(' → ');

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
              Personalized AI Prompts
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${selectedEmotion.node.color}20`,
                color: selectedEmotion.node.color,
              }}
            >
              {selectedEmotion.node.name}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Grounded in your feelings path <span className="font-semibold text-slate-700">"{emotionLabel}"</span>, physical recovery telemetry, and ongoing project load.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {showCustomInput ? 'Hide Extra Context' : '+ Add Situational Context'}
          </button>
          <button
            onClick={() => onRefreshPrompts()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Prompts</span>
          </button>
        </div>
      </div>

      {/* Optional Situational Context Input */}
      {showCustomInput && (
        <form onSubmit={handleCustomNoteSubmit} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            What specifically is happening right now? (Optional note for Gemini)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Just delivered client slides, feeling sudden letdown fatigue..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !customNote.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl flex items-center gap-1 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </form>
      )}

      {/* Holistic Integration Badges / Status */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Context active:</span>

        {/* Samsung Health Badge */}
        {samsungHealth?.enabled && (
          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-800 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Watch className="w-3 h-3 text-blue-600" />
            <span>Samsung Health: {samsungHealth.sleepHours}h Sleep • {samsungHealth.dailySteps.toLocaleString()} Steps</span>
          </button>
        )}

        {/* TickTick Tasks Badge */}
        {tasks?.enabled && (
          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <CheckSquare className="w-3 h-3 text-indigo-600" />
            <span>TickTick MCP: Sprint {tasks.currentSprintPressure} ({tasks.pendingHighPriorityTasks} pending)</span>
          </button>
        )}

        {/* Welltory Badge */}
        {welltory.enabled && (
          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-800 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <Activity className="w-3 h-3 text-rose-600" />
            <span>Welltory: HRV {welltory.hrvScore}ms • {welltory.stressScore}% Stress</span>
          </button>
        )}

        {/* Mindsera Badge */}
        {mindsara.enabled && (
          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-800 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <BookOpen className="w-3 h-3 text-purple-600" />
            <span>Mindsera: {mindsara.activePersona || 'Stoic'} Frameworks</span>
          </button>
        )}

        {/* Claude Co-Work Badge */}
        {aiCoWork?.enabled && (
          <button
            onClick={onOpenIntegrations}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-800 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <Bot className="w-3 h-3 text-purple-600" />
            <span>Claude Co-Work</span>
          </button>
        )}
      </div>

      {/* Prompts Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse space-y-3"
            >
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-14 bg-slate-200/70 rounded-lg" />
              <div className="h-3 w-4/5 bg-slate-200/50 rounded" />
              <div className="h-8 w-32 bg-slate-200 rounded-xl" />
            </div>
          ))
        ) : prompts.length > 0 ? (
          prompts.map((p) => {
            const isCopied = copiedId === p.id;
            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                        p.category
                      )}`}
                    >
                      {getCategoryIcon(p.category)}
                      {p.category}
                    </span>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(p.id, p.prompt)}
                      title="Copy prompt"
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Prompt Text */}
                  <p className="text-sm md:text-base font-medium text-slate-900 leading-snug font-serif-heading">
                    "{p.prompt}"
                  </p>

                  {/* Rationale Context */}
                  {p.rationale && (
                    <p className="mt-2.5 text-xs text-slate-500 leading-relaxed italic">
                      💡 {p.rationale}
                    </p>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Click to write</span>
                  <button
                    onClick={() => onSelectPromptForJournal(p.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-xl transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Journal with this</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-8 text-center text-slate-500 text-xs">
            No prompts generated yet. Tap "Regenerate Prompts" to create fresh insights.
          </div>
        )}
      </div>
    </div>
  );
};
