import React from 'react';
import { SobrietyRecoveryContext } from '../types/journal';
import {
  ShieldCheck,
  Flame,
  Award,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HeartPulse,
  DollarSign,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

interface SobrietyTrackerCardProps {
  sobriety: SobrietyRecoveryContext;
  onUpdateSobriety: (updated: SobrietyRecoveryContext) => void;
  onOpenRecoveryHub: () => void;
  onOpenUrgeSurfing?: () => void;
}

export const SobrietyTrackerCard: React.FC<SobrietyTrackerCardProps> = ({
  sobriety,
  onUpdateSobriety,
  onOpenRecoveryHub,
  onOpenUrgeSurfing,
}) => {
  const currentStreak = sobriety.currentStreakDays || 43;

  // Find next milestone
  const milestones = sobriety.healthMilestones || [];
  const achievedMilestones = milestones.filter((m) => currentStreak >= m.days);
  const nextMilestone =
    milestones.find((m) => currentStreak < m.days) || {
      days: 365,
      title: 'Full Year of Sobriety',
      scientificImpact: 'Lasting cardiovascular and psychological transformation.',
      achieved: false,
    };

  // Previous milestone threshold for ring calculation
  const prevMilestoneDays =
    achievedMilestones.length > 0 ? achievedMilestones[achievedMilestones.length - 1].days : 0;
  const progressRatio = Math.min(
    1,
    Math.max(0, (currentStreak - prevMilestoneDays) / Math.max(1, nextMilestone.days - prevMilestoneDays))
  );
  const progressPercent = Math.round(progressRatio * 100);

  // SVG Progress Ring calculations
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // HALT triggers count
  const activeHaltCount = Object.values(sobriety.haltState || {}).filter(Boolean).length;

  const handleQuickCravingUpdate = (level: number) => {
    onUpdateSobriety({
      ...sobriety,
      currentCravingLevel: level,
      lastCheckInTimestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden transition-all hover:shadow-md">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pb-6 border-b border-slate-100">
        {/* Left: Title & Editorial Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-slate-900 font-serif-heading">
              Sobriety & Recovery Tracker
            </h3>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {sobriety.treatmentApproach || 'SMART Recovery'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Clinical recovery tracker monitoring alcohol-free milestones, progressive neurobiological repair, and real-time urge surfing resilience.
          </p>
        </div>

        {/* Action Button: View Full Hub */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenRecoveryHub}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <span>Open Sobriety Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Progress Ring, Milestones, and Live Craving Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 relative z-10">
        {/* Col 1: Progress Ring & Days Count (4 cols) */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md">
          <div className="relative flex items-center justify-center w-36 h-36 my-2">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-white/10"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Foreground animated progress ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))',
                }}
              />
            </svg>

            {/* Inner Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {currentStreak}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-1">
                Days Alcohol-Free
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-semibold text-emerald-200 block">
              {progressPercent}% to Next Milestone
            </span>
            <span className="text-[11px] text-slate-400">
              Target: Day {nextMilestone.days} ({nextMilestone.days - currentStreak} days remaining)
            </span>
          </div>
        </div>

        {/* Col 2: Milestones Achieved & Next Target (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Milestones Achieved ({achievedMilestones.length})
              </span>
              <span className="text-xs font-medium text-slate-600">
                Next: <strong className="text-emerald-800">{nextMilestone.title}</strong>
              </span>
            </div>

            {/* Achieved Milestones List */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {achievedMilestones.slice(-4).map((m, idx, arr) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Day {m.days}: {m.title}
                  </span>
                  {idx < arr.length - 1 && (
                    <span className="text-slate-300 ml-1">·</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next Milestone Scientific Highlight */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Upcoming Target (Day {nextMilestone.days}):
              </span>
              <span className="text-[11px] font-semibold text-indigo-700">
                {nextMilestone.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {nextMilestone.scientificImpact}
            </p>
          </div>

          {/* Health Dividends Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/60 flex items-center justify-between">
              <span className="text-slate-600">Drinks Avoided:</span>
              <span className="font-extrabold text-teal-800">
                ~{sobriety.alcoholAvoidedUnits || 172} units
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
              <span className="text-slate-600">Money Saved:</span>
              <span className="font-extrabold text-amber-800">
                ${sobriety.moneySavedEstimated || 860}
              </span>
            </div>
          </div>
        </div>

        {/* Col 3: Live Craving Gauge & Urge Surfing Quick Trigger (3 cols) */}
        <div className="md:col-span-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Current Urge Level
              </span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  sobriety.currentCravingLevel >= 6
                    ? 'bg-rose-100 text-rose-800'
                    : sobriety.currentCravingLevel >= 3
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {sobriety.currentCravingLevel || 2} / 10
              </span>
            </div>

            {/* Quick 1-click update buttons */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[0, 2, 4, 7, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickCravingUpdate(val)}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    sobriety.currentCravingLevel === val
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {val === 0 ? 'None' : val}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>HALT Vulnerabilities:</span>
              <span
                className={`font-bold ${
                  activeHaltCount >= 2
                    ? 'text-rose-600'
                    : activeHaltCount === 1
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {activeHaltCount === 0 ? 'All Clear (0)' : `${activeHaltCount} Active`}
              </span>
            </div>
          </div>

          {/* Quick Urge Surfing Launch Action */}
          <button
            onClick={() => {
              if (onOpenUrgeSurfing) {
                onOpenUrgeSurfing();
              } else {
                onOpenRecoveryHub();
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Launch 3-Min Urge Surf</span>
          </button>
        </div>
      </div>
    </div>
  );
};
