import React, { useState, useEffect, useMemo } from 'react';
import {
  SobrietyRecoveryContext,
  UrgeSurfingRecord,
  RecoveryTreatmentApproach,
  MoodEntry,
  CustomEmergencyContact,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
} from '../types/journal';
import {
  INITIAL_WELLTORY_BIOMETRICS,
  INITIAL_SAMSUNG_HEALTH,
  INITIAL_TASK_PROJECTS,
} from '../data/seedData';
import { analyzeRelapseCycle } from '../utils/relapseCycleAnalyzer';
import {
  ShieldCheck,
  ShieldAlert,
  Heart,
  Activity,
  Flame,
  Moon,
  Sparkles,
  RefreshCw,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Coffee,
  BatteryCharging,
  Smile,
  AlertTriangle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Sliders,
  DollarSign,
  HeartPulse,
  UserPlus,
  Trash2,
  Phone,
  MessageSquare,
  Plus,
  X,
  Share2,
  Check,
  HelpCircle,
  Wind,
} from 'lucide-react';

interface SobrietyRecoveryViewProps {
  sobriety: SobrietyRecoveryContext;
  onUpdateSobriety: (updated: SobrietyRecoveryContext) => void;
  entries: MoodEntry[];
  welltory?: WelltoryBiometrics;
  samsungHealth?: SamsungHealthData;
  tasks?: TaskProjectData;
  onOpenJournalWithPrompt: (promptText: string) => void;
  onOpenIntegrations: () => void;
}

