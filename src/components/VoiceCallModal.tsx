import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  HeartPulse,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CallModeMessage, CallModeFinalizedSummary, EmotionSelection, MoodEntry } from '../types/journal';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmotion?: EmotionSelection | null;
  onFinalizeEntry: (entryData: Omit<MoodEntry, 'id'>) => Promise<void>;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  selectedEmotion,
  onFinalizeEntry,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Transcript & Dynamics
  const [messages, setMessages] = useState<CallModeMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      speakerName: 'AI Guide',
      text: "Hello. I'm here with you. Take a comfortable breath, and speak freely about whatever you are feeling, experiencing, or holding right now.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [latestAiTip, setLatestAiTip] = useState<string>(
    'Let your shoulders drop and let your speech flow without needing to edit your thoughts.'
  );
  const [detectedEmotions, setDetectedEmotions] = useState<string[]>([
    selectedEmotion?.primary || 'Present',
  ]);
  const [somaticObservations, setSomaticObservations] = useState<string[]>([
    'Vocalizing sensations',
  ]);
  const [showTranscript, setShowTranscript] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimSpeech]);

  // Call timer
  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Speech Synthesis Helper
  const speakText = (text: string) => {
    if (!speakerEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select gentle natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Google US English') ||
            v.name.includes('Karen') ||
            v.name.includes('Serena'))
      );
      if (preferred) utterance.voice = preferred;

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Initial welcome speech
  useEffect(() => {
    if (isOpen && speakerEnabled) {
      const initialTimer = setTimeout(() => {
        speakText(
          "Hello. I'm here with you. Take a comfortable breath, and speak freely about whatever you are feeling, experiencing, or holding right now."
        );
      }, 700);
      return () => clearTimeout(initialTimer);
    }
  }, [isOpen, speakerEnabled]);

  // Send turn to backend AI
  const handleSendTurn = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    const userMsg: CallModeMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      speakerName: 'You',
      text: spokenText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInterimSpeech('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/call-mode-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          latestSpokenText: spokenText.trim(),
          selectedEmotion: selectedEmotion?.primary,
          somaticSensations: somaticObservations,
        }),
      });

      const data = await res.json();
      const aiResponse =
        data.assistantResponse ||
        'I hear you. Take a gentle breath. What feels most important beneath those words?';

      const aiMsg: CallModeMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        speakerName: 'AI Guide',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.groundingTip) setLatestAiTip(data.groundingTip);
      if (data.detectedEmotion && !detectedEmotions.includes(data.detectedEmotion)) {
        setDetectedEmotions((prev) => [...prev, data.detectedEmotion]);
      }
      if (data.somaticCues && Array.isArray(data.somaticCues)) {
        setSomaticObservations((prev) => Array.from(new Set([...prev, ...data.somaticCues])));
      }

      speakText(aiResponse);
    } catch (err) {
      console.warn('Call Mode turn notice:', err);
      const fallback =
        'I hear you completely. When you state that, what bodily sensation or need is most present?';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-fallback`,
          role: 'assistant',
          speakerName: 'AI Guide',
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakText(fallback);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Initialize Web Speech Recognition
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
          handleSendTurn(finalChunk.trim());
          setInterimSpeech('');
        } else {
          setInterimSpeech(interimChunk);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Call Mode speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access denied. Please allow microphone access in your browser.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Speech status: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && !isMuted) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;

      if (isOpen && !isMuted) {
        try {
          recognition.start();
          setIsListening(true);
          isListeningRef.current = true;
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to init speech in call mode:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Toggle Mute
  const toggleMute = () => {
    if (!recognitionRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {}
    } else {
      setIsMuted(true);
      isListeningRef.current = false;
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch {}
    }
  };

  // Toggle Speaker
  const toggleSpeaker = () => {
    if (speakerEnabled) {
      setSpeakerEnabled(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setSpeakerEnabled(true);
    }
  };

  // Finalize Call and Save into Journal
  const handleFinalizeCall = async () => {
    setIsFinalizing(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const transcriptPayload = messages.map((m) => ({
        speaker: m.speakerName,
        text: m.text,
      }));

      const res = await fetch('/api/call-mode-finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptPayload,
          selectedEmotion: selectedEmotion?.primary,
        }),
      });

      const summary: CallModeFinalizedSummary = await res.json();
      const now = new Date();

      await onFinalizeEntry({
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        primaryEmotion: summary.primaryEmotion || selectedEmotion?.primary || 'Peaceful',
        secondaryEmotion: summary.secondaryEmotion || 'Reflective',
        intensity: summary.intensity || 6,
        emotionColor: selectedEmotion?.node.color || '#3b82f6',
        promptUsed: `Live Voice Call Reflection (${Math.floor(callDuration / 60)}m ${callDuration % 60}s)`,
        journalText: summary.fullJournalText,
        somaticSensations: summary.somaticSensations || somaticObservations,
        tags: [
          'Voice Call Mode',
          summary.primaryEmotion || 'Reflective',
          'Spoken Transcription',
        ],
        aiReflection: `Breakthrough: ${summary.keyBreakthrough}\n\n💡 Insight: ${summary.compassionateInsight}\n\n🌱 Next Step: ${summary.recommendedNextMicroAction}`,
        sentimentAnalysis: {
          valence: 'Positive',
          score: 0.75,
          emotionTags: [summary.primaryEmotion, summary.secondaryEmotion],
          themeTags: ['Voice Reflection', 'Emotional Grounding'],
        },
      });

      onClose();
    } catch (err) {
      console.warn('Failed to finalize call:', err);
      // Fallback save
      const now = new Date();
      const userSpoken = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.text)
        .join('\n\n');

      await onFinalizeEntry({
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        primaryEmotion: selectedEmotion?.primary || 'Peaceful',
        secondaryEmotion: 'Reflective',
        intensity: 6,
        emotionColor: selectedEmotion?.node.color || '#3b82f6',
        promptUsed: 'Live Voice Call Session',
        journalText: userSpoken || 'Spoken journal reflection from Call Mode.',
        somaticSensations: somaticObservations,
        tags: ['Voice Call Mode', 'Spoken Journal'],
      });
      onClose();
    } finally {
      setIsFinalizing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 relative z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-sm">
                  Voice Journal Call Mode
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  Interactive AI Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Duration: {formatTime(callDuration)} · Speaks back in real time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeaker}
              title={speakerEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
              className={`p-2 rounded-xl border transition-colors ${
                speakerEnabled
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              {speakerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Center Experience */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-6 relative z-10">
          {/* Animated Pulsing Voice Orb */}
          <div className="relative flex items-center justify-center my-4">
            {/* Outer ripples */}
            <div
              className={`absolute w-44 h-44 rounded-full border border-indigo-500/20 transition-transform duration-1000 ${
                isListening ? 'scale-125 animate-pulse' : 'scale-100 opacity-30'
              }`}
            />
            <div
              className={`absolute w-36 h-36 rounded-full border border-purple-500/30 transition-transform duration-700 ${
                isListening ? 'scale-110 animate-ping opacity-20' : 'scale-90 opacity-20'
              }`}
            />

            {/* Core Orb */}
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                isAiThinking
                  ? 'bg-gradient-to-tr from-amber-600 to-indigo-600 ring-4 ring-amber-400/30 animate-pulse'
                  : isListening
                  ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 ring-4 ring-indigo-400/40 shadow-indigo-500/30'
                  : 'bg-slate-800 ring-2 ring-slate-700 text-slate-500'
              }`}
            >
              {isAiThinking ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : isListening ? (
                <Mic className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <MicOff className="w-10 h-10 text-slate-400" />
              )}
            </div>
          </div>

          {/* Current State Indicator */}
          <div className="text-center space-y-1 max-w-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
              {isAiThinking
                ? 'AI Companion is processing & reflecting...'
                : isListening
                ? 'Listening to your voice... Speak freely'
                : 'Microphone Muted'}
            </span>
            <p className="text-sm font-medium text-slate-200 font-serif leading-snug">
              {interimSpeech ? `"${interimSpeech}..."` : latestAiTip}
            </p>
          </div>

          {/* Error Banner */}
          {speechError && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 text-center max-w-md">
              {speechError}
            </div>
          )}

          {/* Live Extracted Nuances (Emotions & Somatics) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Emotions: {detectedEmotions.slice(-3).join(', ')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-mono">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>Somatic Cues: {somaticObservations.slice(-2).join(', ')}</span>
            </div>
          </div>

          {/* Transcript Toggle & View */}
          <div className="w-full max-w-md">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-xs text-slate-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Call Transcript ({messages.length} exchanges)</span>
              </div>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTranscript && (
              <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl max-h-48 overflow-y-auto space-y-2 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl ${
                      m.role === 'user'
                        ? 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-100 ml-4'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                      <span className="font-semibold text-slate-400">{m.speakerName}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-6 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>

            {/* Quick manual speech send fallback if browser doesn't automatically fire final event */}
            {interimSpeech && (
              <button
                onClick={() => handleSendTurn(interimSpeech)}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
              >
                Send Voice Turn
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel Call
            </button>

            <button
              onClick={handleFinalizeCall}
              disabled={isFinalizing || messages.length <= 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Journal...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>End & Save to Journal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
