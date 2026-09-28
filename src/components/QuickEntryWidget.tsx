import React, { useState, useEffect, useRef } from 'react';
import {
  MoodEntry,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
  SobrietyRecoveryContext,
} from '../types/journal';
import { analyzeJournalSentimentAndTags } from '../utils/sentimentTagger';
import {
  Sparkles,
  PenTool,
  Mic,
  MicOff,
  PhoneCall,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Volume2,
  HeartPulse,
  Send,
  Loader2,
  Zap,
} from 'lucide-react';

export type QuickEntryMode = 'write' | 'voice' | 'call';

interface QuickEntryWidgetProps {
  onSaveEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<void>;
  onOpenCallMode: () => void;
  welltory?: WelltoryBiometrics;
  samsungHealth?: SamsungHealthData;
  tasks?: TaskProjectData;
  sobriety?: SobrietyRecoveryContext;
  floating?: boolean; // When true, renders as fixed floating bottom-right dock
}

const QUICK_EMOTIONS = [
  { name: 'Peaceful', color: '#06B6D4', emoji: '☀️', sub: 'Calm, Centered' },
  { name: 'Joyful', color: '#F59E0B', emoji: '🌟', sub: 'Grateful, Hopeful' },
  { name: 'Powerful', color: '#10B981', emoji: '⚡', sub: 'Focused, Resilient' },
  { name: 'Sad', color: '#3B82F6', emoji: '🌊', sub: 'Vulnerable, Tender' },
  { name: 'Mad', color: '#EF4444', emoji: '🔥', sub: 'Frustrated, Restless' },
  { name: 'Scared', color: '#8B5CF6', emoji: '🌪️', sub: 'Anxious, Overwhelmed' },
];

