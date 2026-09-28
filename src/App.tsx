import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  EmotionSelection,
  MoodEntry,
  GeneratedPrompt,
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  AiCoWorkData,
  GeminiSparkData,
} from './types/journal';
import { EMOTIONS_DATA, getEmotionPath } from './data/emotionsData';
import {
  loadStoredEntries,
  saveStoredEntries,
  loadStoredWelltory,
  saveStoredWelltory,
  loadStoredMindsara,
  saveStoredMindsara,
  loadStoredSamsungHealth,
  saveStoredSamsungHealth,
  loadStoredTasks,
  saveStoredTasks,
  loadStoredAiCoWork,
  saveStoredAiCoWork,
  loadStoredGeminiSpark,
  saveStoredGeminiSpark,
  SEED_MOOD_ENTRIES,
  INITIAL_WELLTORY_BIOMETRICS,
  INITIAL_MINDSARA_CONTEXT,
  INITIAL_SAMSUNG_HEALTH,
  INITIAL_TASK_PROJECTS,
  INITIAL_AI_COWORK,
  INITIAL_GEMINI_SPARK,
} from './data/seedData';
import { Navbar } from './components/Navbar';
import { FeelingsWheel } from './components/FeelingsWheel';
import { PromptSuggestions } from './components/PromptSuggestions';
import { MoodHistoryView } from './components/MoodHistoryView';
import { PatternInsightsView } from './components/PatternInsightsView';
import { HolisticHealthProjectsView } from './components/HolisticHealthProjectsView';
import { WeeklySentimentCard } from './components/WeeklySentimentCard';
import { JournalEditorModal } from './components/JournalEditorModal';
import { IntegrationsModal } from './components/IntegrationsModal';
import { SomaticGroundingBar } from './components/SomaticGroundingBar';
import { CheckCircle2, Sparkles, Heart } from 'lucide-react';

