import React from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Wind,
  PhoneCall,
  X,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TriggerWarningModalProps {
  isOpen: boolean;
  cravingLevel: number;
  haltTriggers: string[];
  snippet?: string;
  onLaunchUrgeSurf: () => void;
  onDismiss: () => void;
  onOpenRecoveryHub: () => void;
}

export const TriggerWarningModal: React.FC<TriggerWarningModalProps> = ({
  isOpen,
  cravingLevel,
  haltTriggers,
  snippet,
  onLaunchUrgeSurf,
  onDismiss,
  onOpenRecoveryHub,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/25 px-2 py-0.5 rounded-full">
                  Clinical Safety Overlay
                </span>
                <span className="text-xs font-bold text-amber-100">
                  Urge Level: {cravingLevel}/10
                </span>
              </div>
              <h3 className="text-lg font-bold font-serif-heading text-white mt-0.5">
                High-Risk Craving & Trigger State Detected
              </h3>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-700">
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            You just logged a journal reflection with elevated urge intensity or somatic vulnerability triggers.
            Neurochemically, cravings crest and naturally subside within <strong className="text-slate-900">3 minutes</strong> when observed with somatic grounding.
          </p>

          {/* Active HALT triggers if any */}
          {haltTriggers.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Relapse Vulnerabilities (HALT):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {haltTriggers.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-amber-200/70 text-amber-900 text-xs font-bold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Somatic Recommendations */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">❄️ Mammalian Dive Reflex</span>
              <p className="text-[11px] text-slate-500">
                Splash ice-cold water on your face for 30s to drop heart rate 10-15 bpm immediately.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px]">💧 Physiological Hydration</span>
              <p className="text-[11px] text-slate-500">
                Drink a tall glass of sparkling water with citrus to satisfy tactile hand-to-mouth loops.
              </p>
            </div>
          </div>

          {/* Primary Action Button: Launch Grounding Bar */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onLaunchUrgeSurf();
                onDismiss();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Wind className="w-4 h-4 text-emerald-200" />
              <span>Launch 3-Minute Urge Surfing Grounding</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => {
                  onOpenRecoveryHub();
                  onDismiss();
                }}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 transition-colors"
              >
                <span>Open Sobriety Hub & Lifelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                I Feel Grounded (Dismiss)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
