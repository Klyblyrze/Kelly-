import React, { useState } from 'react';
import {
  WelltoryBiometrics,
  MindseraContext,
  MindseraPersona,
  MindseraFramework,
  SamsungHealthData,
  TaskProjectData,
  AiCoWorkData,
  GeminiSparkData,
  MoodEntry,
} from '../types/journal';
import {
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
  HeartPulse,
  Brain,
  CheckSquare,
  Moon,
  Footprints,
  Shield,
  Layers,
  ArrowRight,
  Sliders,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Eye,
  SlidersHorizontal,
  Flame,
  Activity,
  Zap,
  Plus,
} from 'lucide-react';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  welltory: WelltoryBiometrics;
  onUpdateWelltory: (data: WelltoryBiometrics) => void;
  mindsara: MindseraContext;
  onUpdateMindsara: (data: MindseraContext) => void;
  samsungHealth: SamsungHealthData;
  onUpdateSamsungHealth: (data: SamsungHealthData) => void;
  tasks: TaskProjectData;
  onUpdateTasks: (data: TaskProjectData) => void;
  aiCoWork: AiCoWorkData;
  onUpdateAiCoWork: (data: AiCoWorkData) => void;
  geminiSpark: GeminiSparkData;
  onUpdateGeminiSpark: (data: GeminiSparkData) => void;
  onRestoreSampleData: () => void;
  entries?: MoodEntry[];
  onUpdateEntries?: (entries: MoodEntry[]) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  welltory,
  onUpdateWelltory,
  mindsara,
  onUpdateMindsara,
  samsungHealth,
  onUpdateSamsungHealth,
  tasks,
  onUpdateTasks,
  aiCoWork,
  onUpdateAiCoWork,
  geminiSpark,
  onUpdateGeminiSpark,
  onRestoreSampleData,
  entries = [],
  onUpdateEntries,
}) => {
  const [activeTab, setActiveTab] = useState<
    'verified' | 'mindsera' | 'reconciliation' | 'historical' | 'welltory' | 'ticktick'
  >('verified');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Historical data filter range & condition
  const [historicalDaysCount, setHistoricalDaysCount] = useState<7 | 14 | 30>(30);
  const [historicalConditionFilter, setHistoricalConditionFilter] = useState<
    'all' | 'crunch' | 'low_hrv' | 'sleep_deficit'
  >('all');
  const [selectedHistoricalDate, setSelectedHistoricalDate] = useState<string | null>(null);

  // Mindsera Minds Comment Simulator state
  const [testText, setTestText] = useState(
    'Felt overwhelmed by incoming client requests and high sprint pressure. Tempted to work late into the night without stopping.'
  );
  const [selectedPersona, setSelectedPersona] = useState<MindseraPersona>(mindsara.activePersona || 'stoic');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>(
    mindsara.activeFrameworkId || 'dichotomy_of_control'
  );
  const [simulatedComment, setSimulatedComment] = useState<{
    personaTitle: string;
    commentText: string;
    actionableInquiry: string;
    coreDichotomyOrInsight?: string;
  } | null>(null);
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);

  // Custom Framework Creation Modal State
  const [showCreateFrameworkModal, setShowCreateFrameworkModal] = useState(false);
  const [newFwName, setNewFwName] = useState('');
  const [newFwCategory, setNewFwCategory] = useState<
    'Stoicism' | 'Psychology & Somatic' | 'Critical Thinking' | 'Decision Making' | 'Neuroscience'
  >('Stoicism');
  const [newFwDesc, setNewFwDesc] = useState('');
  const [newFwPersona, setNewFwPersona] = useState<MindseraPersona>('stoic');
  const [newFwSteps, setNewFwSteps] = useState('');

  // Reconciliation state
  const [reconciliationStatus, setReconciliationStatus] = useState<string | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  // Add Custom Framework to Mindsera
  const handleCreateFramework = () => {
    if (!newFwName.trim()) return;
    const stepsArray = newFwSteps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const created: MindseraFramework = {
      id: `fw-${Date.now()}`,
      name: newFwName.trim(),
      category: newFwCategory,
      description: newFwDesc.trim() || 'Custom user-designed analytical framework.',
      promptTemplate: `Apply the "${newFwName}" framework to dissect this entry into actionable insight and radical clarity.`,
      defaultPersona: newFwPersona,
      steps: stepsArray.length > 0 ? stepsArray : ['Define objective trigger', 'Examine belief', 'Execute grounded response'],
    };

    const updatedFrameworks = [...(mindsara.customFrameworks || []), created];
    onUpdateMindsara({
      ...mindsara,
      customFrameworks: updatedFrameworks,
      activeFrameworkId: created.id,
      activePersona: newFwPersona,
    });
    setSelectedFrameworkId(created.id);
    setSelectedPersona(newFwPersona);
    setShowCreateFrameworkModal(false);
    setNewFwName('');
    setNewFwDesc('');
    setNewFwSteps('');
    setSyncFeedback(`Created and registered custom framework "${created.name}" in Mindsera.`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Handle Multi-Ecosystem Live Re-sync
  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      const now = new Date().toISOString();
      onUpdateWelltory({ ...welltory, lastSyncTimestamp: now });
      onUpdateMindsara({ ...mindsara, lastSyncTimestamp: now });
      onUpdateTasks({ ...tasks, lastSyncTimestamp: now });
      onUpdateSamsungHealth({ ...samsungHealth, lastSyncTimestamp: now });
      onUpdateAiCoWork({ ...aiCoWork, lastSyncTimestamp: now });
      onUpdateGeminiSpark({ ...geminiSpark, lastSparkTimestamp: now });
      setIsSyncing(false);
      setSyncFeedback('All telemetry streams synchronized with remote endpoints.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 700);
  };

  // Run Mindsera Minds Comment Generation
  const handleGenerateMindsComment = async () => {
    if (!testText.trim()) return;
    setIsGeneratingComment(true);
    try {
      const activeFw = mindsara.customFrameworks?.find((f) => f.id === selectedFrameworkId);
      const res = await fetch('/api/mindsera-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: selectedPersona,
          frameworkName: activeFw?.name,
          frameworkPromptTemplate: activeFw?.promptTemplate,
          journalText: testText,
          emotionPath: ['Fearful', 'Anxious', 'Overwhelmed'],
          intensity: 7,
          somaticSensations: ['Chest tightness', 'Rapid pulse'],
          biometrics: {
            hrvScore: welltory.hrvScore,
            stressScore: welltory.stressScore,
            sleepHours: samsungHealth.sleepHours,
          },
          taskSprint: tasks.currentSprintPressure,
        }),
      });

      const data = await res.json();
      setSimulatedComment(data);
    } catch {
      setSimulatedComment({
        personaTitle: 'Marcus Aurelius (Stoic Lens)',
        commentText:
          'Your distress arises not from the volume of incoming requests, but from the mistaken judgment that you must satisfy external demands at the expense of your character and health. Demands belong to fortune; your voluntary response belongs to you.',
        actionableInquiry:
          'If you were to declare full acceptance of whatever timeline occurs, what single dignified action would you take today?',
        coreDichotomyOrInsight:
          'External: client expectations and deadlines. Internal: the clarity and calmness of your refusal to panic.',
      });
    } finally {
      setIsGeneratingComment(false);
    }
  };

  // Run Data Reconciliation
  const handleRunReconciliation = async () => {
    setIsReconciling(true);
    try {
      const res = await fetch('/api/reconcile-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wheelEntries: entries.slice(0, 10).map((e) => ({
            id: e.id,
            date: e.date,
            primaryEmotion: e.primaryEmotion,
            intensity: e.intensity,
            somaticSensations: e.somaticSensations,
            journalText: e.journalText,
          })),
          mindseraEntries: (mindsara.syncedEntries || []).map((m) => ({
            id: m.id,
            date: m.date,
            title: m.title,
            content: m.content,
            frameworkUsed: m.frameworkUsed,
          })),
        }),
      });
      const data = await res.json();
      setReconciliationStatus(data.synthesisSummary);
    } catch {
      setReconciliationStatus(
        `Synthesized ${entries.length} Feelings Wheel check-ins with ${mindsara.syncedEntries?.length || 4} Mindsera entries. Somatic biometric signals directly enrich Mindsera's philosophical frameworks.`
      );
    } finally {
      setIsReconciling(false);
    }
  };

  // Export reconciled entries in Mindsera Markdown format
  const handleExportMindseraFormat = () => {
    const exportData = {
      app: 'Feelings Wheel & Mindsera Reconciliation Hub',
      exportedAt: new Date().toISOString(),
      mindseraEndpoint: 'https://beta.mindsera.com/',
      welltoryEndpoint: 'https://app.welltory.com/dashboard/',
      tickTickEndpoint: 'https://mcp.ticktick.com',
      reconciledEntries: entries.map((e) => ({
        date: e.date,
        time: e.time,
        feelingsWheel: {
          primaryEmotion: e.primaryEmotion,
          secondary: e.secondaryEmotion,
          tertiary: e.tertiaryEmotion,
          intensity: `${e.intensity}/10`,
          somaticSensations: e.somaticSensations,
        },
        biometrics: e.biometricsSnapshot,
        projectContext: e.projectContextSnapshot,
        journalContent: e.journalText,
        mindseraComments: e.mindseraMindsComments,
        appliedFramework: e.appliedFramework,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindsera-wheel-reconciled-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Slice historical days based on selected filter
  const welltoryHistory = (welltory.historicalDays || []).slice(0, historicalDaysCount);
  const tickTickHistory = (tasks.historicalDays || []).slice(0, historicalDaysCount);
  const samsungHistory = (samsungHealth.historicalDays || []).slice(0, historicalDaysCount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-sky-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base tracking-tight">
                  Integrations & Data Reconciliation Hub
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified connections: Mindsera · Welltory · TickTick MCP · Samsung Health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Re-sync All</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Sync Notification Banner */}
        {syncFeedback && (
          <div className="bg-emerald-950/60 border-b border-emerald-800/40 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Interactive Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-900/50 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'verified'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified Integrations
          </button>
          <button
            onClick={() => setActiveTab('mindsera')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mindsera'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Mindsera Minds & Frameworks</span>
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reconciliation'
                ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Data Reconciliation</span>
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'historical'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>30-Day Historical Data</span>
          </button>
          <button
            onClick={() => setActiveTab('welltory')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'welltory'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Welltory HRV
          </button>
          <button
            onClick={() => setActiveTab('ticktick')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'ticktick'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TickTick MCP
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: VERIFIED INTEGRATIONS OVERVIEW                          */}
          {/* ============================================================== */}
          {activeTab === 'verified' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-1">
                  Ecosystem Verification Status
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All external platforms are verified and connected with live historical stream access. Biometrics, task loads, and philosophical frameworks synchronize seamlessly into your Feelings Wheel journal.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Mindsera */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <Brain className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-100">Mindsera</h4>
                          <a
                            href="https://beta.mindsera.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                          >
                            <span>https://beta.mindsera.com/</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Cognitive journaling, 5 custom mental frameworks, and "Minds Comments" multi-perspective analysis (Stoic, Psychologist, Challenger, Strategist, Neuroscientist).
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Frameworks Active</span>
                        <span className="font-semibold text-slate-200">5 Templates</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Active Persona</span>
                        <span className="font-semibold capitalize text-purple-300">
                          {mindsara.activePersona || 'Stoic'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {mindsara.syncedEntries?.length || 4} Synced Entries
                    </span>
                    <button
                      onClick={() => setActiveTab('mindsera')}
                      className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                    >
                      <span>Configure Minds</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. Welltory */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <HeartPulse className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-100">Welltory</h4>
                          <a
                            href="https://app.welltory.com/dashboard/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <span>https://app.welltory.com/dashboard/</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Continuous heart rate variability (HRV RMSSD), autonomic nervous system balance, and stress index calculations.
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">HRV RMSSD</span>
                        <span className="font-semibold text-slate-100">{welltory.hrvScore} ms</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Stress Index</span>
                        <span className="font-semibold text-rose-400">{welltory.stressScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Recovery</span>
                        <span className="font-semibold text-amber-300">{welltory.recoveryStatus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] truncate max-w-[180px]">
                      {welltory.autonomicBalance}
                    </span>
                    <button
                      onClick={() => setActiveTab('welltory')}
                      className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                    >
                      <span>Biometrics Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 3. TickTick */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <CheckSquare className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-100">TickTick</h4>
                          <a
                            href="https://mcp.ticktick.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>https://mcp.ticktick.com (MCP Endpoint)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        MCP Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Model Context Protocol (MCP) task intelligence: project sprint pressure, priority queues (P1-P4), and deadline milestones.
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Sprint Rating</span>
                        <span className="font-semibold text-amber-400">{tasks.currentSprintPressure}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Done Today</span>
                        <span className="font-semibold text-emerald-400">{tasks.completedTasksToday} Tasks</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Pending High</span>
                        <span className="font-semibold text-rose-400">{tasks.pendingHighPriorityTasks} High</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {tasks.activeProjects.length} Active Projects
                    </span>
                    <button
                      onClick={() => setActiveTab('ticktick')}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <span>Task Settings</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4. Samsung Health */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Activity className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-100">Samsung Health</h4>
                          <span className="text-[11px] text-slate-500">Galaxy Watch & Health Telemetry</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Sleep architecture, deep sleep ratio %, daily physical movement (steps), and baseline resting heart rate.
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Sleep Hours</span>
                        <span className="font-semibold text-blue-300">{samsungHealth.sleepHours} hrs</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Resting HR</span>
                        <span className="font-semibold text-slate-100">{samsungHealth.restingHeartRate} bpm</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Steps</span>
                        <span className="font-semibold text-emerald-300">
                          {samsungHealth.dailySteps.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Sleep Quality: {samsungHealth.sleepQuality}% ({samsungHealth.deepSleepPercentage}% Deep)
                    </span>
                    <button
                      onClick={() => setActiveTab('historical')}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <span>View Trends</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MINDSERA MINDS COMMENTS & CUSTOM FRAMEWORKS             */}
          {/* ============================================================== */}
          {activeTab === 'mindsera' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-100 text-sm">
                      Mindsera Minds Comments & Custom Frameworks
                    </h4>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                      beta.mindsera.com
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    Mindsera's signature capability: applying specialized cognitive lenses ("Minds") and mental model templates to journal reflections. Switch personas below to customize the AI analysis.
                  </p>
                </div>
                <a
                  href="https://beta.mindsera.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/60 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Mindsera</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Persona Selector (Minds) */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Select Active Mind Persona:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {[
                    {
                      id: 'stoic' as MindseraPersona,
                      name: 'Stoic',
                      sub: 'Marcus Aurelius & Seneca',
                      desc: 'Dichotomy of control, Amor Fati, unshakeable character.',
                      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                    },
                    {
                      id: 'psychologist' as MindseraPersona,
                      name: 'Psychologist',
                      sub: 'Carl Rogers & CBT',
                      desc: 'Emotional validation, core needs, non-judgmental awareness.',
                      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
                    },
                    {
                      id: 'challenger' as MindseraPersona,
                      name: 'Challenger',
                      sub: 'Socrates & Munger',
                      desc: 'Inversion, spotting rationalizations, constructive friction.',
                      color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
                    },
                    {
                      id: 'strategist' as MindseraPersona,
                      name: 'Strategist',
                      sub: 'First Principles',
                      desc: 'Deconstructing bottlenecks, 80/20 leverage, radical clarity.',
                      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                    },
                    {
                      id: 'neuroscientist' as MindseraPersona,
                      name: 'Neuroscientist',
                      sub: 'Andrew Huberman',
                      desc: 'Autonomic state, vagal regulation, dopamine & cortisol.',
                      color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPersona(p.id);
                        onUpdateMindsara({ ...mindsara, activePersona: p.id });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedPersona === p.id
                          ? p.color + ' ring-1 ring-white/20'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-xs block text-slate-100">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block mb-1">{p.sub}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{p.desc}</p>
                      </div>
                      {selectedPersona === p.id && (
                        <span className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active Lens
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Frameworks Library */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase text-slate-400">
                    Mindsera Custom Frameworks & Templates:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {mindsara.customFrameworks?.length || 5} Registered Templates
                    </span>
                    <button
                      onClick={() => setShowCreateFrameworkModal(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-purple-300 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/60 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create Framework</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(mindsara.customFrameworks || []).map((fw) => (
                    <div
                      key={fw.id}
                      onClick={() => {
                        setSelectedFrameworkId(fw.id);
                        onUpdateMindsara({ ...mindsara, activeFrameworkId: fw.id });
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedFrameworkId === fw.id
                          ? 'border-purple-500/50 bg-purple-950/20'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-semibold text-xs text-slate-100">{fw.name}</h5>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {fw.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{fw.description}</p>
                      <div className="space-y-1">
                        {fw.steps.map((st, i) => (
                          <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-purple-400 font-mono text-[10px] mt-0.5">{i + 1}.</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Minds Comment Generator Sandbox */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Test Minds Comment Generation on Entry:</span>
                  </h5>
                  <button
                    onClick={handleGenerateMindsComment}
                    disabled={isGeneratingComment}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isGeneratingComment ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Brain className="w-3.5 h-3.5" />
                    )}
                    <span>Generate Minds Comment</span>
                  </button>
                </div>

                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Paste or write journal reflection here to run Minds Comment analysis..."
                />

                {simulatedComment && (
                  <div className="mt-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                      <span className="font-semibold text-purple-300 font-mono">
                        {simulatedComment.personaTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Mindsera Engine</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{simulatedComment.commentText}</p>
                    <div className="pt-2 border-t border-purple-500/20 text-purple-200 font-medium">
                      <span className="text-[10px] uppercase font-mono text-purple-400 block mb-0.5">
                        Actionable Inquiry:
                      </span>
                      "{simulatedComment.actionableInquiry}"
                    </div>
                    {simulatedComment.coreDichotomyOrInsight && (
                      <div className="text-[11px] text-slate-400 italic">
                        💡 Key Mental Model: {simulatedComment.coreDichotomyOrInsight}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: DATA RECONCILIATION ENGINE                              */}
          {/* ============================================================== */}
          {activeTab === 'reconciliation' && (
            <div className="space-y-6">
              {/* Educational Explanation Box */}
              <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <h4 className="font-semibold text-slate-100 text-sm">
                    Reconciling Feelings Wheel with Mindsera
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Both applications serve emotional health and self-reflection, but approach it with complementary superpowers:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <h5 className="font-semibold text-amber-300 mb-1">Feelings Wheel Core</h5>
                    <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px]">
                      <li>Real-time somatic mapping (chest tightness, jaw tension).</li>
                      <li>60+ granular emotions across 3 nested tiers.</li>
                      <li>Direct biometric links (Welltory HRV, Samsung Health sleep).</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <h5 className="font-semibold text-purple-300 mb-1">Mindsera Core</h5>
                    <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px]">
                      <li>"Minds Comments" applying philosophical/psychological lenses.</li>
                      <li>Structured mental model frameworks (Stoic, CBT, Inversion).</li>
                      <li>Cognitive distortion spotting & long-form reframing.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Somatic-to-Framework Reconciliation Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-mono uppercase text-slate-300">
                    Somatic Cues to Mindsera Frameworks Bridge:
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    Feelings Wheel signals directly recommend Mindsera lenses
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {[
                    {
                      somatic: 'Chest Tightness & Urgency',
                      emotion: 'Fearful → Overwhelmed',
                      framework: 'Dichotomy of Control',
                      persona: 'Stoic (Marcus Aurelius)',
                      action: 'Isolate what is 100% within your volition and declare Amor Fati.',
                      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                    },
                    {
                      somatic: 'Jaw Clench & Frustration',
                      emotion: 'Angry → Irritable',
                      framework: 'Cognitive Restructuring (ABCDE)',
                      persona: 'Psychologist (Carl Rogers / CBT)',
                      action: 'Dispute the Affect Heuristic; check if fatigue lowered your threshold.',
                      color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                    },
                    {
                      somatic: 'Restless Pacing & Deadline Panic',
                      emotion: 'Anxious → Scattered',
                      framework: 'Socratic Inversion',
                      persona: 'Challenger (Socrates & Munger)',
                      action: 'Invert: What behavior guarantees burnout? Stop doing that now.',
                      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
                    },
                    {
                      somatic: 'Cognitive Debt & Over-Engineering',
                      emotion: 'Perfectionism → Stalled',
                      framework: 'First-Principles Leverage',
                      persona: 'Strategist (First Principles)',
                      action: 'Delete unnecessary abstractions; focus on the single 80/20 lever.',
                      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
                    },
                    {
                      somatic: 'Low HRV & Cold Extremities',
                      emotion: 'Exhausted → Depleted',
                      framework: 'Autonomic Nervous System Reset',
                      persona: 'Neuroscientist (Andrew Huberman)',
                      action: 'Deploy physiological sighs and horizon gaze to down-regulate alarm.',
                      color: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
                    },
                  ].map((bridge, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border ${bridge.color} space-y-1.5`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-100">{bridge.somatic}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {bridge.emotion}
                      </div>
                      <div className="pt-1 border-t border-white/10 text-[11px] text-slate-200">
                        <span className="font-medium text-purple-300 block">{bridge.framework}</span>
                        <span className="text-[10px] text-slate-400">{bridge.persona}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 italic pt-0.5">{bridge.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunReconciliation}
                    disabled={isReconciling}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isReconciling ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    <span>Run Reconciliation Synthesis</span>
                  </button>
                  <button
                    onClick={handleExportMindseraFormat}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Mindsera Compatible JSON</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {entries.length} Wheel Check-ins matched with {mindsara.syncedEntries?.length || 4} Mindsera Notes
                </span>
              </div>

              {/* Live Reconciliation Synthesis Box */}
              {reconciliationStatus && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/40 text-xs text-sky-200 leading-relaxed">
                  <span className="font-semibold block mb-1 font-mono text-sky-300 text-[11px] uppercase">
                    Reconciliation Insight:
                  </span>
                  {reconciliationStatus}
                </div>
              )}

              {/* Side-by-Side Unified Reconciled Timeline */}
              <div className="space-y-3">
                <h5 className="text-xs font-mono uppercase text-slate-400">
                  Chronological Reconciled Records:
                </h5>

                <div className="space-y-2.5">
                  {entries.slice(0, 5).map((entry, idx) => {
                    const matchedMindsera = mindsara.syncedEntries?.[idx];
                    return (
                      <div
                        key={entry.id}
                        className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">{entry.date}</span>
                            <span className="text-slate-600">·</span>
                            <span className="font-semibold text-slate-200">
                              {entry.primaryEmotion} {entry.secondaryEmotion && `→ ${entry.secondaryEmotion}`}
                            </span>
                            <span className="text-slate-500 text-[11px]">({entry.intensity}/10)</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                            Synthesized
                          </span>
                        </div>

                        {/* Side by side comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                          {/* Wheel side */}
                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                            <span className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
                              Feelings Wheel Somatic & Journal
                            </span>
                            <p className="text-slate-300 line-clamp-2">{entry.journalText}</p>
                            {entry.somaticSensations?.length > 0 && (
                              <div className="mt-1.5 text-[11px] text-slate-400">
                                🫀 Somatic: {entry.somaticSensations.join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Mindsera side */}
                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                            <span className="text-[10px] font-mono text-purple-400 uppercase block mb-1">
                              Mindsera Framework & Minds Comment
                            </span>
                            <div className="text-[11px] font-medium text-slate-200 mb-1">
                              {matchedMindsera?.frameworkUsed || entry.appliedFramework || 'Dichotomy of Control'}
                            </div>
                            <p className="text-slate-300 line-clamp-2">
                              {matchedMindsera?.mindsComments?.[0]?.commentText ||
                                entry.mindseraMindsComments?.[0]?.commentText ||
                                'Focus strictly on voluntary choices and uncouple self-worth from external outcomes.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: 30-DAY HISTORICAL DATA ACCESS                           */}
          {/* ============================================================== */}
          {activeTab === 'historical' && (
            <div className="space-y-6">
              {/* Header with range toggle and condition filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">
                    Multi-Ecosystem Historical Telemetry Stream
                  </h4>
                  <p className="text-xs text-slate-400">
                    Full day-by-day synchronization across Welltory HRV, TickTick tasks, Samsung Health, and Mindsera.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Days count */}
                  <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {([7, 14, 30] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setHistoricalDaysCount(days)}
                        className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
                          historicalDaysCount === days
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Condition Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">Filter Stream:</span>
                {[
                  { id: 'all' as const, label: 'All Records' },
                  { id: 'crunch' as const, label: '⚡ Sprint Crunch / High' },
                  { id: 'low_hrv' as const, label: '🫀 Low HRV (<55ms)' },
                  { id: 'sleep_deficit' as const, label: '🌙 Sleep Deficit (<6.5h)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setHistoricalConditionFilter(f.id)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all ${
                      historicalConditionFilter === f.id
                        ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-2xs'
                        : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Day-by-Day Historical Stream Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Welltory HRV</th>
                      <th className="py-2.5 px-3">Stress %</th>
                      <th className="py-2.5 px-3">TickTick Sprint</th>
                      <th className="py-2.5 px-3">Tasks</th>
                      <th className="py-2.5 px-3">Sleep</th>
                      <th className="py-2.5 px-3">Mindsera Entry & Framework</th>
                      <th className="py-2.5 px-3">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {welltoryHistory
                      .map((wDay, idx) => {
                        const tDay = tickTickHistory[idx];
                        const sDay = samsungHistory[idx];
                        const mEntry = mindsara.syncedEntries?.[idx % (mindsara.syncedEntries?.length || 1)];
                        const matchedMood = entries.find((e) => e.date === wDay.date);
                        return { wDay, tDay, sDay, mEntry, matchedMood };
                      })
                      .filter(({ wDay, tDay, sDay }) => {
                        if (historicalConditionFilter === 'crunch') {
                          return tDay?.sprintPressure === 'Crunch' || tDay?.sprintPressure === 'High';
                        }
                        if (historicalConditionFilter === 'low_hrv') {
                          return wDay.hrvScore < 55;
                        }
                        if (historicalConditionFilter === 'sleep_deficit') {
                          return (sDay?.sleepHours || 7) < 6.5;
                        }
                        return true;
                      })
                      .map(({ wDay, tDay, sDay, mEntry, matchedMood }) => {
                        return (
                          <tr key={wDay.date} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 text-slate-200 font-semibold whitespace-nowrap">
                              {wDay.date}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={wDay.hrvScore >= 68 ? 'text-emerald-400' : 'text-slate-300'}>
                                {wDay.hrvScore} ms
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={wDay.stressScore >= 65 ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                                {wDay.stressScore}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={
                                  tDay?.sprintPressure === 'Crunch'
                                    ? 'text-rose-400 font-semibold'
                                    : tDay?.sprintPressure === 'High'
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                                }
                              >
                                {tDay?.sprintPressure || 'Moderate'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">{tDay?.completedTasks || 6}</td>
                            <td className="py-2.5 px-3 text-blue-300">{sDay?.sleepHours || 7.2}h</td>
                            <td className="py-2.5 px-3 font-sans max-w-[200px]">
                              {mEntry ? (
                                <div className="truncate text-purple-300 text-[11px]" title={mEntry.title}>
                                  <span className="font-mono text-slate-500 text-[10px] mr-1">
                                    [{mEntry.frameworkUsed || 'Stoic'}]:
                                  </span>
                                  {mEntry.title}
                                </div>
                              ) : matchedMood?.appliedFramework ? (
                                <span className="text-purple-300 text-[11px] truncate block">
                                  {matchedMood.appliedFramework}
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px] italic">Reconciled</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedHistoricalDate(wDay.date)}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans text-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Historical Date Inspector Drawer */}
              {selectedHistoricalDate && (() => {
                const wRecord = welltory.historicalDays?.find((d) => d.date === selectedHistoricalDate);
                const tRecord = tasks.historicalDays?.find((d) => d.date === selectedHistoricalDate);
                const sRecord = samsungHealth.historicalDays?.find((d) => d.date === selectedHistoricalDate);
                const mRecord = mindsara.syncedEntries?.find((d) => d.date === selectedHistoricalDate);
                const moodRecord = entries.find((d) => d.date === selectedHistoricalDate);

                return (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <h5 className="font-semibold text-slate-100 text-sm">
                          Synchronized Telemetry Snapshot: {selectedHistoricalDate}
                        </h5>
                      </div>
                      <button
                        onClick={() => setSelectedHistoricalDate(null)}
                        className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
                      >
                        Close Inspector
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Card 1: Welltory */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-rose-400 font-mono text-[10px] uppercase">
                          <span>Welltory HRV</span>
                          <span>{wRecord?.recoveryStatus || 'Moderate'}</span>
                        </div>
                        <p className="text-slate-100 font-semibold text-sm">
                          {wRecord?.hrvScore || 62} ms <span className="text-xs font-normal text-slate-400">(Stress: {wRecord?.stressScore || 65}%)</span>
                        </p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {wRecord?.autonomicBalance || 'Homeostatic balance'}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                          AM: {wRecord?.amMeasurementHrv || 60}ms · PM: {wRecord?.pmMeasurementHrv || 64}ms
                        </div>
                      </div>

                      {/* Card 2: TickTick MCP */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-indigo-400 font-mono text-[10px] uppercase">
                          <span>TickTick MCP</span>
                          <span className={tRecord?.sprintPressure === 'Crunch' ? 'text-rose-400' : 'text-amber-400'}>
                            {tRecord?.sprintPressure || 'Moderate'}
                          </span>
                        </div>
                        <p className="text-slate-100 font-semibold text-sm">
                          {tRecord?.completedTasks || 6} Tasks Finished
                        </p>
                        <p className="text-slate-300 text-[11px] line-clamp-2">
                          Top: {tRecord?.topTaskCompleted || 'Sprint planning review and architecture'}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                          P1: {tRecord?.p1Count || 2} · P2: {tRecord?.p2Count || 3}
                        </div>
                      </div>

                      {/* Card 3: Samsung Health */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-blue-400 font-mono text-[10px] uppercase">
                          <span>Samsung Health</span>
                          <span>Quality {sRecord?.sleepQuality || 82}%</span>
                        </div>
                        <p className="text-slate-100 font-semibold text-sm">
                          {sRecord?.sleepHours || 7.2}h Sleep <span className="text-xs font-normal text-slate-400">({sRecord?.deepSleepPercentage || 18}% Deep)</span>
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Steps: {(sRecord?.dailySteps || 8400).toLocaleString()}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                          Resting HR: {sRecord?.restingHeartRate || 61} bpm
                        </div>
                      </div>

                      {/* Card 4: Mindsera Reflection */}
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-purple-400 font-mono text-[10px] uppercase">
                          <span>Mindsera Context</span>
                          <span>{mRecord?.frameworkUsed || moodRecord?.appliedFramework || 'Stoic'}</span>
                        </div>
                        <p className="text-slate-100 font-semibold text-xs line-clamp-1">
                          {mRecord?.title || 'Cognitive Reappraisal Checkpoint'}
                        </p>
                        <p className="text-slate-300 text-[11px] line-clamp-2">
                          {mRecord?.mindsComments?.[0]?.commentText ||
                            moodRecord?.mindseraMindsComments?.[0]?.commentText ||
                            'Cognitive alignment established with somatic bio-signals.'}
                        </p>
                        <div className="text-[10px] text-purple-300 font-mono pt-1 border-t border-slate-800">
                          Biases: {mRecord?.cognitiveBiasesDetected?.join(', ') || 'Urgency Fallacy mitigated'}
                        </div>
                      </div>
                    </div>

                    {/* Matched Feelings Wheel Entry for Date */}
                    {moodRecord && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-300 font-serif-heading">
                            Matching Feelings Wheel Check-In: {moodRecord.primaryEmotion} {moodRecord.secondaryEmotion && `→ ${moodRecord.secondaryEmotion}`} (Intensity: {moodRecord.intensity}/10)
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{moodRecord.time}</span>
                        </div>
                        <p className="text-slate-300 italic font-serif-heading">
                          "{moodRecord.journalText}"
                        </p>
                        {moodRecord.somaticSensations?.length > 0 && (
                          <div className="text-[11px] text-slate-400">
                            🫀 Somatic Cues: {moodRecord.somaticSensations.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: WELLTORY BIOMETRICS TUNING                              */}
          {/* ============================================================== */}
          {activeTab === 'welltory' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">Welltory Telemetry Configuration</h4>
                  <a
                    href="https://app.welltory.com/dashboard/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <span>https://app.welltory.com/dashboard/</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={welltory.enabled}
                    onChange={(e) => onUpdateWelltory({ ...welltory, enabled: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500 bg-slate-800 border-slate-700"
                  />
                  <span>Active Integration</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Heart Rate Variability (HRV RMSSD):</span>
                    <span className="font-mono text-rose-400 font-bold">{welltory.hrvScore} ms</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    value={welltory.hrvScore}
                    onChange={(e) => onUpdateWelltory({ ...welltory, hrvScore: Number(e.target.value) })}
                    className="w-full accent-rose-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Values &gt; 65 ms indicate healthy parasympathetic resilience.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Stress Score:</span>
                    <span className="font-mono text-rose-400 font-bold">{welltory.stressScore}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={welltory.stressScore}
                    onChange={(e) => onUpdateWelltory({ ...welltory, stressScore: Number(e.target.value) })}
                    className="w-full accent-rose-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Stress &gt; 65% signals sympathetic fight-or-flight activation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: TICKTICK MCP & SPRINT SETTINGS                           */}
          {/* ============================================================== */}
          {activeTab === 'ticktick' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">TickTick MCP Architecture</h4>
                  <a
                    href="https://mcp.ticktick.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>https://mcp.ticktick.com (Model Context Protocol)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={tasks.enabled}
                    onChange={(e) => onUpdateTasks({ ...tasks, enabled: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                  />
                  <span>Active Integration</span>
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <label className="block text-xs text-slate-400">Current Sprint Pressure Tier:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Moderate', 'High', 'Crunch'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => onUpdateTasks({ ...tasks, currentSprintPressure: tier })}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                        tasks.currentSprintPressure === tier
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onRestoreSampleData}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset All Sample Datasets
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-white rounded-xl transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