export default function App() {
  // State for all 6 holistic streams
  const [entries, setEntries] = useState<MoodEntry[]>(loadStoredEntries);
  const [welltory, setWelltory] = useState<WelltoryBiometrics>(loadStoredWelltory);
  const [mindsara, setMindsara] = useState<MindsaraContext>(loadStoredMindsara);
  const [samsungHealth, setSamsungHealth] = useState<SamsungHealthData>(loadStoredSamsungHealth);
  const [tasks, setTasks] = useState<TaskProjectData>(loadStoredTasks);
  const [aiCoWork, setAiCoWork] = useState<AiCoWorkData>(loadStoredAiCoWork);
  const [geminiSpark, setGeminiSpark] = useState<GeminiSparkData>(loadStoredGeminiSpark);

  // Active view: 'wheel' | 'history' | 'patterns' | 'predictive' | 'holistic'
  const [activeView, setActiveView] = useState<'wheel' | 'history' | 'patterns' | 'predictive' | 'holistic'>('wheel');

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionSelection | null>(() => {
    const peacefulNode = EMOTIONS_DATA[0].children?.[0].children?.[0] || EMOTIONS_DATA[0];
    const path = getEmotionPath(peacefulNode.id);
    return {
      primary: path[0]?.name || peacefulNode.name,
      secondary: path[1]?.name,
      tertiary: path[2]?.name,
      fullPath: path.map((n) => n.name),
      node: peacefulNode,
    };
  });

  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [isPromptsLoading, setIsPromptsLoading] = useState(false);

  // Modals & toast
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [activeJournalPrompt, setActiveJournalPrompt] = useState<string>('');
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State Persistence Handlers
  const handleUpdateEntries = (newEntries: MoodEntry[]) => {
    setEntries(newEntries);
    saveStoredEntries(newEntries);
  };

  const handleUpdateWelltory = (newData: WelltoryBiometrics) => {
    setWelltory(newData);
    saveStoredWelltory(newData);
  };

  const handleUpdateMindsara = (newData: MindsaraContext) => {
    setMindsara(newData);
    saveStoredMindsara(newData);
  };

  const handleUpdateSamsungHealth = (newData: SamsungHealthData) => {
    setSamsungHealth(newData);
    saveStoredSamsungHealth(newData);
  };

  const handleUpdateTasks = (newData: TaskProjectData) => {
    setTasks(newData);
    saveStoredTasks(newData);
  };

  const handleUpdateAiCoWork = (newData: AiCoWorkData) => {
    setAiCoWork(newData);
    saveStoredAiCoWork(newData);
  };

  const handleUpdateGeminiSpark = (newData: GeminiSparkData) => {
    setGeminiSpark(newData);
    saveStoredGeminiSpark(newData);
  };

  // Restore sample data
  const handleRestoreSampleData = () => {
    setEntries(SEED_MOOD_ENTRIES);
    saveStoredEntries(SEED_MOOD_ENTRIES);
    setWelltory(INITIAL_WELLTORY_BIOMETRICS);
    saveStoredWelltory(INITIAL_WELLTORY_BIOMETRICS);
    setMindsara(INITIAL_MINDSARA_CONTEXT);
    saveStoredMindsara(INITIAL_MINDSARA_CONTEXT);
    setSamsungHealth(INITIAL_SAMSUNG_HEALTH);
    saveStoredSamsungHealth(INITIAL_SAMSUNG_HEALTH);
    setTasks(INITIAL_TASK_PROJECTS);
    saveStoredTasks(INITIAL_TASK_PROJECTS);
    setAiCoWork(INITIAL_AI_COWORK);
    saveStoredAiCoWork(INITIAL_AI_COWORK);
    setGeminiSpark(INITIAL_GEMINI_SPARK);
    saveStoredGeminiSpark(INITIAL_GEMINI_SPARK);
    showToast('Reset sample journal records & all integration ecosystems.');
  };

  // In-memory prompt cache to prevent redundant API calls
  const promptsCacheRef = useRef<Record<string, GeneratedPrompt[]>>({});

  // Fetch prompts from server API
  const fetchPrompts = useCallback(
    async (emotion: EmotionSelection, customNote?: string) => {
      const cacheKey = `${emotion.fullPath.join('>')}_${customNote || ''}`;
      if (promptsCacheRef.current[cacheKey]?.length) {
        setPrompts(promptsCacheRef.current[cacheKey]);
        return;
      }

      setIsPromptsLoading(true);
      try {
        const recentEntriesSummary = entries
          .slice(0, 5)
          .map((e) => `${e.date}: ${e.primaryEmotion} (${e.journalText.slice(0, 80)}...)`)
          .join('\n');

        const response = await fetch('/api/generate-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emotionPath: emotion.fullPath,
            intensity: 6,
            somaticSensations: emotion.node.somaticClues,
            userNote: customNote,
            welltoryContext: welltory,
            mindsaraContext: mindsara,
            samsungHealthContext: samsungHealth,
            taskProjectContext: tasks,
            aiCoWorkContext: aiCoWork,
            geminiSparkContext: geminiSpark,
            pastEntriesSummary: recentEntriesSummary,
          }),
        });

        const data = await response.json();
        if (data.prompts && data.prompts.length > 0) {
          promptsCacheRef.current[cacheKey] = data.prompts;
          setPrompts(data.prompts);
        } else {
          // fallback to default
          const fallbackList: GeneratedPrompt[] = emotion.node.defaultPrompts.map((p, idx) => ({
            id: `def-${idx}`,
            category: (idx === 0 ? 'Deep Reflection' : idx === 1 ? 'Somatic & Grounding' : 'Cognitive Shift') as GeneratedPrompt['category'],
            prompt: p,
            rationale: `Grounded in ${emotion.node.name} baseline exploration.`,
          }));
          promptsCacheRef.current[cacheKey] = fallbackList;
          setPrompts(fallbackList);
        }
      } catch (err) {
        console.warn('Notice generating prompts, using grounded defaults:', err);
        const fallbackList: GeneratedPrompt[] = emotion.node.defaultPrompts.map((p, idx) => ({
          id: `def-${idx}`,
          category: (idx === 0 ? 'Deep Reflection' : idx === 1 ? 'Somatic & Grounding' : 'Cognitive Shift') as GeneratedPrompt['category'],
          prompt: p,
          rationale: `Grounded in ${emotion.node.name} baseline exploration.`,
        }));
        promptsCacheRef.current[cacheKey] = fallbackList;
        setPrompts(fallbackList);
      } finally {
        setIsPromptsLoading(false);
      }
    },
    [entries, welltory, mindsara, samsungHealth, tasks, aiCoWork, geminiSpark]
  );

  // Initial prompt fetch on load
  useEffect(() => {
    if (selectedEmotion && prompts.length === 0) {
      fetchPrompts(selectedEmotion);
    }
  }, []);

  // Handle emotion selection
  const handleSelectEmotion = (selection: EmotionSelection) => {
    setSelectedEmotion(selection);
    fetchPrompts(selection);
  };

  // Open journal modal with chosen prompt
  const handleSelectPromptForJournal = (promptText: string) => {
    setActiveJournalPrompt(promptText);
    setIsJournalModalOpen(true);
  };

  // Save new journal entry with physical and project snapshot
  const handleSaveEntry = async (entryData: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      biometricsSnapshot: {
        ...entryData.biometricsSnapshot,
        sleepHours: samsungHealth.enabled ? samsungHealth.sleepHours : undefined,
        dailySteps: samsungHealth.enabled ? samsungHealth.dailySteps : undefined,
      },
      projectContextSnapshot: tasks.enabled
        ? {
            sprintPressure: tasks.currentSprintPressure,
            pendingTasks: tasks.pendingHighPriorityTasks,
            activeProject: tasks.activeProjects[0],
          }
        : undefined,
    };
    const updated = [newEntry, ...entries];
    handleUpdateEntries(updated);
    showToast('Journal entry logged to your mood timeline!');
  };

  // Delete journal entry
  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    handleUpdateEntries(updated);
    showToast('Entry removed.');
  };

  // Update a single journal entry (e.g. with Mindsera Minds comments or frameworks)
  const handleUpdateSingleEntry = (updatedEntry: MoodEntry) => {
    const updated = entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e));
    handleUpdateEntries(updated);
    showToast('Mindsera analysis updated on entry!');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Bar */}
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenCheckIn={() => {
          setActiveJournalPrompt('');
          setIsJournalModalOpen(true);
        }}
        onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
        welltory={welltory}
        mindsara={mindsara}
        samsungHealth={samsungHealth}
        tasks={tasks}
        totalEntriesCount={entries.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: FEELINGS WHEEL & PERSONALIZED PROMPTS */}
        {activeView === 'wheel' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Weekly Sentiment Trend Summary Card with Recharts Sparkline */}
            <WeeklySentimentCard
              entries={entries}
              onViewFullHistory={() => setActiveView('history')}
              onNavigateToPredictive={() => setActiveView('predictive')}
            />

            {/* Feelings Wheel Section */}
            <FeelingsWheel
              selectedEmotion={selectedEmotion}
              onSelectEmotion={handleSelectEmotion}
              onQuickJournal={() => {
                setActiveJournalPrompt(
                  prompts[0]?.prompt || selectedEmotion?.node.defaultPrompts[0] || ''
                );
                setIsJournalModalOpen(true);
              }}
            />

            {/* AI Prompt Suggestions Section */}
            <PromptSuggestions
              selectedEmotion={selectedEmotion}
              prompts={prompts}
              isLoading={isPromptsLoading}
              onRefreshPrompts={(customNote) => {
                if (selectedEmotion) fetchPrompts(selectedEmotion, customNote);
              }}
              onSelectPromptForJournal={handleSelectPromptForJournal}
              welltory={welltory}
              mindsara={mindsara}
              samsungHealth={samsungHealth}
              tasks={tasks}
              aiCoWork={aiCoWork}
              geminiSpark={geminiSpark}
              onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 2: MOOD HISTORY (WITH ADVANCED SEARCH & FILTERING BAR) */}
        {activeView === 'history' && (
          <div className="animate-in fade-in duration-300">
            <MoodHistoryView
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
              onUpdateEntry={handleUpdateSingleEntry}
              onNavigateToWheel={() => setActiveView('wheel')}
              onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3: PREDICTIVE FORECAST SUITE */}
        {activeView === 'predictive' && (
          <div className="animate-in fade-in duration-300">
            <PatternInsightsView
              entries={entries}
              welltory={welltory}
              mindsara={mindsara}
              samsungHealth={samsungHealth}
              tasks={tasks}
              aiCoWork={aiCoWork}
              geminiSpark={geminiSpark}
              initialTab="predictive"
              onSelectPrompt={(promptText) => {
                setActiveJournalPrompt(promptText);
                setIsJournalModalOpen(true);
              }}
              onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 4: PATTERN INSIGHTS & SCATTER PLOT */}
        {activeView === 'patterns' && (
          <div className="animate-in fade-in duration-300">
            <PatternInsightsView
              entries={entries}
              welltory={welltory}
              mindsara={mindsara}
              samsungHealth={samsungHealth}
              tasks={tasks}
              aiCoWork={aiCoWork}
              geminiSpark={geminiSpark}
              initialTab="scatter"
              onSelectPrompt={(promptText) => {
                setActiveJournalPrompt(promptText);
                setIsJournalModalOpen(true);
              }}
              onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 4: HOLISTIC HEALTH & LIFE ACTIVITY MATRIX */}
        {activeView === 'holistic' && (
          <div className="animate-in fade-in duration-300">
            <HolisticHealthProjectsView
              entries={entries}
              welltory={welltory}
              mindsara={mindsara}
              samsungHealth={samsungHealth}
              tasks={tasks}
              aiCoWork={aiCoWork}
              geminiSpark={geminiSpark}
              onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
              onJournalWithPrompt={(promptText) => {
                setActiveJournalPrompt(promptText);
                setIsJournalModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Somatic Breathing Reset Widget */}
      <SomaticGroundingBar />

      {/* Journal Entry Writer Modal */}
      <JournalEditorModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        selectedEmotion={selectedEmotion}
        initialPrompt={activeJournalPrompt}
        onSaveEntry={handleSaveEntry}
        welltory={welltory}
        mindsara={mindsara}
        samsungHealth={samsungHealth}
        tasks={tasks}
      />

      {/* Holistic Integrations Modal */}
      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        welltory={welltory}
        onUpdateWelltory={handleUpdateWelltory}
        mindsara={mindsara}
        onUpdateMindsara={handleUpdateMindsara}
        samsungHealth={samsungHealth}
        onUpdateSamsungHealth={handleUpdateSamsungHealth}
        tasks={tasks}
        onUpdateTasks={handleUpdateTasks}
        aiCoWork={aiCoWork}
        onUpdateAiCoWork={handleUpdateAiCoWork}
        geminiSpark={geminiSpark}
        onUpdateGeminiSpark={handleUpdateGeminiSpark}
        onRestoreSampleData={handleRestoreSampleData}
        entries={entries}
        onUpdateEntries={handleUpdateEntries}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        <p>
          Feelings Wheel & AI Journal • Holistic Health, Project Activity & Somatic Wellness • Powered by Gemini 3.8 Flash
        </p>
      </footer>
    </div>
  );
}
