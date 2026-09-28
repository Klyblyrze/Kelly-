import React, { useState, useEffect } from 'react';
import {
  SobrietyRecoveryContext,
  UrgeSurfingRecord,
  RecoveryTreatmentApproach,
  MoodEntry,
} from '../types/journal';
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
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Sliders,
  DollarSign,
  HeartPulse,
} from 'lucide-react';

interface SobrietyRecoveryViewProps {
  sobriety: SobrietyRecoveryContext;
  onUpdateSobriety: (updated: SobrietyRecoveryContext) => void;
  entries: MoodEntry[];
  onOpenJournalWithPrompt: (promptText: string) => void;
  onOpenIntegrations: () => void;
}

export const SobrietyRecoveryView: React.FC<SobrietyRecoveryViewProps> = ({
  sobriety,
  onUpdateSobriety,
  entries,
  onOpenJournalWithPrompt,
  onOpenIntegrations,
}) => {
  // Urge Surfing timer state
  const [isSurfing, setIsSurfing] = useState(false);
  const [surfSecondsRemaining, setSurfSecondsRemaining] = useState(180); // 3 minutes standard
  const [surfActiveTrigger, setSurfActiveTrigger] = useState('');
  const [surfCurrentCraving, setSurfCurrentCraving] = useState<number>(sobriety.currentCravingLevel || 5);
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

  const handleResetSurf = () => {
    setIsSurfing(false);
    setSurfSecondsRemaining(180);
    setSurfComplete(false);
  };

  // HALT score
  const activeHaltCount = Object.values(sobriety.haltState).filter(Boolean).length;
  const haltRiskLevel =
    activeHaltCount >= 3 ? 'High Craving Vulnerability' : activeHaltCount >= 1 ? 'Moderate Trigger Alert' : 'Stable Resilience';

  // Recent recovery-tagged journal entries
  const recoveryEntries = entries.filter(
    (e) =>
      e.recoverySnapshot ||
      e.tags.some((t) => t.toLowerCase().includes('sober') || t.toLowerCase().includes('recovery')) ||
      e.journalText.toLowerCase().includes('sober') ||
      e.journalText.toLowerCase().includes('craving') ||
      e.journalText.toLowerCase().includes('drink')
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 🌿 HERO SOBRIETY MILESTONE & RECOVERY HORIZON BANNER                      */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold font-serif-heading text-white">
                Sobriety & Addiction Treatment Hub
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {sobriety.treatmentApproach} Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Clinical recovery tracking grounded in cognitive behavioral therapy (CBT), SMART Recovery urge surfing, HALT trigger mitigation, and autonomic neurobiology recovery.
            </p>
          </div>

          {/* Days Alcohol-Free Counter Emblem */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shrink-0 min-w-56 shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block mb-1">
              Alcohol-Free Streak
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {sobriety.currentStreakDays}
              </span>
              <span className="text-sm font-bold text-emerald-400">Days</span>
            </div>
            <span className="text-[11px] text-slate-300 block mt-1">
              Since {sobriety.sobrietyStartDate} • Day by Day
            </span>
          </div>
        </div>

        {/* Sobriety Health Dividends KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Drinks Avoided</span>
              <WineOffIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-white">
              ~{sobriety.alcoholAvoidedUnits} Units
            </div>
            <span className="text-[10px] text-emerald-300">Liver enzymes normalizing</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Financial Dividend</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-amber-300">
              ${sobriety.moneySavedEstimated} Saved
            </div>
            <span className="text-[10px] text-slate-400">~$20/day unspent on alcohol</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Autonomic Resting HR</span>
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-extrabold text-rose-300">
              -11 bpm Drop
            </div>
            <span className="text-[10px] text-slate-400">Vagal brake restored during sleep</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">HALT Trigger Status</span>
              <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className={`text-sm font-extrabold ${activeHaltCount >= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {haltRiskLevel}
            </div>
            <span className="text-[10px] text-slate-400">{activeHaltCount} active somatic triggers</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌊 SECTION 1: LIVE URGE SURFING WAVE STATION                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                Live Urge Surfing Station (Dr. Alan Marlatt Protocol)
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Neurochemically, an alcohol craving is like an ocean wave: it swells, peaks, and naturally dissipates in 3 minutes. Surfing means observing somatic tension without fighting or capitulating.
            </p>
          </div>

          {/* Quick Craving Gauge */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Current Urge:</span>
            <div className="flex items-center gap-1">
              {[0, 2, 4, 6, 8, 10].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleUpdateCraving(lvl)}
                  className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all ${
                    sobriety.currentCravingLevel === lvl
                      ? lvl >= 6
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Urge Surfing Interactive Wave Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-md relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300 block mb-1">
                3-Minute Neurochemical De-escalation
              </span>
              <h4 className="text-lg font-bold text-white font-serif-heading">
                {isSurfing
                  ? surfSecondsRemaining > 120
                    ? 'Phase 1: Acknowledge & Body Scan (Where is the urge?)'
                    : surfSecondsRemaining > 60
                    ? 'Phase 2: Diaphragmatic Breath into the Contraction'
                    : 'Phase 3: Watching the Wave Crest & Dissolve'
                  : surfComplete
                  ? '🎉 Craving Wave Successfully Surfed!'
                  : 'Ready to Ride the Craving Wave'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {!isSurfing && !surfComplete ? (
                <button
                  onClick={handleStartSurf}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Begin 3-Min Urge Surf</span>
                </button>
              ) : isSurfing ? (
                <button
                  onClick={() => setIsSurfing(false)}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handleResetSurf}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Surf Another Wave</span>
                </button>
              )}
            </div>
          </div>

          {/* Wave Visualizer & Countdown */}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer pulsing wave rings */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-teal-400/30 transition-all duration-1000 ${
                  isSurfing ? 'animate-ping' : ''
                }`}
              />
              <div
                className={`absolute inset-4 rounded-full border border-teal-400/50 transition-transform duration-1000 ${
                  isSurfing ? 'scale-110' : 'scale-100'
                }`}
              />
              <div className="w-32 h-32 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-400/40 flex flex-col items-center justify-center text-center p-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {Math.floor(surfSecondsRemaining / 60)}:
                  {(surfSecondsRemaining % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-teal-300 uppercase font-semibold mt-1">
                  {isSurfing ? 'Breathe Deep' : surfComplete ? 'Wave Crested' : '3:00 Duration'}
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-teal-100/90 max-w-lg italic font-serif-heading leading-relaxed">
              {isSurfing
                ? surfSecondsRemaining > 120
                  ? '"Do not fight the urge or berate yourself. Notice where the physical sensation sits—chest, jaw, throat, or stomach. Label it objectively: I am experiencing dopamine anticipation."'
                  : surfSecondsRemaining > 60
                  ? '"Inhale for 4 seconds through the nose, expanding the belly. Imagine breathing cool oxygen directly into the somatic knot. The wave has peaked."'
                  : '"Exhale with a gentle sigh. Notice the intensity dropping from a 7 to a 3. Your prefrontal cortex has outlasted the impulse. You are in command."'
                : surfComplete
                ? '"You have successfully ridden the neurochemical wave without caving. Every urge you surf physically weakens the neural craving loop and strengthens self-efficacy."'
                : 'Click "Begin 3-Min Urge Surf" the moment an alcohol craving appears. Let the paced wave guide your breathing until the craving dissipates.'}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
            <span className="text-slate-400">
              Total Urges Surfed in History: <strong className="text-white">{sobriety.urgeSurfingHistory.length} Craving Waves</strong>
            </span>
            <button
              onClick={() =>
                onOpenJournalWithPrompt(
                  'What somatic sensations arose during this craving wave, and what did you learn by waiting it out rather than numbing it?'
                )
              }
              className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Journal on This Urge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🥪 SECTION 2: HALT RELAPSE PREVENTION CHECK-IN MATRIX                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                HALT Relapse Prevention Protocol (Hungry • Angry • Lonely • Tired)
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Over 85% of alcohol relapses occur when one or more HALT vulnerabilities are unaddressed. Check off active triggers to activate clinical somatic countermeasures.
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
              activeHaltCount >= 2
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : activeHaltCount === 1
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {activeHaltCount === 0 ? '✓ All Clear (Safe)' : `${activeHaltCount} HALT Vectors Active`}
          </div>
        </div>

        {/* 4 HALT Interactive Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* H - Hungry */}
          <div
            onClick={() => handleToggleHalt('hungry')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              sobriety.haltState.hungry
                ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  H • Hungry
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    sobriety.haltState.hungry
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {sobriety.haltState.hungry && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Hypoglycemia mimics anxiety and sends signals to seek rapid sugar/alcohol dopamine.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[10px] uppercase">Prescription:</span>
              <span>Eat complex carbohydrates + protein (nuts, fruit, sandwich) & drink 16 oz water.</span>
            </div>
          </div>

          {/* A - Angry / Resentful */}
          <div
            onClick={() => handleToggleHalt('angry')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              sobriety.haltState.angry
                ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-rose-600" />
                  A • Angry
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    sobriety.haltState.angry
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {sobriety.haltState.angry && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Unexpressed resentment spikes sympathetic fight-or-flight arousal, seeking a chemical sedative.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[10px] uppercase">Prescription:</span>
              <span>Write an unsent boundary letter or take 5 double-inhale physiological sighs.</span>
            </div>
          </div>

          {/* L - Lonely */}
          <div
            onClick={() => handleToggleHalt('lonely')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              sobriety.haltState.lonely
                ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-purple-600" />
                  L • Lonely
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    sobriety.haltState.lonely
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {sobriety.haltState.lonely && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Social isolation signals safety threat; alcohol falsely promises synthetic warmth.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[10px] uppercase">Prescription:</span>
              <span>Call a friend, send a voice memo, or join an online SMART / recovery meeting.</span>
            </div>
          </div>

          {/* T - Tired */}
          <div
            onClick={() => handleToggleHalt('tired')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              sobriety.haltState.tired
                ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-blue-600" />
                  T • Tired
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    sobriety.haltState.tired
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {sobriety.haltState.tired && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Executive prefrontal willpower collapses under sleep deprivation; impulse control drops 60%.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[10px] uppercase">Prescription:</span>
              <span>Go to bed early, take a 20-min non-sleep deep rest (NSDR), cancel non-urgent tasks.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧠 SECTION 3: CBT COGNITIVE REFRAMING TOOL FOR ADDICTIVE THOUGHTS        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
                CBT Cognitive Reframing of Addictive Rationalizations
              </h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Addiction speaks in distorted cognitive scripts ("Just one won't hurt", "I deserve this"). Expose and reframe the distortion using objective evidence.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {COGNITIVE_REFRAMES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedThoughtIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedThoughtIndex === idx
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Script #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Reframe Interactive Display */}
        <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
              Cognitive Distortion Pattern:
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {COGNITIVE_REFRAMES[selectedThoughtIndex].distortion}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* The Automatic Lie */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Automatic Rationalizing Thought:
              </span>
              <p className="text-sm font-semibold text-rose-950 font-serif-heading italic">
                "{COGNITIVE_REFRAMES[selectedThoughtIndex].automaticThought}"
              </p>
            </div>

            {/* The Grounded Truth */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Grounded Clinical Reframe:
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                {COGNITIVE_REFRAMES[selectedThoughtIndex].rationalReframe}
              </p>
            </div>
          </div>

          {/* Somatic Action & Journal button */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Immediate Somatic Action:
              </span>
              <p className="text-xs text-slate-800 font-medium">
                {COGNITIVE_REFRAMES[selectedThoughtIndex].somaticPractice}
              </p>
            </div>

            <button
              onClick={() =>
                onOpenJournalWithPrompt(
                  `Reflecting on the thought "${COGNITIVE_REFRAMES[selectedThoughtIndex].automaticThought}": What is the honest, unvarnished truth about what happens if I reach for a drink, and how does staying sober protect my peace?`
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 self-start sm:self-auto flex items-center gap-1.5 transition-colors"
            >
              <span>Write Journal Reframe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🧬 SECTION 4: SCIENTIFIC BODY & NEUROBIOLOGY RECOVERY TIMELINE           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
              Neurobiological & Autonomic Body Healing Timeline
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Clinical stages of physical tissue regeneration, GABA/dopamine receptor recovery, and cardiovascular stabilization.
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
                    ? 'bg-emerald-50/50 border-emerald-200/90 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200/70 opacity-75'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      Day {ms.days}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {isCompleted ? '✓ Achieved' : `In ${ms.days - sobriety.currentStreakDays} days`}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 leading-tight">{ms.title}</h5>
                  <p className="text-[11px] text-slate-600 leading-snug">{ms.scientificImpact}</p>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`}
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
      {/* 🆘 SECTION 5: EMERGENCY SUPPORT LIFELINE & CRISIS CONTACTS               */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-sm border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-white text-base">Emergency Crisis & Recovery Lifelines</h4>
          </div>
          <span className="text-xs text-slate-400">Available 24/7 • Free, Confidential, Non-judgmental</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sobriety.emergencySupportContacts.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
              <span className="font-bold text-white block">{c.name}</span>
              <span className="text-emerald-400 font-extrabold text-sm block font-mono">
                {c.phoneOrUrl}
              </span>
              <span className="text-[10px] text-slate-400 block">{c.role}</span>
            </div>
          ))}
        </div>
      </div>
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
