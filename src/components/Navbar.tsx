import React from 'react';
import {
  Sparkles,
  PieChart,
  Brain,
  SlidersHorizontal,
  Plus,
  Heart,
  Globe,
  Activity,
  Layers,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  SobrietyRecoveryContext,
} from '../types/journal';

interface NavbarProps {
  activeView: 'wheel' | 'history' | 'patterns' | 'predictive' | 'recovery' | 'holistic';
  onChangeView: (view: 'wheel' | 'history' | 'patterns' | 'predictive' | 'recovery' | 'holistic') => void;
  onOpenCheckIn: () => void;
  onOpenIntegrations: () => void;
  welltory: WelltoryBiometrics;
  mindsara: MindsaraContext;
  samsungHealth: SamsungHealthData;
  tasks: TaskProjectData;
  sobriety?: SobrietyRecoveryContext;
  totalEntriesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onChangeView,
  onOpenCheckIn,
  onOpenIntegrations,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  sobriety,
  totalEntriesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          onClick={() => onChangeView('wheel')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base sm:text-lg text-slate-100 tracking-tight leading-tight">
                Feelings Wheel
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                AI Journal
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 hidden sm:flex font-mono">
              <span>Mindsera</span>
              <span className="text-slate-600">·</span>
              <span>Welltory</span>
              <span className="text-slate-600">·</span>
              <span>TickTick MCP</span>
              <span className="text-slate-600">·</span>
              <span>Samsung Health</span>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onChangeView('wheel')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeView === 'wheel'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Wheel</span>
          </button>

          <button
            onClick={() => onChangeView('history')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeView === 'history'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-blue-400" />
            <span>History</span>
            {totalEntriesCount > 0 && (
              <span className="text-[10px] font-mono text-slate-400 hidden md:inline ml-0.5">
                ({totalEntriesCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeView('predictive')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeView === 'predictive'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-bold ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Predictive Forecast</span>
            <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 font-mono font-bold">
              AI
            </span>
          </button>

          <button
            onClick={() => onChangeView('patterns')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeView === 'patterns'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pattern & Scatter</span>
          </button>

          <button
            onClick={() => onChangeView('recovery')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeView === 'recovery'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-bold ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sobriety</span>
            {sobriety?.enabled && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 font-mono font-bold">
                Day {sobriety.currentStreakDays}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeView('holistic')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeView === 'holistic'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Holistic Matrix</span>
          </button>
        </nav>

        {/* Right Actions: Integrations & Quick Check-In */}
        <div className="flex items-center gap-2">
          {/* Sobriety Quick Badge */}
          {sobriety?.enabled && (
            <button
              onClick={() => onChangeView('recovery')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/80 transition-colors shadow-2xs"
              title={`Sobriety Hub • Day ${sobriety.currentStreakDays} Alcohol-Free (${sobriety.treatmentApproach})`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Day {sobriety.currentStreakDays} Sober</span>
            </button>
          )}
          {/* Integrations Toggle */}
          <button
            onClick={onOpenIntegrations}
            title="Manage connected health & project integrations"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <div className="flex items-center -space-x-1">
              <span
                className={`w-2 h-2 rounded-full ring-2 ring-slate-950 ${
                  mindsara.enabled ? 'bg-purple-400' : 'bg-slate-600'
                }`}
                title="Mindsera"
              />
              <span
                className={`w-2 h-2 rounded-full ring-2 ring-slate-950 ${
                  welltory.enabled ? 'bg-rose-400' : 'bg-slate-600'
                }`}
                title="Welltory"
              />
              <span
                className={`w-2 h-2 rounded-full ring-2 ring-slate-950 ${
                  tasks.enabled ? 'bg-indigo-400' : 'bg-slate-600'
                }`}
                title="TickTick MCP"
              />
              <span
                className={`w-2 h-2 rounded-full ring-2 ring-slate-950 ${
                  samsungHealth.enabled ? 'bg-blue-400' : 'bg-slate-600'
                }`}
                title="Samsung Health"
              />
            </div>
            <span className="hidden md:inline font-mono text-[11px]">Integrations Hub</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Quick Check-In Button */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Check In</span>
          </button>
        </div>
      </div>
    </header>
  );
};
