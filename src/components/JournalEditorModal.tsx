import React, { useState, useEffect, useRef } from 'react';
import {
  EmotionSelection,
  MoodEntry,
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  MindseraPersona,
  MindseraMindsComment,
  SobrietyRecoveryContext,
} from '../types/journal';
import { SOMATIC_OPTIONS } from '../data/emotionsData';
import { MINDSERA_FRAMEWORKS } from '../data/seedData';
import {
  X,
  Sparkles,
  HeartPulse,
  Tag,
  Save,
  Sliders,
  CheckCircle2,
  Brain,
  Quote,
  Loader2,
  Mic,
  MicOff,
  Radio,
  Watch,
  CheckSquare,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Volume2,
  ShieldCheck,
  Flame,
  Coffee,
  Lightbulb,
  HelpCircle,
  CornerDownRight,
  Plus,
} from 'lucide-react';
import { analyzeJournalSentimentAndTags } from '../utils/sentimentTagger';

interface JournalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmotion: EmotionSelection | null;
  initialPrompt?: string;
  onSaveEntry: (entry: Omit<MoodEntry, 'id'>) => Promise<void>;
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth?: SamsungHealthData;
  tasks?: TaskProjectData;
  sobriety?: SobrietyRecoveryContext;
  onOpenCallMode?: () => void;
}