export const QuickEntryWidget: React.FC<QuickEntryWidgetProps> = ({
  onSaveEntry,
  onOpenCallMode,
  welltory,
  samsungHealth,
  tasks,
  sobriety,
  floating = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<QuickEntryMode>('write');
  const [selectedEmotion, setSelectedEmotion] = useState(QUICK_EMOTIONS[0]);
  const [intensity, setIntensity] = useState(6);
  const [microText, setMicroText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justLoggedSuccess, setJustLoggedSuccess] = useState<string | null>(null);

  // Voice Mode States
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [interimSpeech, setInterimSpeech] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for Voice Mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          } else {
            interimChunk += event.results[i][0].transcript;
          }
        }
        if (finalChunk) {
          setSpeechTranscript((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
          setInterimSpeech('');
        } else {
          setInterimSpeech(interimChunk);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setSpeechError('Microphone permission denied.');
        } else if (e.error !== 'no-speech') {
          setSpeechError(`Voice error: ${e.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(true);
      }
    }
  };

  // One-Click Instant Mood Logger (No full editor needed!)
  const handleSingleClickLog = async (
    emotionName: string,
    emotionColor: string,
    customIntensity?: number,
    optionalText?: string
  ) => {
    setIsSubmitting(true);
    const chosenIntensity = customIntensity ?? intensity;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const textToSave = optionalText?.trim() || `Quick mood check-in: feeling ${emotionName.toLowerCase()} with somatic awareness.`;
    const sentiment = analyzeJournalSentimentAndTags(textToSave, emotionName);

    const newEntry: Omit<MoodEntry, 'id'> = {
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      primaryEmotion: emotionName,
      emotionColor,
      intensity: chosenIntensity,
      journalText: textToSave,
      somaticSensations: ['Autonomic check-in'],
      tags: ['Quick Mood', emotionName, ...(sentiment.themeTags || [])],
      sentimentAnalysis: sentiment,
      biometricsSnapshot: {
        hrvScore: welltory?.hrvScore,
        stressScore: welltory?.stressScore,
        sleepHours: samsungHealth?.sleepHours,
        sleepQuality: samsungHealth?.sleepQuality,
        dailySteps: samsungHealth?.dailySteps,
        restingHeartRate: samsungHealth?.restingHeartRate,
      },
      projectContextSnapshot: {
        sprintPressure: tasks?.currentSprintPressure,
        pendingTasks: tasks?.pendingCount,
      },
      recoverySnapshot: sobriety?.enabled
        ? {
            daysSober: sobriety.currentStreakDays,
            cravingLevel: sobriety.currentCravingLevel,
          }
        : undefined,
    };

    try {
      await onSaveEntry(newEntry);
      setJustLoggedSuccess(`Logged ${emotionName} (${chosenIntensity}/10)`);
      setTimeout(() => setJustLoggedSuccess(null), 3000);
      setMicroText('');
      setSpeechTranscript('');
      setInterimSpeech('');
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit current mode entry
  const handleSubmitCurrentMode = async () => {
    const text = mode === 'voice' ? speechTranscript.trim() : microText.trim();
    await handleSingleClickLog(
      selectedEmotion.name,
      selectedEmotion.color,
      intensity,
      text || undefined
    );
  };

  // Render Inner Content
  const renderModeContent = () => {
    if (mode === 'call') {
      return (
        <div className="p-4 bg-gradient-to-br from-indigo-950/80 via-purple-950/70 to-slate-950 rounded-2xl border border-indigo-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-slate-100 text-base">
              Interactive Voice Call Mode
            </h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">
              Speak aloud in real time. The AI Reflection Companion listens, transcribes, and offers gentle somatic inquiries.
            </p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenCallMode();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Start Live Session Now</span>
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Emotion One-Click Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Current Emotion (1-Click):
            </span>
            <span
              className="font-bold text-xs"
              style={{ color: selectedEmotion.color }}
            >
              {selectedEmotion.name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {QUICK_EMOTIONS.map((emo) => {
              const isSelected = selectedEmotion.name === emo.name;
              return (
                <button
                  key={emo.name}
                  type="button"
                  onClick={() => setSelectedEmotion(emo)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/60 shadow-xs'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{emo.emoji}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: emo.color }}
                    />
                  </div>
                  <span className="font-semibold text-xs text-slate-100 block mt-1">
                    {emo.name}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {emo.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intensity Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Intensity Level:
            </span>
            <span className="font-bold text-slate-200 font-mono">
              {intensity} / 10
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setIntensity(lvl)}
                className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  intensity === lvl
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Mode 1: Write Micro-reflection */}
        {mode === 'write' && (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={microText}
              onChange={(e) => setMicroText(e.target.value)}
              placeholder="Optional: what's present right now? (Or click log below for instant entry)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {/* Mode 2: Voice Dictation */}
        {mode === 'voice' && (
          <div className="space-y-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>Spoken Micro Reflection:</span>
                </span>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-rose-400" />
                      <span>Record Speech</span>
                    </>
                  )}
                </button>
              </div>

              {/* Transcript display */}
              <div className="min-h-[44px] text-xs text-slate-300 font-sans leading-relaxed">
                {speechTranscript ? (
                  <span>{speechTranscript}</span>
                ) : interimSpeech ? (
                  <span className="italic text-slate-400">{interimSpeech}...</span>
                ) : (
                  <span className="text-slate-600 italic">
                    Tap "Record Speech" to dictate your quick entry...
                  </span>
                )}
              </div>
            </div>

            {speechError && (
              <span className="text-[11px] text-rose-400 block font-mono">
                {speechError}
              </span>
            )}
          </div>
        )}

        {/* Action Button: One Click Log */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSubmitCurrentMode}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Log {selectedEmotion.name} ({intensity}/10) Now
                </span>
              </>
            )}
          </button>

          {/* Quick Clear */}
          {(microText || speechTranscript) && (
            <button
              type="button"
              onClick={() => {
                setMicroText('');
                setSpeechTranscript('');
                setInterimSpeech('');
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs"
              title="Clear text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // If used inline (non-floating)
  if (!floating) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        {justLoggedSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{justLoggedSuccess} — saved with live biometrics!</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                Single-Click Logger
              </span>
              <h3 className="font-serif font-bold text-slate-100 text-base sm:text-lg">
                Quick Mood & Quick Entry
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Record your current state with a single click without opening the full editor modal.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs self-start">
            <button
              type="button"
              onClick={() => setMode('write')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'write'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('voice')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'voice'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('call')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'call'
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>
          </div>
        </div>

        {renderModeContent()}
      </div>
    );
  }

  // Floating Dock Widget on the bottom-right
  return (
    <aside aria-label="Quick Entry Console" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {justLoggedSuccess && (
        <div className="mb-2 px-3.5 py-2 bg-slate-900 border border-emerald-500/50 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{justLoggedSuccess}</span>
        </div>
      )}

      {/* Expanded Quick Entry Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-serif font-bold text-slate-100 text-sm">
                Quick Entry Console
              </h3>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setMode('write')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'write' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Write Mode"
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setMode('voice')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'voice' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Voice Mode"
              >
                Voice
              </button>
              <button
                type="button"
                onClick={() => setMode('call')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'call' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Call Mode"
              >
                Call
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderModeContent()}
        </div>
      )}

      {/* Floating Trigger Dock Button */}
      {!isOpen && (
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 hover:bg-slate-900 border border-indigo-500/40 hover:border-indigo-400 rounded-full shadow-2xl backdrop-blur-xl transition-all group">
          <button
            type="button"
            onClick={() => {
              setMode('write');
              setIsOpen(true);
            }}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Quick Mood</span>
          </button>

          <div className="h-4 w-px bg-slate-700" />

          {/* Quick Voice Icon Button */}
          <button
            type="button"
            onClick={() => {
              setMode('voice');
              setIsOpen(true);
            }}
            title="Quick Voice Mode"
            className="p-2 rounded-full hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Quick Call Icon Button */}
          <button
            type="button"
            onClick={() => {
              onOpenCallMode();
            }}
            title="Launch Call Mode"
            className="p-2 rounded-full hover:bg-slate-800 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
};