export const SobrietyRecoveryView: React.FC<SobrietyRecoveryViewProps> = ({
  sobriety,
  onUpdateSobriety,
  entries,
  welltory,
  samsungHealth,
  tasks,
  onOpenJournalWithPrompt,
  onOpenIntegrations,
}) => {
  // Telemetry fallbacks
  const effectiveWelltory = welltory || INITIAL_WELLTORY_BIOMETRICS;
  const effectiveSamsung = samsungHealth || INITIAL_SAMSUNG_HEALTH;
  const effectiveTasks = tasks || INITIAL_TASK_PROJECTS;

  // Integrated Relapse Cycle Analysis
  const relapseAnalysis = useMemo(
    () =>
      analyzeRelapseCycle(
        entries,
        sobriety,
        effectiveWelltory,
        effectiveSamsung,
        effectiveTasks
      ),
    [entries, sobriety, effectiveWelltory, effectiveSamsung, effectiveTasks]
  );

  // Active Relapse Cycle stage accordion (default to current stage or Stage 1)
  const [activeCycleStage, setActiveCycleStage] = useState<1 | 2 | 3>(
    relapseAnalysis.currentActiveStage || 1
  );

  // Custom Emergency & Trigger Support Contacts
  const customContacts = useMemo(
    () => sobriety.customSupportContacts || [],
    [sobriety.customSupportContacts]
  );

  // Modal State for Adding Custom Contact
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Sponsor / Accountability Partner');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactMethod, setNewContactMethod] = useState<'call' | 'text' | 'whatsapp' | 'signal'>('call');
  const [newContactNotes, setNewContactNotes] = useState('');
  const [newContactPrimary, setNewContactPrimary] = useState(false);

  // Action toast for simulated reach out
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);

  // Urge Surfing timer state
  const [isSurfing, setIsSurfing] = useState(false);
  const [surfSecondsRemaining, setSurfSecondsRemaining] = useState(180); // 3 minutes standard
  const [surfActiveTrigger, setSurfActiveTrigger] = useState('');
  const [surfCurrentCraving, setSurfCurrentCraving] = useState<number>(
    sobriety.currentCravingLevel || 5
  );
  const [surfComplete, setSurfComplete] = useState(false);

  // Cognitive reframe card selection
  const [selectedThoughtIndex, setSelectedThoughtIndex] = useState(0);

  const COGNITIVE_REFRAMES = [
    {
      distortion: 'Romancing the First Drink',
      automaticThought: 'Just one glass tonight will help me relax after this brutal sprint.',
      rationalReframe:
        'The first drink does not relieve stress; it borrows dopamine from tomorrow, triggers insomnia at 3 AM, and spikes my resting heart rate by 15 bpm. True relaxation is a warm shower, chamomile tea, and uninterrupted sleep.',
      somaticPractice: 'Take 3 physiological sighs and drink a large glass of ice-cold sparkling water.',
    },
    {
      distortion: 'Euphoric Recall & Invisibility Bias',
      automaticThought: 'I’ve been sober for over a month—I proved I can control it now.',
      rationalReframe:
        'I feel clear and in control specifically BECAUSE I have not put ethanol in my body, not because my brain’s neurochemistry magically changed. Sobriety is my operating system, not a temporary diet.',
      somaticPractice: 'Place hands over heart, feel the steady rhythm, and celebrate this unbroken streak.',
    },
    {
      distortion: 'Social Alienation / FOMO',
      automaticThought: 'Everyone at the restaurant is having wine. I look rigid or boring without a drink.',
      rationalReframe:
        'No one cares what is in my glass as much as I think they do. Drinking mocktails or mineral water preserves my presence, genuine humor, and morning pride. I am choosing authentic connection over chemical sedation.',
      somaticPractice: 'Order artisanal bitter tonic or ginger beer with lime; savor the sensory complexity.',
    },
    {
      distortion: 'Emotional Exhaustion / "I Deserve This"',
      automaticThought: 'I worked 10 hours and dealt with endless crises. I deserve a reward.',
      rationalReframe:
        'Poisoning my nervous system and triggering next-day guilt is not a reward—it is self-sabotage. I deserve real care: a good meal, reading without screens, and waking up without brain fog.',
      somaticPractice: 'Lie flat on the floor for 5 minutes with legs elevated; allow parasympathetic reset.',
    },
  ];

  // Urge Surfing timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSurfing && surfSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSurfSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (surfSecondsRemaining === 0 && isSurfing) {
      setIsSurfing(false);
      setSurfComplete(true);
      // Auto record urge surfed
      const newRecord: UrgeSurfingRecord = {
        id: `us-${Date.now()}`,
        timestamp: new Date().toISOString(),
        trigger: surfActiveTrigger || 'Evening decompression craving',
        peakCravingLevel: surfCurrentCraving,
        surfingDurationSeconds: 180,
        somaticFocusUsed: 'Diaphragmatic wave breathing and somatic noticing',
        outcome: 'Rode the wave successfully',
      };
      onUpdateSobriety({
        ...sobriety,
        currentCravingLevel: Math.max(1, surfCurrentCraving - 4),
        urgeSurfingHistory: [newRecord, ...sobriety.urgeSurfingHistory],
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSurfing, surfSecondsRemaining, surfActiveTrigger, surfCurrentCraving, sobriety, onUpdateSobriety]);

  const handleToggleHalt = (key: keyof SobrietyRecoveryContext['haltState']) => {
    const updated = {
      ...sobriety,
      haltState: {
        ...sobriety.haltState,
        [key]: !sobriety.haltState[key],
      },
    };
    onUpdateSobriety(updated);
  };

  const handleUpdateCraving = (level: number) => {
    onUpdateSobriety({
      ...sobriety,
      currentCravingLevel: level,
      lastCheckInTimestamp: new Date().toISOString(),
    });
  };

  const handleStartSurf = () => {
    setSurfSecondsRemaining(180);
    setSurfComplete(false);
    setIsSurfing(true);
  };

  const handleCancelSurf = () => {
    setIsSurfing(false);
    setSurfSecondsRemaining(180);
  };

  // Custom Contact Actions
  const handleAddCustomContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: CustomEmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRel,
      phoneOrHandle: newContactPhone.trim(),
      preferredMethod: newContactMethod,
      notes: newContactNotes.trim() || 'Available to talk down urges and offer support.',
      isPrimaryUrgeContact: newContactPrimary,
    };

    const updatedContacts: CustomEmergencyContact[] = newContactPrimary
      ? [...customContacts.map((c) => ({ ...c, isPrimaryUrgeContact: false })), newContact]
      : [...customContacts, newContact];

    onUpdateSobriety({
      ...sobriety,
      customSupportContacts: updatedContacts,
    });

    // Reset modal
    setNewContactName('');
    setNewContactPhone('');
    setNewContactNotes('');
    setNewContactPrimary(false);
    setIsAddContactModalOpen(false);

    setActionFeedbackToast(`Added ${newContact.name} to your custom support allies.`);
    setTimeout(() => setActionFeedbackToast(null), 3500);
  };

  const handleDeleteCustomContact = (id: string) => {
    const updatedContacts = customContacts.filter((c) => c.id !== id);
    onUpdateSobriety({
      ...sobriety,
      customSupportContacts: updatedContacts,
    });
  };

  const handleReachOutAction = (contact: CustomEmergencyContact) => {
    const methodVerb =
      contact.preferredMethod === 'call'
        ? 'Calling'
        : contact.preferredMethod === 'text'
        ? 'Sending SOS SMS to'
        : contact.preferredMethod === 'whatsapp'
        ? 'Opening WhatsApp chat with'
        : 'Connecting with';

    setActionFeedbackToast(`${methodVerb} ${contact.name} (${contact.phoneOrHandle})...`);
    setTimeout(() => setActionFeedbackToast(null), 4000);
  };

  // HALT count
  const activeHaltCount = Object.values(sobriety.haltState).filter(Boolean).length;
  const haltRiskLevel =
    activeHaltCount >= 3 ? 'Critical Vulnerability' : activeHaltCount >= 2 ? 'Moderate Vulnerability' : 'Low Vulnerability';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {actionFeedbackToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionFeedbackToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP COMMAND HEADER: MILESTONES & RECOVERY ARCHITECTURE                    */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Clinical Recovery & Relapse Prevention Hub
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Day {sobriety.currentStreakDays} of Continuous Sobriety
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Ground your sobriety in evidence-based cognitive frameworks, real-time biometric telemetry, and a personalized support network to neutralize triggers before they crest.
            </p>
          </div>

          {/* Days Clean Badge Ring */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 text-center min-w-[170px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Alcohol-Free Streak
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl md:text-5xl font-mono font-extrabold text-white tracking-tight">
                {sobriety.currentStreakDays}
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">Days</span>
            </div>
            <span className="text-[11px] text-slate-300 block mt-1">
              Since {sobriety.sobrietyStartDate} • Day by Day
            </span>
          </div>
        </div>

        {/* Health Dividends KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Drinks Avoided</span>
              <WineOffIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              ~{sobriety.alcoholAvoidedUnits} Units
            </div>
            <span className="text-[10px] text-emerald-300">Liver enzymes normalizing</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Financial Dividend</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              ${sobriety.moneySavedEstimated} Saved
            </div>
            <span className="text-[10px] text-slate-400">~$20/day unspent on alcohol</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Autonomic Resting HR</span>
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-300">
              -11 bpm Drop
            </div>
            <span className="text-[10px] text-slate-400">Vagal brake restored during sleep</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">HALT Trigger Status</span>
              <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className={`text-sm font-bold font-mono ${activeHaltCount >= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {haltRiskLevel}
            </div>
            <span className="text-[10px] text-slate-400">{activeHaltCount} active somatic triggers</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🛡️ SECTION 1: CUSTOM SUPPORT NETWORK & REACH OUT ALLIES                   */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Urgent Support Network & Customized Allies
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Customize trusted recovery contacts (sponsors, therapist, partners, sober peers). When experiencing an intense craving or HALT trigger, reach out with 1 click before bargaining takes over.
            </p>
          </div>

          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Custom Contact</span>
          </button>
        </div>

        {/* Custom Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                contact.isPrimaryUrgeContact
                  ? 'bg-slate-950/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-slate-100 text-base">
                      {contact.name}
                    </span>
                    {contact.isPrimaryUrgeContact && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        Primary Ally
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCustomContact(contact.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Remove contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-semibold">{contact.relationship}</span>
                  <span>·</span>
                  <span className="text-slate-300">{contact.phoneOrHandle}</span>
                </div>

                <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 leading-relaxed">
                  "{contact.notes}"
                </p>
              </div>

              {/* Action Trigger Buttons */}
              <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                <button
                  onClick={() => handleReachOutAction(contact)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Ally Now</span>
                </button>

                <button
                  onClick={() => handleReachOutAction({ ...contact, preferredMethod: 'text' })}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Send pre-drafted SOS SMS"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
                  <span>SMS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧬 SECTION 2: RELAPSE CYCLE & PERSONAL TRIGGER IDENTIFIER                 */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                <Compass className="w-5 h-5" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Relapse Cycle & Personal Trigger Identifier
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Addiction research confirms relapse is a 3-stage process (Emotional → Mental → Physical), not an isolated event. This engine scans your journal entries, Welltory autonomic strain, and Samsung sleep debt to pinpoint your personal vulnerability vectors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Current Risk:</span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase border ${
                relapseAnalysis.overallRiskLevel === 'Low'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : relapseAnalysis.overallRiskLevel === 'Moderate'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              }`}
            >
              {relapseAnalysis.overallRiskLevel} Risk
            </span>
          </div>
        </div>

        {/* Telemetry Correlation Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-indigo-300 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Welltory Autonomic Marker: </strong>
              {relapseAnalysis.autonomicStressCorrelation}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-teal-300 flex items-start gap-2.5">
            <Moon className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Samsung Sleep Architecture: </strong>
              {relapseAnalysis.sleepDebtCorrelation}
            </span>
          </div>
        </div>

        {/* Stage Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {relapseAnalysis.stages.map((stg) => {
            const isActive = activeCycleStage === stg.stage;
            const isCurrentlyActiveInUser = relapseAnalysis.currentActiveStage === stg.stage;

            return (
              <button
                key={stg.stage}
                onClick={() => setActiveCycleStage(stg.stage)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {stg.stage}
                </span>
                <span>{stg.name}</span>
                {isCurrentlyActiveInUser && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Active stage detected from telemetry" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Stage Deep Inspector */}
        {(() => {
          const selectedStageData = relapseAnalysis.stages.find((s) => s.stage === activeCycleStage)!;
          return (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                    Stage {selectedStageData.stage} Analysis
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-serif font-bold text-slate-100 text-lg">
                    {selectedStageData.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedStageData.subtitle}
                </p>
              </div>

              {/* Characteristics Checklist */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Core Characteristics & Psychological Symptoms:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedStageData.coreCharacteristics.map((charac, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{charac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Historical Triggers Detected in Entries */}
              <div className="space-y-3 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Triggers Sourced from Your Logged Entries:
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedStageData.historicalTriggersDetected.length} Detected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedStageData.historicalTriggersDetected.map((trig, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{trig.triggerName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-500/30">
                          {trig.frequencyCount} occurrences
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <span>Emotion: <strong className="text-slate-300">{trig.correlatedEmotion}</strong></span>
                        <span>·</span>
                        <span className="text-indigo-300">{trig.biometricMarker}</span>
                      </div>

                      <p className="text-slate-400 italic bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[11px] font-serif">
                        "{trig.sampleJournalQuote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning Signs from Real Telemetry */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Live Warning Signs from Integrated Telemetry:
                </span>
                <div className="space-y-1">
                  {selectedStageData.warningSignsFromData.map((sign, i) => (
                    <div key={i} className="text-xs text-slate-300 font-mono">
                      {sign}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Interventions with 1-Click Execution */}
              <div className="space-y-3 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                  Recommended Early Stage Interventions:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedStageData.clinicalInterventions.map((interv, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 inline-block">
                          {interv.type} intervention
                        </span>
                        <h5 className="font-bold text-slate-200">{interv.title}</h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {interv.actionText}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (interv.type === 'somatic') {
                            handleStartSurf();
                          } else if (interv.type === 'cognitive') {
                            onOpenJournalWithPrompt(
                              `Working through ${interv.title}: What is the unvarnished reality if I give in right now, and how will staying clean tonight serve my freedom tomorrow?`
                            );
                          } else if (interv.type === 'social') {
                            if (customContacts.length > 0) {
                              handleReachOutAction(customContacts[0]);
                            } else {
                              setActionFeedbackToast('Please configure a custom support contact above!');
                            }
                          } else {
                            setActionFeedbackToast(`Protocol "${interv.title}" initiated.`);
                          }
                        }}
                        className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                      >
                        <span>Execute Step</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* 🌊 SECTION 3: LIVE URGE SURFING WAVE STATION & HALT                      */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-400">
                <Flame className="w-5 h-5" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Live Urge Surfing Station (Dr. Alan Marlatt Protocol)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Neurochemically, an alcohol craving is like an ocean wave: it swells, peaks, and naturally dissipates in 3 minutes. Surfing means observing somatic tension without fighting or capitulating.
            </p>
          </div>

          {/* Quick Craving Gauge */}
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">Urge Intensity:</span>
            <div className="flex items-center gap-1">
              {[0, 2, 4, 6, 8, 10].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleUpdateCraving(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                    sobriety.currentCravingLevel === lvl
                      ? lvl >= 6
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timer Component Container */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Pulsing visual circles */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                isSurfing
                  ? 'border-teal-400/40 animate-ping opacity-25'
                  : 'border-slate-800'
              }`}
            />
            <div className="text-center space-y-1">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
                {Math.floor(surfSecondsRemaining / 60)}:
                {String(surfSecondsRemaining % 60).padStart(2, '0')}
              </span>
              <span className="block text-xs font-mono uppercase tracking-wider text-teal-400">
                {isSurfing ? 'Breathing With Wave' : surfComplete ? 'Wave Surfed Successfully ✓' : '3-Minute Protocol'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSurfing ? (
              <button
                onClick={handleStartSurf}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start 3-Minute Wave</span>
              </button>
            ) : (
              <button
                onClick={handleCancelSurf}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Cancel Reset</span>
              </button>
            )}

            <button
              onClick={() => {
                if (customContacts.length > 0) {
                  handleReachOutAction(customContacts[0]);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Ally</span>
            </button>
          </div>
        </div>

        {/* HALT Assessment Cards */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              HALT Somatic Vulnerability Diagnostics
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Toggle any active physiological triggers
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['hungry', 'angry', 'lonely', 'tired'] as const).map((key) => {
              const isActive = sobriety.haltState[key];
              const labels: Record<string, { title: string; desc: string; icon: any }> = {
                hungry: { title: 'H • Hungry', desc: 'Hypoglycemia triggers dopamine search', icon: Coffee },
                angry: { title: 'A • Angry', desc: 'Suppressed frustration spikes urge', icon: Flame },
                lonely: { title: 'L • Lonely', desc: 'Social isolation signals safety threat', icon: Heart },
                tired: { title: 'T • Tired', desc: 'Prefrontal willpower collapse', icon: Moon },
              };
              const item = labels[key];
              const IconComponent = item.icon;

              return (
                <div
                  key={key}
                  onClick={() => handleToggleHalt(key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isActive
                      ? 'bg-rose-950/60 border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1.5">
                      <IconComponent className="w-3.5 h-3.5 text-indigo-400" />
                      {item.title}
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] ${
                        isActive
                          ? 'bg-rose-500 border-rose-400 text-white'
                          : 'border-slate-700 bg-slate-900 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧠 SECTION 4: CBT COGNITIVE REFRAMING TOOL FOR ADDICTIVE THOUGHTS        */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                CBT Cognitive Reframing of Addictive Rationalizations
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Addiction speaks in distorted cognitive scripts ("Just one won't hurt", "I deserve this"). Expose and reframe the distortion using objective evidence.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {COGNITIVE_REFRAMES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedThoughtIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedThoughtIndex === idx
                    ? 'bg-slate-800 text-white font-bold shadow-xs border border-slate-700'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                }`}
              >
                Script #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Reframe Interactive Display */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
              Cognitive Distortion Pattern:
            </span>
            <h4 className="text-base font-serif font-bold text-slate-100">
              {COGNITIVE_REFRAMES[selectedThoughtIndex].distortion}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* The Automatic Lie */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Automatic Rationalizing Thought:
              </span>
              <p className="text-sm font-semibold text-rose-200 font-serif italic">
                "{COGNITIVE_REFRAMES[selectedThoughtIndex].automaticThought}"
              </p>
            </div>

            {/* The Grounded Truth */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Grounded Clinical Reframe:
              </span>
              <p className="text-xs text-emerald-200 leading-relaxed font-sans">
                {COGNITIVE_REFRAMES[selectedThoughtIndex].rationalReframe}
              </p>
            </div>
          </div>

          {/* Somatic Action & Journal button */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Immediate Somatic Action:
              </span>
              <p className="text-xs text-slate-300 font-medium">
                {COGNITIVE_REFRAMES[selectedThoughtIndex].somaticPractice}
              </p>
            </div>

            <button
              onClick={() =>
                onOpenJournalWithPrompt(
                  `Reflecting on the thought "${COGNITIVE_REFRAMES[selectedThoughtIndex].automaticThought}": What is the honest, unvarnished truth about what happens if I reach for a drink, and how does staying sober protect my peace?`
                )
              }
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 self-start sm:self-auto flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Write Journal Reframe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧬 SECTION 5: SCIENTIFIC BODY & NEUROBIOLOGY RECOVERY TIMELINE           */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Neurobiological & Autonomic Body Healing Timeline
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Clinical stages of physical tissue regeneration, GABA/dopamine receptor recovery, and cardiovascular stabilization across your 43-day trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sobriety.healthMilestones.map((ms, idx) => {
            const isCompleted = sobriety.currentStreakDays >= ms.days;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCompleted
                    ? 'bg-slate-950/80 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-950/30 border-slate-850 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      Day {ms.days}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isCompleted ? '✓ Achieved' : `In ${ms.days - sobriety.currentStreakDays} days`}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-100 leading-tight">{ms.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ms.scientificImpact}</p>
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    style={{
                      width: `${Math.min(100, Math.round((sobriety.currentStreakDays / ms.days) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🆘 SECTION 6: 24/7 CRISIS LIFELINES & EMERGENCY HOTLINES                 */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-white text-base">24/7 Emergency Crisis & Recovery Hotlines</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Available 24/7 • Free, Confidential, Non-judgmental</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sobriety.emergencySupportContacts.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="font-bold text-slate-200 block">{c.name}</span>
              <span className="text-emerald-400 font-bold text-sm block font-mono">
                {c.phoneOrUrl}
              </span>
              <span className="text-[10px] text-slate-400 block">{c.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD CUSTOM SUPPORT CONTACT MODAL                                          */}
      {/* ========================================================================= */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAddContactModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Add Recovery Ally or Support Contact
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Personal Urge Response Network
                </span>
              </div>
            </div>

            <form onSubmit={handleAddCustomContact} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  CONTACT NAME
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Alex Rivera, Dr. Vance, Partner"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  RELATIONSHIP / ROLE
                </label>
                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Sponsor / Accountability Partner">Sponsor / Accountability Partner</option>
                  <option value="Licensed Addiction Therapist">Licensed Addiction Therapist</option>
                  <option value="Partner / Significant Other">Partner / Significant Other</option>
                  <option value="Close Friend">Close Friend</option>
                  <option value="Family Member">Family Member</option>
                  <option value="SMART Recovery Peer">SMART Recovery Peer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    PHONE NUMBER / HANDLE
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="e.g. 555-0192"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    PREFERRED METHOD
                  </label>
                  <select
                    value={newContactMethod}
                    onChange={(e) => setNewContactMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="call">Direct Voice Call</option>
                    <option value="text">SMS Text Message</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="signal">Signal Private Messenger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  CONTEXT & SPECIAL INSTRUCTIONS
                </label>
                <textarea
                  rows={2}
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  placeholder="e.g. Call before going to social gatherings. Remind me that urges peak and pass in 15 mins."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryContactCheckbox"
                  checked={newContactPrimary}
                  onChange={(e) => setNewContactPrimary(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="primaryContactCheckbox"
                  className="text-xs text-slate-300 cursor-pointer font-medium"
                >
                  Set as Primary Quick-Reach Ally during acute craving warnings
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Ally Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function WineOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="m2 2 20 20" />
      <path d="M7.3 7.3A6 6 0 0 0 6 10c0 3.3 2.7 6 6 6 .8 0 1.6-.2 2.3-.5" />
      <path d="M17.8 12.2c.1-.7.2-1.4.2-2.2 0-3.3-2.7-6-6-6-.8 0-1.5.1-2.2.4" />
    </svg>
  );
}