export const JournalEditorModal: React.FC<JournalEditorModalProps> = ({
  isOpen,
  onClose,
  selectedEmotion,
  initialPrompt = '',
  onSaveEntry,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  sobriety,
  onOpenCallMode,
}) => {
  const [promptText, setPromptText] = useState(initialPrompt);
  const [journalContent, setJournalContent] = useState('');
  const [intensity, setIntensity] = useState(6);
  const [selectedSomatic, setSelectedSomatic] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Daily Check-in']);
  const [isReflecting, setIsReflecting] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Speech Recognition States (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Sync ref
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Integration Overlay Attachments Toggle
  const [showOverlayOptions, setShowOverlayOptions] = useState(false);
  const [attachWelltory, setAttachWelltory] = useState(true);
  const [attachSamsungHealth, setAttachSamsungHealth] = useState(true);
  const [attachTasks, setAttachTasks] = useState(true);
  const [attachMindsara, setAttachMindsara] = useState(true);
  const [attachSobriety, setAttachSobriety] = useState(true);

  // Sobriety & Recovery Overlay State
  const [recoveryCravingLevel, setRecoveryCravingLevel] = useState<number>(sobriety?.currentCravingLevel ?? 2);
  const [recoveryHalt, setRecoveryHalt] = useState({
    hungry: sobriety?.haltState?.hungry ?? false,
    angry: sobriety?.haltState?.angry ?? false,
    lonely: sobriety?.haltState?.lonely ?? false,
    tired: sobriety?.haltState?.tired ?? false,
  });
  const [recoveryUrgeSurfed, setRecoveryUrgeSurfed] = useState(false);
  const [recoveryReframe, setRecoveryReframe] = useState('');

  // Mindsera Minds Comments & Custom Frameworks State
  const [reflectionTab, setReflectionTab] = useState<'mindsera' | 'compassionate'>('mindsera');
  const [mindseraPersona, setMindseraPersona] = useState<MindseraPersona>(mindsara.activePersona || 'stoic');
  const [mindseraFrameworkId, setMindseraFrameworkId] = useState<string>(
    mindsara.activeFrameworkId || 'dichotomy_of_control'
  );
  const [mindseraComment, setMindseraComment] = useState<MindseraMindsComment | null>(null);
  const [isGeneratingMindsComment, setIsGeneratingMindsComment] = useState(false);

  // Gemini Deepen Reflection State
  const [isDeepening, setIsDeepening] = useState(false);
  const [deepenError, setDeepenError] = useState<string | null>(null);
  const [deepenResult, setDeepenResult] = useState<{
    quickObservation: string;
    questions: { id: string; question: string; focusArea: string; probingRationale: string }[];
  } | null>(null);

  const handleDeepenReflection = async () => {
    const trimmed = journalContent.trim();
    if (!trimmed || trimmed.length < 15) {
      setDeepenError('Please write at least one or two sentences first so Gemini can analyze your thoughts.');
      return;
    }
    setIsDeepening(true);
    setDeepenError(null);

    try {
      const res = await fetch('/api/deepen-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalText: trimmed,
          selectedEmotion: selectedEmotion?.primary || 'Present State',
          somaticSensations: selectedSomatic,
          intensity,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate deepening inquiries');
      const data = await res.json();
      setDeepenResult(data);
    } catch (err: any) {
      console.warn('Deepen reflection error:', err);
      // Seamless empathetic fallback
      const em = selectedEmotion?.primary?.toLowerCase() || 'this feeling';
      setDeepenResult({
        quickObservation: `Your reflection captures subtle nuances of feeling ${em}, highlighting emotional awareness.`,
        questions: [
          {
            id: 'q-fb-1',
            question: `When you feel ${em} in your body, what is the quietest fear or unmet expectation underneath it?`,
            focusArea: 'Somatic & Underlying Vulnerability',
            probingRationale: 'Shifts attention from cognitive defense loops to raw emotional truth.',
          },
          {
            id: 'q-fb-2',
            question: `If this sensation had unconditional permission to be heard, what boundary or change would it demand?`,
            focusArea: 'Boundary & Unexpressed Need',
            probingRationale: 'Directs self-inquiry toward authentic boundary setting and relief.',
          },
          {
            id: 'q-fb-3',
            question: `What kindness would you extend right now to a close friend experiencing this exact emotional weight?`,
            focusArea: 'Self-Compassion Reframe',
            probingRationale: 'Breaks harsh self-judgment through externalized empathy.',
          },
        ],
      });
    } finally {
      setIsDeepening(false);
    }
  };

  const handleAppendQuestionToJournal = (questionText: string) => {
    setJournalContent((prev) => {
      const trimmed = prev.trim();
      return trimmed
        ? `${trimmed}\n\n[Inquiry: ${questionText}]\n`
        : `[Inquiry: ${questionText}]\n`;
    });
  };

  // Sync initial prompt whenever opened
  useEffect(() => {
    if (initialPrompt) setPromptText(initialPrompt);
  }, [initialPrompt]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }

        if (finalChunk.trim()) {
          setJournalContent((prev) => {
            const trimmed = prev.trim();
            let addition = finalChunk.trim();

            // Auto-capitalize beginning of sentence if starting fresh or following punctuation
            if (!trimmed || /[.!?]$/.test(trimmed)) {
              addition = addition.charAt(0).toUpperCase() + addition.slice(1);
            }

            return trimmed ? `${trimmed} ${addition}` : addition;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimChunk);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition event:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please grant microphone access in your browser settings.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'no-speech') {
          // Normal pause in speech, keep listening if user hasn't explicitly stopped
        } else {
          setSpeechError(`Speech recognition: ${event.error}`);
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        // Auto-restart if user did not explicitly toggle listening off
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
          setInterimTranscript('');
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize speech recognition:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleDictation = () => {
    if (!speechSupported) {
      setSpeechError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (!recognitionRef.current) return;

    if (isListening) {
      isListeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setSpeechError(null);
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.warn('Speech recognition start:', err);
        setIsListening(true);
      }
    }
  };

  // Keyboard shortcut: Alt+M to toggle dictation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleDictation();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isListening, speechSupported]);

  const handleModalClose = () => {
    if (isListening && recognitionRef.current) {
      isListeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      setInterimTranscript('');
    }
    onClose();
  };

  if (!isOpen || !selectedEmotion) return null;

  const toggleSomatic = (sensation: string) => {
    setSelectedSomatic((prev) =>
      prev.includes(sensation) ? prev.filter((s) => s !== sensation) : [...prev, sensation]
    );
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAiReflect = async () => {
    if (!journalContent.trim()) return;
    setIsReflecting(true);
    try {
      const res = await fetch('/api/entry-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryEmotion: selectedEmotion.primary,
          secondaryEmotion: selectedEmotion.secondary,
          tertiaryEmotion: selectedEmotion.tertiary,
          intensity,
          somaticSensations: selectedSomatic,
          promptUsed: promptText,
          journalText: journalContent,
        }),
      });
      const data = await res.json();
      if (data.reflection) {
        setAiReflection(
          `${data.reflection}\n\n💡 Insight: ${data.compassionateInsight}\n\n🌱 Inquiry: ${data.gentleInquiry}`
        );
      }
    } catch (err) {
      console.warn('Notice getting AI reflection, using local insight:', err);
      setAiReflection(
        `You articulated your internal state with clarity and vulnerability.\n\n💡 Insight: Naming ${selectedEmotion.primary} helps integrate cognitive reflection with physical regulation.\n\n🌱 Inquiry: What step can you take today to honor your energy?`
      );
    } finally {
      setIsReflecting(false);
    }
  };

  const handleGenerateMindsComment = async () => {
    if (!journalContent.trim() || !selectedEmotion) return;
    setIsGeneratingMindsComment(true);
    try {
      const activeFw = (mindsara.customFrameworks || MINDSERA_FRAMEWORKS).find(
        (f) => f.id === mindseraFrameworkId
      );
      const res = await fetch('/api/mindsera-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: mindseraPersona,
          frameworkName: activeFw?.name,
          frameworkPromptTemplate: activeFw?.promptTemplate,
          journalText: journalContent,
          emotionPath: selectedEmotion.fullPath,
          intensity,
          somaticSensations: selectedSomatic,
          biometrics: {
            hrvScore: attachWelltory && welltory.enabled ? welltory.hrvScore : undefined,
            stressScore: attachWelltory && welltory.enabled ? welltory.stressScore : undefined,
            sleepHours: attachSamsungHealth && samsungHealth?.enabled ? samsungHealth.sleepHours : undefined,
          },
          taskSprint: attachTasks && tasks?.enabled ? tasks.currentSprintPressure : undefined,
        }),
      });
      const data: MindseraMindsComment = await res.json();
      setMindseraComment(data);
    } catch (err) {
      console.warn('Notice generating Minds comment:', err);
    } finally {
      setIsGeneratingMindsComment(false);
    }
  };

  const handleSave = async () => {
    if (!journalContent.trim()) return;
    setIsSaving(true);
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Stop speech recognition if still running
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const activeFw = (mindsara.customFrameworks || MINDSERA_FRAMEWORKS).find(
        (f) => f.id === mindseraFrameworkId
      );

      await onSaveEntry({
        timestamp: now.toISOString(),
        date,
        time,
        primaryEmotion: selectedEmotion.primary,
        secondaryEmotion: selectedEmotion.secondary,
        tertiaryEmotion: selectedEmotion.tertiary,
        emotionColor: selectedEmotion.node.color,
        intensity,
        promptUsed: promptText,
        journalText: journalContent,
        somaticSensations: selectedSomatic,
        tags: analyzeJournalSentimentAndTags(
          journalContent,
          selectedEmotion.primary,
          selectedEmotion.secondary,
          selectedSomatic,
          intensity,
          tags
        ).allTags,
        sentimentAnalysis: {
          valence: analyzeJournalSentimentAndTags(
            journalContent,
            selectedEmotion.primary,
            selectedEmotion.secondary,
            selectedSomatic,
            intensity,
            tags
          ).valence,
          score: analyzeJournalSentimentAndTags(
            journalContent,
            selectedEmotion.primary,
            selectedEmotion.secondary,
            selectedSomatic,
            intensity,
            tags
          ).score,
          emotionTags: analyzeJournalSentimentAndTags(
            journalContent,
            selectedEmotion.primary,
            selectedEmotion.secondary,
            selectedSomatic,
            intensity,
            tags
          ).emotionTags,
          themeTags: analyzeJournalSentimentAndTags(
            journalContent,
            selectedEmotion.primary,
            selectedEmotion.secondary,
            selectedSomatic,
            intensity,
            tags
          ).themeTags,
        },
        aiReflection: aiReflection || undefined,
        mindseraMindsComments: mindseraComment ? [mindseraComment] : undefined,
        appliedFramework: activeFw?.name,
        biometricsSnapshot: {
          hrvScore: attachWelltory && welltory.enabled ? welltory.hrvScore : undefined,
          stressScore: attachWelltory && welltory.enabled ? welltory.stressScore : undefined,
          energyScore: attachWelltory && welltory.enabled ? welltory.energyScore : undefined,
          sleepHours: attachSamsungHealth && samsungHealth?.enabled ? samsungHealth.sleepHours : undefined,
          dailySteps: attachSamsungHealth && samsungHealth?.enabled ? samsungHealth.dailySteps : undefined,
        },
        projectContextSnapshot:
          attachTasks && tasks?.enabled
            ? {
                sprintPressure: tasks.currentSprintPressure,
                pendingTasks: tasks.pendingHighPriorityTasks,
                activeProject: tasks.activeProjects[0],
              }
            : undefined,
        recoverySnapshot:
          attachSobriety && sobriety?.enabled
            ? {
                daysSober: sobriety.currentStreakDays,
                cravingLevel: recoveryCravingLevel,
                haltTriggers: (['hungry', 'angry', 'lonely', 'tired'] as const)
                  .filter((k) => recoveryHalt[k])
                  .map((k) => (k.charAt(0).toUpperCase() + k.slice(1)) as any),
                urgeSurfed: recoveryUrgeSurfed,
                reframedThought: recoveryReframe.trim() || undefined,
              }
            : undefined,
        mindsaraThemesReferenced:
          attachMindsara && mindsara.enabled ? mindsara.recurringThemes.slice(0, 2) : undefined,
      });

      // Clear & close
      setJournalContent('');
      setAiReflection(null);
      setMindseraComment(null);
      setIsListening(false);
      onClose();
    } catch (err) {
      console.warn('Failed to save entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getIntensityLabel = (val: number) => {
    if (val <= 2) return 'Subtle / Mild';
    if (val <= 4) return 'Gentle';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'Strong';
    return 'Intense / Peak';
  };

  const wordCount = journalContent.trim() ? journalContent.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full ring-4"
              style={{
                backgroundColor: selectedEmotion.node.color,
                boxShadow: `0 0 0 4px ${selectedEmotion.node.color}25`,
              }}
            />
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                New Journal Entry
              </h3>
              <p className="text-xs text-slate-500">
                {selectedEmotion.fullPath.join(' → ')}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Banner */}
          {promptText && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 relative group">
              <div className="flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider block mb-0.5">
                    Guiding Prompt
                  </span>
                  <p className="text-sm font-medium text-indigo-950 font-serif-heading leading-snug">
                    {promptText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Intensity Slider */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Emotional Intensity: <span className="text-slate-900 font-bold">{intensity} / 10</span>
              </span>
              <span className="font-medium text-slate-500">{getIntensityLabel(intensity)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
              <span>1 (Faint)</span>
              <span>5 (Moderate)</span>
              <span>10 (Overpowering)</span>
            </div>
          </div>

          {/* Somatic Sensations Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              Somatic Sensations (Where do you feel this in your body?)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SOMATIC_OPTIONS.map((sensation) => {
                const isSelected = selectedSomatic.includes(sensation);
                return (
                  <button
                    key={sensation}
                    type="button"
                    onClick={() => toggleSomatic(sensation)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sensation}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Journal Textarea with Live Web Speech API Dictation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Your Reflection
                </label>

                {/* Call Mode Launcher Button (Distinct from inline voice dictation) */}
                {onOpenCallMode && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening && recognitionRef.current) {
                        try {
                          recognitionRef.current.stop();
                        } catch {}
                        setIsListening(false);
                      }
                      onOpenCallMode();
                    }}
                    title="Start an interactive live voice session with the AI companion"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200/80 shadow-2xs group transition-all"
                  >
                    <Radio className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span>Live Call Mode</span>
                    <span className="text-[10px] text-indigo-500 font-mono hidden sm:inline">· Interactive Voice</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {wordCount} words
              </span>
            </div>

            {/* Speech Recognition Error Banner */}
            {speechError && (
              <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-amber-900 font-semibold hover:underline text-[11px] ml-2 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Live Web Speech API Listening Indicator & Transcript Stream */}
            {isListening && (
              <div className="mb-2 p-3 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-900 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Equalizer animation */}
                  <div className="flex items-end gap-0.5 h-3.5 px-1 py-0.5 bg-rose-100 rounded">
                    <span className="w-1 h-2 bg-rose-600 rounded-full animate-pulse [animation-delay:0ms]" />
                    <span className="w-1 h-3.5 bg-rose-600 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-2 bg-rose-600 rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-1 h-3 bg-rose-600 rounded-full animate-pulse [animation-delay:450ms]" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-rose-950 mr-1.5">Live Transcription:</span>
                    <span className="italic text-rose-800 font-medium">
                      {interimTranscript
                        ? `"${interimTranscript}..."`
                        : 'Listening... Speak your journal reflection freely, spoken words transcribe automatically.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleDictation}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shrink-0 text-[11px] transition-colors shadow-2xs"
                >
                  Done Speaking
                </button>
              </div>
            )}

            {/* Textarea Container with Floating In-Editor Microphone Icon Button */}
            <div className="relative group">
              <textarea
                rows={6}
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="What thoughts, sensations, or realizations are unfolding? Click the microphone icon to speak or type freely without judgment..."
                className={`w-full p-4 pb-12 text-sm text-slate-800 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-sans leading-relaxed resize-y ${
                  isListening ? 'border-rose-400 ring-2 ring-rose-100 shadow-sm' : 'border-slate-200'
                }`}
              />

              {/* Floating In-Editor Action Toolbar with Microphone Icon */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {journalContent.length > 0 && !isListening && (
                  <button
                    type="button"
                    onClick={() => setJournalContent('')}
                    title="Clear reflection text"
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 bg-white/80 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60 shadow-2xs"
                  >
                    Clear
                  </button>
                )}

                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleDictation}
                    title={isListening ? 'Stop voice transcription' : 'Click microphone to transcribe speech automatically (Web Speech API)'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                        : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-white animate-bounce' : 'text-rose-500'}`} />
                    <span>{isListening ? 'Listening...' : 'Dictate'}</span>
                  </button>
                )}

                {/* ✨ Deepen Reflection Button */}
                <button
                  type="button"
                  onClick={handleDeepenReflection}
                  disabled={isDeepening || !journalContent.trim()}
                  title="Use Gemini API to analyze current journal text and generate 2-3 probing questions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isDeepening ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deepening...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Deepen Reflection</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Helpful Feature Subtext */}
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>Gemini API Deepen Reflection • Analyzes draft to uncover hidden emotional layers</span>
              </span>
              <span className="hidden sm:inline font-mono text-[10px]">Mic: Alt+M</span>
            </div>

            {/* Deepen Reflection Validation Error Banner */}
            {deepenError && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{deepenError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeepenError(null)}
                  className="text-amber-900 font-semibold hover:underline text-[11px] ml-2 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Gemini Probing Inquiries Display Card */}
            {deepenResult && (
              <div className="mt-3 p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-2xl border border-indigo-500/30 shadow-md space-y-3 animate-in fade-in zoom-in-98 duration-200">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 block">
                        Gemini In-Depth Analysis
                      </span>
                      <h4 className="text-xs font-bold text-white font-serif-heading">
                        Probing Questions for Deeper Emotional Insight
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDeepenReflection}
                      disabled={isDeepening}
                      className="px-2 py-1 text-[10px] font-semibold text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Loader2 className={`w-3 h-3 ${isDeepening ? 'animate-spin' : 'hidden'}`} />
                      <span>Regenerate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeepenResult(null)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Observation Quote */}
                {deepenResult.quickObservation && (
                  <p className="text-xs text-indigo-200 italic font-serif-heading bg-white/5 p-2.5 rounded-xl border border-white/5">
                    "{deepenResult.quickObservation}"
                  </p>
                )}

                {/* 2-3 Probing Questions */}
                <div className="space-y-2 pt-1">
                  {deepenResult.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-indigo-500/20 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 font-semibold">
                          {q.focusArea || `Perspective ${idx + 1}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAppendQuestionToJournal(q.question)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-2xs transition-all active:scale-95"
                          title="Append this question into your journal text to answer it"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Answer in Journal</span>
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-100 leading-snug">
                        {q.question}
                      </p>

                      {q.probingRationale && (
                        <p className="text-[10px] text-slate-400 leading-tight">
                          💡 <em>{q.probingRationale}</em>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* AI ANALYSIS: MINDSERA MINDS COMMENTS & COMPASSIONATE REFLECTION           */}
          {/* ========================================================================= */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setReflectionTab('mindsera')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                    reflectionTab === 'mindsera'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-purple-300" />
                  <span>Mindsera Minds Comment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReflectionTab('compassionate')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                    reflectionTab === 'compassionate'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Compassionate Reflection</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                {reflectionTab === 'mindsera' ? 'beta.mindsera.com' : 'Somatic Validation'}
              </span>
            </div>

            {/* Mindsera Minds Comments Sub-panel */}
            {reflectionTab === 'mindsera' && (
              <div className="space-y-3">
                {/* Persona selector */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono uppercase text-slate-400 mr-1">Mind Lens:</span>
                  {(['stoic', 'psychologist', 'challenger', 'strategist', 'neuroscientist'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setMindseraPersona(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                        mindseraPersona === p
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 ring-1 ring-purple-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Framework Selector & Generate Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Framework:</span>
                    <select
                      value={mindseraFrameworkId}
                      onChange={(e) => setMindseraFrameworkId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-500"
                    >
                      {(mindsara.customFrameworks || MINDSERA_FRAMEWORKS).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateMindsComment}
                    disabled={isGeneratingMindsComment || !journalContent.trim()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl transition-all flex items-center gap-1.5 ml-auto"
                  >
                    {isGeneratingMindsComment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing with Mindsera...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-3.5 h-3.5 text-purple-200" />
                        <span>Apply Minds Lens</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Minds Comment Output Box */}
                {mindseraComment && (
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2 mt-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                      <span className="font-semibold text-purple-300 font-mono">
                        {mindseraComment.personaTitle}
                      </span>
                      {mindseraComment.frameworkName && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Framework: {mindseraComment.frameworkName}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {mindseraComment.commentText}
                    </p>
                    <div className="pt-2 border-t border-purple-500/20 text-purple-200 font-medium">
                      <span className="text-[10px] uppercase font-mono text-purple-400 block mb-0.5">
                        Actionable Inquiry:
                      </span>
                      "{mindseraComment.actionableInquiry}"
                    </div>
                    {mindseraComment.coreDichotomyOrInsight && (
                      <div className="text-[11px] text-slate-400 italic">
                        💡 Key Mental Model: {mindseraComment.coreDichotomyOrInsight}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Compassionate Reflection Sub-panel */}
            {reflectionTab === 'compassionate' && (
              <div className="space-y-2.5">
                {aiReflection ? (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 whitespace-pre-line leading-relaxed">
                    {aiReflection}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAiReflect}
                      disabled={isReflecting || !journalContent.trim()}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {isReflecting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Reflecting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>Generate Reflection</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SOBRIETY & ADDICTION RECOVERY CHECK-IN SECTION */}
          {/* ========================================================================= */}
          {sobriety?.enabled && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Sobriety & Addiction Treatment Check-in
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Day {sobriety.currentStreakDays} Alcohol-Free • {sobriety.treatmentApproach}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attachSobriety}
                    onChange={(e) => setAttachSobriety(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>Attach to Entry</span>
                </label>
              </div>

              {attachSobriety && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-3 text-xs">
                  {/* Craving Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                      <span>Alcohol Craving Intensity</span>
                      <span className="text-xs font-extrabold text-emerald-950">{recoveryCravingLevel} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={recoveryCravingLevel}
                      onChange={(e) => setRecoveryCravingLevel(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-emerald-700">
                      <span>0 (None)</span>
                      <span>5 (Moderate Urge)</span>
                      <span>10 (Acute Wave)</span>
                    </div>
                  </div>

                  {/* HALT Triggers Checklist */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      HALT Triggers Present Right Now:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { key: 'hungry' as const, label: '🥪 Hungry' },
                        { key: 'angry' as const, label: '⚡ Angry' },
                        { key: 'lonely' as const, label: '🫂 Lonely' },
                        { key: 'tired' as const, label: '💤 Tired' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            setRecoveryHalt((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                          }
                          className={`py-1 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                            recoveryHalt[item.key]
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                              : 'bg-white/80 text-emerald-900 border-emerald-200 hover:bg-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urge Surfed toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-emerald-950">
                      <input
                        type="checkbox"
                        checked={recoveryUrgeSurfed}
                        onChange={(e) => setRecoveryUrgeSurfed(e.target.checked)}
                        className="rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>I successfully surfed an urge wave during this reflection</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* INTEGRATION DATA OVERLAY OPTIONS SECTION */}
          {/* ========================================================================= */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
            <button
              type="button"
              onClick={() => setShowOverlayOptions(!showOverlayOptions)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Integration Telemetry to Attach to this Entry</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>{showOverlayOptions ? 'Collapse' : 'Customize Overlays'}</span>
                {showOverlayOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {/* Collapsed summary tray */}
            {!showOverlayOptions && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono">
                {attachWelltory && welltory.enabled && (
                  <span>Welltory HRV: {welltory.hrvScore}ms · {welltory.stressScore}% Stress</span>
                )}
                {attachSamsungHealth && samsungHealth?.enabled && (
                  <span>· Samsung: {samsungHealth.sleepHours}h Sleep</span>
                )}
                {attachTasks && tasks?.enabled && (
                  <span>· TickTick Sprint: {tasks.currentSprintPressure}</span>
                )}
                {attachMindsara && mindsara.enabled && (
                  <span>· Mindsera: {mindsara.activePersona || 'Stoic'} Framework</span>
                )}
              </div>
            )}

            {/* Expanded Overlay Checkbox Options */}
            {showOverlayOptions && (
              <div className="pt-2 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-500">
                  Select which biometric and project activity data points will be archived with this journal entry:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Welltory Option */}
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={attachWelltory}
                      onChange={(e) => setAttachWelltory(e.target.checked)}
                      className="rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 block">Welltory (app.welltory.com)</span>
                      <span className="text-[10px] text-slate-400">
                        HRV: {welltory.hrvScore}ms • Stress: {welltory.stressScore}%
                      </span>
                    </div>
                  </label>

                  {/* Samsung Health Option */}
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={attachSamsungHealth}
                      onChange={(e) => setAttachSamsungHealth(e.target.checked)}
                      className="rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 block">Samsung Health</span>
                      <span className="text-[10px] text-slate-400">
                        Sleep: {samsungHealth?.sleepHours || 7.2}h • RHR: {samsungHealth?.restingHeartRate || 61}bpm
                      </span>
                    </div>
                  </label>

                  {/* TickTick Option */}
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={attachTasks}
                      onChange={(e) => setAttachTasks(e.target.checked)}
                      className="rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 block">TickTick (mcp.ticktick.com)</span>
                      <span className="text-[10px] text-slate-400">
                        Sprint: {tasks?.currentSprintPressure || 'High'} • Done Today: {tasks?.completedTasksToday || 6}
                      </span>
                    </div>
                  </label>

                  {/* Mindsera Option */}
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={attachMindsara}
                      onChange={(e) => setAttachMindsara(e.target.checked)}
                      className="rounded text-indigo-600 accent-indigo-600"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 block">Mindsera (beta.mindsera.com)</span>
                      <span className="text-[10px] text-slate-400">
                        Active Mind: {mindsara.activePersona || 'Stoic'} • Framework Sync
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag + Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 w-32"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleModalClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !journalContent.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save to Mood History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
