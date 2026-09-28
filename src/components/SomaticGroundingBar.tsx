import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw, X, HeartPulse, Flame, ShieldCheck } from 'lucide-react';

interface SomaticGroundingBarProps {
  forceOpen?: boolean;
  initialMode?: 'vagal' | 'urge_surf';
  onCloseBar?: () => void;
}

export const SomaticGroundingBar: React.FC<SomaticGroundingBarProps> = ({
  forceOpen = false,
  initialMode = 'urge_surf',
  onCloseBar,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'vagal' | 'urge_surf'>(initialMode);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [countdown, setCountdown] = useState(4);
  const [isOpen, setIsOpen] = useState(forceOpen);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setIsActive(true);
      if (initialMode) setMode(initialMode);
    }
  }, [forceOpen, initialMode]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Advance phase
        if (phase === 'Inhale') {
          setPhase('Hold');
          return mode === 'urge_surf' ? 3 : 4;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return mode === 'urge_surf' ? 7 : 6; // slow exhale to surf craving wave
        } else if (phase === 'Exhale') {
          setPhase('Rest');
          return mode === 'urge_surf' ? 3 : 2;
        } else {
          setPhase('Inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, mode]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => {
            setMode('urge_surf');
            setIsOpen(true);
            setIsActive(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-900 text-white shadow-xl hover:bg-emerald-800 transition-all text-xs font-bold hover:scale-105 border border-emerald-500/40"
          title="Surf an alcohol craving wave"
        >
          <Flame className="w-4 h-4 text-emerald-400" />
          <span>Urge Surfing</span>
        </button>
        <button
          onClick={() => {
            setMode('vagal');
            setIsOpen(true);
            setIsActive(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all text-xs font-semibold hover:scale-105"
        >
          <Wind className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Vagal Reset</span>
        </button>
      </div>
    );
  }

  const getPhaseInstruction = () => {
    if (mode === 'urge_surf') {
      switch (phase) {
        case 'Inhale':
          return 'Breathe cool air into the craving knot...';
        case 'Hold':
          return 'Observe the urge sensation without judging...';
        case 'Exhale':
          return 'Slow sigh out... the craving wave peaks & fades...';
        case 'Rest':
          return 'Notice self-control returning...';
      }
    }
    switch (phase) {
      case 'Inhale':
        return 'Breathe in gently through the nose...';
      case 'Hold':
        return 'Hold softly, keeping shoulders down...';
      case 'Exhale':
        return 'Slow, smooth exhale through the mouth...';
      case 'Rest':
        return 'Rest in stillness...';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/90 w-84 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {mode === 'urge_surf' ? (
            <Flame className="w-4 h-4 text-emerald-500" />
          ) : (
            <Wind className="w-4 h-4 text-cyan-500" />
          )}
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {mode === 'urge_surf' ? 'Urge Surfing Protocol' : 'Vagal Physiological Reset'}
          </h4>
        </div>
        <button
          onClick={() => {
            setIsActive(false);
            setIsOpen(false);
            onCloseBar?.();
          }}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mt-2 text-[11px] font-semibold">
        <button
          onClick={() => {
            setMode('urge_surf');
            setPhase('Inhale');
            setCountdown(4);
          }}
          className={`flex-1 py-1 rounded-lg transition-all ${
            mode === 'urge_surf' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌊 Urge Surfing
        </button>
        <button
          onClick={() => {
            setMode('vagal');
            setPhase('Inhale');
            setCountdown(4);
          }}
          className={`flex-1 py-1 rounded-lg transition-all ${
            mode === 'vagal' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌬️ Vagal 4-7-8
        </button>
      </div>

      <div className="py-5 flex flex-col items-center justify-center space-y-4">
        {/* Animated Breathing Circle */}
        <div className="relative flex items-center justify-center w-28 h-28">
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              mode === 'urge_surf'
                ? phase === 'Inhale'
                  ? 'scale-115 bg-teal-100 border-2 border-teal-400'
                  : phase === 'Hold'
                  ? 'scale-115 bg-emerald-100 border-2 border-emerald-500'
                  : phase === 'Exhale'
                  ? 'scale-75 bg-amber-100 border-2 border-amber-400'
                  : 'scale-75 bg-slate-100 border-2 border-slate-300'
                : phase === 'Inhale'
                ? 'scale-110 bg-cyan-100 border-2 border-cyan-400'
                : phase === 'Hold'
                ? 'scale-110 bg-indigo-100 border-2 border-indigo-400'
                : phase === 'Exhale'
                ? 'scale-75 bg-amber-100 border-2 border-amber-400'
                : 'scale-75 bg-slate-100 border-2 border-slate-300'
            }`}
          />
          <div className="relative z-10 text-center">
            <span className="text-2xl font-bold text-slate-800 font-serif-heading">
              {countdown}s
            </span>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {phase}
            </span>
          </div>
        </div>

        <p className="text-xs text-center text-slate-600 h-8 px-2 leading-tight">
          {getPhaseInstruction()}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isActive ? 'Pause' : 'Resume'}</span>
        </button>
        <button
          onClick={() => {
            setPhase('Inhale');
            setCountdown(4);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

