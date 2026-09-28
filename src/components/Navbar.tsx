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
  FileText,
  LayoutDashboard,
  TrendingUp,
  Sliders,
  Calendar,
} from 'lucide-react';
import {
  WelltoryBiometrics,
  MindsaraContext,
  SamsungHealthData,
  TaskProjectData,
  SobrietyRecoveryContext,
} from '../types/journal';

export type AppActiveView =
  | 'dashboard'
  | 'journal'
  | 'sobriety'
  | 'analysis'
  | 'personal'
  | 'forecast'
  | 'integrations'
  | 'wheel'
  | 'history'
  | 'patterns'
  | 'predictive'
  | 'recovery'
  | 'holistic';

interface NavbarProps {
  activeView: AppActiveView;
  onChangeView: (view: AppActiveView) => void;
  onOpenCheckIn: () => void;
  onOpenIntegrations: () => void;
  onOpenClinicalReport?: () => void;
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
  onOpenClinicalReport,
  welltory,
  mindsara,
  samsungHealth,
  tasks,
  sobriety,
  totalEntriesCount,
}) => {
  // Normalize active view to current primary tabs
  const isDashboard = activeView === 'dashboard';
  const isJournal = activeView === 'journal' || activeView === 'wheel';
  const isSobriety = activeView === 'sobriety' || activeView === 'recovery';
  const isAnalysis =
    activeView === 'analysis' ||
    activeView === 'patterns' ||
    activeView === 'history' ||
    activeView === 'holistic';
  const isPersonal = activeView === 'personal';
  const isForecast = activeView === 'forecast' || activeView === 'predictive';
  const isIntegrations = activeView === 'integrations';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          onClick={() => onChangeView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
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
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold hidden sm:inline">
                Dual Console
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 hidden xl:flex font-mono">
              <span>Welltory HRV</span>
              <span className="text-slate-600">·</span>
              <span>Samsung Health</span>
              <span className="text-slate-600">·</span>
              <span>SMART Recovery</span>
            </div>
          </div>
        </div>

        {/* Tabular View Switchers */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-x-auto scrollbar-none">
          {/* Tab 1: Dashboard Home */}
          <button
            onClick={() => onChangeView('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isDashboard
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard</span>
          </button>

          {/* Tab 2: Journaling & Wheel */}
          <button
            onClick={() => onChangeView('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isJournal
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Journaling</span>
          </button>

          {/* Tab 3: Sobriety Hub */}
          <button
            onClick={() => onChangeView('sobriety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isSobriety
                ? 'bg-emerald-950/80 text-emerald-200 shadow-xs border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sobriety Hub</span>
            {sobriety?.enabled && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Day {sobriety.currentStreakDays}
              </span>
            )}
          </button>

          {/* Tab 4: Data Trends & Analysis */}
          <button
            onClick={() => onChangeView('analysis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isAnalysis
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>Data Trends</span>
          </button>

          {/* Tab 5: Personal Analysis & Traits */}
          <button
            onClick={() => onChangeView('personal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isPersonal
                ? 'bg-purple-950/80 text-purple-200 shadow-xs border border-purple-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Personal Analysis</span>
          </button>

          {/* Tab 6: Forecast & Forward Looking */}
          <button
            onClick={() => onChangeView('forecast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isForecast
                ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 text-purple-200 shadow-xs border border-purple-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Forecast</span>
            <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-200 font-mono font-bold">
              AI
            </span>
          </button>

          {/* Tab 6: Integrations Hub */}
          <button
            onClick={() => onChangeView('integrations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isIntegrations
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Integrations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </nav>

        {/* Right Actions: Quick Check-In & Export PDF */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenClinicalReport && (
            <button
              onClick={onOpenClinicalReport}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
              title="Export formatted clinical PDF summary"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Export PDF</span>
            </button>
          )}

          {/* Primary Quick Check-in Button */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Check-In</span>
          </button>
        </div>
      </div>
    </header>
  );
};
