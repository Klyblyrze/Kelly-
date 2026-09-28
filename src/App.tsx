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
  SobrietyRecoveryContext,
  DailyIntention,
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
  loadStoredSobriety,
  saveStoredSobriety,
  loadStoredDailyIntention,
  saveStoredDailyIntention,
  SEED_MOOD_ENTRIES,
  INITIAL_WELLTORY_BIOMETRICS,
  INITIAL_MINDSARA_CONTEXT,
  INITIAL_SAMSUNG_HEALTH,
  INITIAL_TASK_PROJECTS,
  INITIAL_AI_COWORK,
  INITIAL_GEMINI_SPARK,
  INITIAL_SOBRIETY_RECOVERY,
} from './data/seedData';
import { Navbar, AppActiveView } from './components/Navbar';
import { DashboardHomeView } from './components/DashboardHomeView';
import { IntegrationsHubView } from './components/IntegrationsHubView';
import { JournalLandingView } from './components/JournalLandingView';
import { FeelingsWheel } from './components/FeelingsWheel';
import { PromptSuggestions } from './components/PromptSuggestions';
import { MoodHistoryView } from './components/MoodHistoryView';
import { PatternInsightsView } from './components/PatternInsightsView';
import { HolisticHealthProjectsView } from './components/HolisticHealthProjectsView';
import { WeeklySentimentCard } from './components/WeeklySentimentCard';
import { SobrietyTrackerCard } from './components/SobrietyTrackerCard';
import { SobrietyRecoveryView } from './components/SobrietyRecoveryView';
import { ActionSuggestionsSection } from './components/ActionSuggestionsSection';
import { PersonalAnalysisView } from './components/PersonalAnalysisView';
import { TriggerWarningModal } from './components/TriggerWarningModal';
import { JournalEditorModal } from './components/JournalEditorModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { IntegrationsModal } from './components/IntegrationsModal';
import { SomaticGroundingBar } from './components/SomaticGroundingBar';
import { ClinicalPdfReportModal } from './components/ClinicalPdfReportModal';
import { analyzeJournalSentimentAndTags } from './utils/sentimentTagger';
import { CheckCircle2, Sparkles, Heart } from 'lucide-react';

export default function App() {
  // State for all holistic streams & Sobriety Treatment overlay
  const [entries, setEntries] = useState<MoodEntry[]>(loadStoredEntries);
  const [welltory, setWelltory] = useState<WelltoryBiometrics>(loadStoredWelltory);
  const [mindsara, setMindsara] = useState<MindsaraContext>(loadStoredMindsara);
  const [samsungHealth, setSamsungHealth] = useState<SamsungHealthData>(loadStoredSamsungHealth);
  const [tasks, setTasks] = useState<TaskProjectData>(loadStoredTasks);
  const [aiCoWork, setAiCoWork] = useState<AiCoWorkData>(loadStoredAiCoWork);
  const [geminiSpark, setGeminiSpark] = useState<GeminiSparkData>(loadStoredGeminiSpark);
  const [sobriety, setSobriety] = useState<SobrietyRecoveryContext>(loadStoredSobriety);
  const [dailyIntention, setDailyIntention] = useState<DailyIntention>(loadStoredDailyIntention);

  // Tabular navigation active view: defaults to 'dashboard' (Executive Homepage with dual tracker)
  const [activeView, setActiveView] = useState<AppActiveView>('dashboard');
  const [analysisSubTab, setAnalysisSubTab] = useState<'trends' | 'history' | 'personal' | 'holistic'>('trends');

  // Trigger Warning Overlay & Somatic Grounding Force-Open State
  const [triggerWarningOpen, setTriggerWarningOpen] = useState(false);
  const [warningCravingLevel, setWarningCravingLevel] = useState(0);
  const [warningHaltTriggers, setWarningHaltTriggers] = useState<string[]>([]);
  const [forceGroundingOpen, setForceGroundingOpen] = useState(false);
  const [isGlobalPdfReportOpen, setIsGlobalPdfReportOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

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

  const handleUpdateDailyIntention = (updated: DailyIntention) => {
    setDailyIntention(updated);
    saveStoredDailyIntention(updated);
  };

  const handleToggleDailyIntentionComplete = () => {
    const updated: DailyIntention = {
      ...dailyIntention,
      completed: !dailyIntention.completed,
      completedAt: !dailyIntention.completed ? new Date().toISOString() : undefined,
    };
    handleUpdateDailyIntention(updated);
    showToast(updated.completed ? '🎉 Daily intention achieved today!' : 'Daily intention reset to pending.');
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

  const handleUpdateSobriety = (updated: SobrietyRecoveryContext) => {
    setSobriety(updated);
    saveStoredSobriety(updated);
    showToast('Sobriety progress updated!');
  };

  // Save new journal entry with physical and project snapshot
  const handleSaveEntry = async (entryData: Omit<MoodEntry, 'id'>) => {
    // Run automated sentiment tagging analysis if not already populated
    const sentimentResult =
      entryData.sentimentAnalysis ||
      analyzeJournalSentimentAndTags(
        entryData.journalText,
        entryData.primaryEmotion,
        entryData.secondaryEmotion,
        entryData.somaticSensations,
        entryData.intensity,
        entryData.tags
      );

    const newEntry: MoodEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      tags:
        entryData.tags && entryData.tags.length > 0 && entryData.sentimentAnalysis
          ? entryData.tags
          : (sentimentResult as any).allTags || entryData.tags,
      sentimentAnalysis: {
        valence: sentimentResult.valence,
        score: sentimentResult.score,
        emotionTags: sentimentResult.emotionTags,
        themeTags: sentimentResult.themeTags,
      },
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

    // High-risk addiction trigger & craving detection
    const cravingLvl = newEntry.recoverySnapshot?.cravingLevel ?? 0;
    const haltTrigs = newEntry.recoverySnapshot?.haltTriggers ?? [];
    const lowerText = newEntry.journalText.toLowerCase();
    const triggerWords = [
      'craving',
      'relapse',
      'drink',
      'alcohol',
      'urge',
      'trigger',
      'wine',
      'beer',
      'whiskey',
      'vodka',
      'bar',
      'cocktail',
    ];
    const hasTriggerWord = triggerWords.some((w) => lowerText.includes(w));

    if (cravingLvl >= 5 || (cravingLvl >= 3 && hasTriggerWord) || haltTrigs.length >= 2) {
      setWarningCravingLevel(cravingLvl || 5);
      setWarningHaltTriggers(
        haltTrigs.length > 0
          ? haltTrigs
          : hasTriggerWord
          ? ['Craving Trigger Mentioned in Journal', 'Evening Transition Vulnerability']
          : ['Elevated Stress Arousal']
      );
      setTriggerWarningOpen(true);
    } else {
      showToast('Journal entry logged to your mood timeline!');
    }
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
        onOpenClinicalReport={() => setIsGlobalPdfReportOpen(true)}
        welltory={welltory}
        mindsara={mindsara}
        samsungHealth={samsungHealth}
        tasks={tasks}
        sobriety={sobriety}
        totalEntriesCount={entries.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: EXECUTIVE DASHBOARD & DUAL-TRACKER (HOMEPAGE) */}
        {activeView === 'dashboard' && (
          <DashboardHomeView
            entries={entries}
            sobriety={sobriety}
            onUpdateSobriety={handleUpdateSobriety}
            welltory={welltory}
            samsungHealth={samsungHealth}
            tasks={tasks}
            mindsara={mindsara}
            onNavigateToView={(view) => setActiveView(view)}
            onOpenCheckIn={(prompt) => {
              setActiveJournalPrompt(prompt || '');
              setIsJournalModalOpen(true);
            }}
            onOpenUrgeSurfing={() => setForceGroundingOpen(true)}
            onOpenClinicalReport={() => setIsGlobalPdfReportOpen(true)}
            onOpenIntegrations={() => setActiveView('integrations')}
            dailyIntention={dailyIntention}
            onSetDailyIntention={handleUpdateDailyIntention}
            onToggleDailyIntentionComplete={handleToggleDailyIntentionComplete}
          />
        )}

        {/* TAB 2: JOURNALING & FEELINGS WHEEL (LANDING PAGE WITH INTEGRATED ANALYSIS & TOOLS) */}
        {(activeView === 'journal' || activeView === 'wheel') && (
          <JournalLandingView
            entries={entries}
            selectedEmotion={selectedEmotion}
            onSelectEmotion={handleSelectEmotion}
            prompts={prompts}
            isPromptsLoading={isPromptsLoading}
            onRefreshPrompts={(customNote) => {
              if (selectedEmotion) fetchPrompts(selectedEmotion, customNote);
            }}
            onSelectPromptForJournal={handleSelectPromptForJournal}
            onOpenNewJournalEntry={(prompt) => {
              setActiveJournalPrompt(prompt || '');
              setIsJournalModalOpen(true);
            }}
            onOpenCallMode={() => setIsCallModalOpen(true)}
            welltory={welltory}
            mindsara={mindsara}
            samsungHealth={samsungHealth}
            tasks={tasks}
            aiCoWork={aiCoWork}
            geminiSpark={geminiSpark}
            sobriety={sobriety}
            dailyIntention={dailyIntention}
            onToggleDailyIntentionComplete={handleToggleDailyIntentionComplete}
            onOpenIntegrations={() => setActiveView('integrations')}
          />
        )}

        {/* TAB 3: SOBRIETY & ADDICTION TREATMENT HUB */}
        {(activeView === 'sobriety' || activeView === 'recovery') && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Quick Gauge */}
            <SobrietyTrackerCard
              sobriety={sobriety}
              onUpdateSobriety={handleUpdateSobriety}
              onOpenRecoveryHub={() => {}}
              onOpenUrgeSurfing={() => setForceGroundingOpen(true)}
            />

            <SobrietyRecoveryView
              sobriety={sobriety}
              onUpdateSobriety={handleUpdateSobriety}
              entries={entries}
              welltory={welltory}
              samsungHealth={samsungHealth}
              tasks={tasks}
              onOpenJournalWithPrompt={(promptText) => {
                setActiveJournalPrompt(promptText);
                setIsJournalModalOpen(true);
              }}
              onOpenIntegrations={() => setActiveView('integrations')}
            />
          </div>
        )}

        {/* TAB 4: DATA TRENDS & ANALYSIS */}
        {(activeView === 'analysis' || activeView === 'patterns' || activeView === 'history' || activeView === 'holistic') && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Analysis Workspace Sub-Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Analysis Workspace
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-300">
                  Longitudinal correlations & clinical records
                </span>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setAnalysisSubTab('trends')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    analysisSubTab === 'trends'
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📊 Biometrics & Heatmaps
                </button>
                <button
                  onClick={() => setAnalysisSubTab('history')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    analysisSubTab === 'history'
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📖 Mood History Feed ({entries.length})
                </button>
                <button
                  onClick={() => setAnalysisSubTab('personal')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    analysisSubTab === 'personal'
                      ? 'bg-purple-950 text-purple-200 font-semibold shadow-xs border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🧬 Personal Traits & Growth
                </button>
                <button
                  onClick={() => setAnalysisSubTab('holistic')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    analysisSubTab === 'holistic'
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌐 Sensor Matrix
                </button>
              </div>
            </div>

            {/* Sub-view A: Scatter, Correlations & Heatmaps */}
            {analysisSubTab === 'trends' && (
              <PatternInsightsView
                entries={entries}
                welltory={welltory}
                mindsara={mindsara}
                samsungHealth={samsungHealth}
                tasks={tasks}
                aiCoWork={aiCoWork}
                geminiSpark={geminiSpark}
                sobriety={sobriety}
                initialTab="scatter"
                onSelectPrompt={(promptText) => {
                  setActiveJournalPrompt(promptText);
                  setIsJournalModalOpen(true);
                }}
                onOpenIntegrations={() => setActiveView('integrations')}
              />
            )}

            {/* Sub-view B: Mood History Feed with Automated Sentiment Tags & Context Actions */}
            {analysisSubTab === 'history' && (
              <div className="space-y-8">
                <ActionSuggestionsSection
                  entries={entries}
                  welltory={welltory}
                  samsungHealth={samsungHealth}
                  tasks={tasks}
                  sobriety={sobriety}
                  mindsara={mindsara}
                  onSelectPrompt={(promptText) => {
                    setActiveJournalPrompt(promptText);
                    setIsJournalModalOpen(true);
                  }}
                  onOpenUrgeSurfing={() => setForceGroundingOpen(true)}
                />
                <MoodHistoryView
                  entries={entries}
                  onDeleteEntry={handleDeleteEntry}
                  onUpdateEntry={handleUpdateSingleEntry}
                  onNavigateToWheel={() => setActiveView('journal')}
                  onOpenIntegrations={() => setActiveView('integrations')}
                  welltory={welltory}
                  sobriety={sobriety}
                />
              </div>
            )}

            {/* Sub-view C: Personal Analysis & Personality Growth */}
            {analysisSubTab === 'personal' && (
              <PersonalAnalysisView
                entries={entries}
                welltory={welltory}
                samsungHealth={samsungHealth}
                tasks={tasks}
                sobriety={sobriety}
                onSelectPrompt={(promptText) => {
                  setActiveJournalPrompt(promptText);
                  setIsJournalModalOpen(true);
                }}
                onOpenIntegrations={() => setActiveView('integrations')}
              />
            )}

            {/* Sub-view D: Holistic Sensor Matrix */}
            {analysisSubTab === 'holistic' && (
              <HolisticHealthProjectsView
                entries={entries}
                welltory={welltory}
                mindsara={mindsara}
                samsungHealth={samsungHealth}
                tasks={tasks}
                aiCoWork={aiCoWork}
                geminiSpark={geminiSpark}
                onOpenIntegrations={() => setActiveView('integrations')}
                onJournalWithPrompt={(promptText) => {
                  setActiveJournalPrompt(promptText);
                  setIsJournalModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 5: PERSONAL ANALYSIS (DEDICATED PRIMARY VIEW) */}
        {activeView === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PersonalAnalysisView
              entries={entries}
              welltory={welltory}
              samsungHealth={samsungHealth}
              tasks={tasks}
              sobriety={sobriety}
              onSelectPrompt={(promptText) => {
                setActiveJournalPrompt(promptText);
                setIsJournalModalOpen(true);
              }}
              onOpenIntegrations={() => setActiveView('integrations')}
            />
          </div>
        )}

        {/* TAB 5: FORECAST & FORWARD LOOKING */}
        {(activeView === 'forecast' || activeView === 'predictive') && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PatternInsightsView
              entries={entries}
              welltory={welltory}
              mindsara={mindsara}
              samsungHealth={samsungHealth}
              tasks={tasks}
              aiCoWork={aiCoWork}
              geminiSpark={geminiSpark}
              sobriety={sobriety}
              initialTab="predictive"
              onSelectPrompt={(promptText) => {
                setActiveJournalPrompt(promptText);
                setIsJournalModalOpen(true);
              }}
              onOpenIntegrations={() => setActiveView('integrations')}
            />
          </div>
        )}

        {/* TAB 6: INTEGRATIONS & SYNC HUB */}
        {activeView === 'integrations' && (
          <IntegrationsHubView
            welltory={welltory}
            onUpdateWelltory={handleUpdateWelltory}
            samsungHealth={samsungHealth}
            onUpdateSamsungHealth={handleUpdateSamsungHealth}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            mindsara={mindsara}
            onUpdateMindsara={handleUpdateMindsara}
          />
        )}
      </main>

      {/* Somatic Breathing Reset Widget */}
      <SomaticGroundingBar
        forceOpen={forceGroundingOpen}
        initialMode="urge_surf"
        onCloseBar={() => setForceGroundingOpen(false)}
      />

      {/* Clinical Craving & Trigger Warning Overlay */}
      <TriggerWarningModal
        isOpen={triggerWarningOpen}
        cravingLevel={warningCravingLevel}
        haltTriggers={warningHaltTriggers}
        onLaunchUrgeSurf={() => {
          setForceGroundingOpen(true);
          setTriggerWarningOpen(false);
        }}
        onDismiss={() => setTriggerWarningOpen(false)}
        onOpenRecoveryHub={() => {
          setActiveView('recovery');
          setTriggerWarningOpen(false);
        }}
      />

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
        sobriety={sobriety}
        onOpenCallMode={() => {
          setIsJournalModalOpen(false);
          setIsCallModalOpen(true);
        }}
      />

      {/* Voice Call Mode Modal (Interactive Voice Journaling & AI Companion) */}
      <VoiceCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        selectedEmotion={selectedEmotion}
        onFinalizeEntry={async (entryData) => {
          await handleSaveEntry(entryData);
          setIsCallModalOpen(false);
          showToast('Voice journal reflection transcribed & saved!');
        }}
      />

      {/* Clinical PDF Report Modal */}
      <ClinicalPdfReportModal
        isOpen={isGlobalPdfReportOpen}
        onClose={() => setIsGlobalPdfReportOpen(false)}
        entries={entries}
        welltory={welltory}
        sobriety={sobriety}
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
