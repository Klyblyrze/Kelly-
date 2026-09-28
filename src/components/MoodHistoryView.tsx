import React, { useState, useMemo } from 'react';
import {
  MoodEntry,
  HistoryFilterState,
  MindseraPersona,
  MindseraMindsComment,
  WelltoryBiometrics,
  SobrietyRecoveryContext,
} from '../types/journal';
import { EMOTIONS_DATA, SOMATIC_OPTIONS } from '../data/emotionsData';
import { MINDSERA_FRAMEWORKS } from '../data/seedData';
import { ClinicalPdfReportModal } from './ClinicalPdfReportModal';
import { analyzeJournalSentimentAndTags } from '../utils/sentimentTagger';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  ListFilter,
  Search,
  Trash2,
  HeartPulse,
  Sparkles,
  Quote,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sliders,
  Activity,
  ArrowUpRight,
  X,
  RotateCcw,
  Download,
  CalendarRange,
  ChevronDown,
  Check,
  Tag,
  Watch,
  CheckSquare,
  Layers,
  Moon,
  Footprints,
  Eye,
  Brain,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Printer,
} from 'lucide-react';

interface MoodHistoryViewProps {
  entries: MoodEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry?: (updatedEntry: MoodEntry) => void;
  onSelectDatePrompt?: (date: string) => void;
  onNavigateToWheel?: () => void;
  onOpenIntegrations?: () => void;
  welltory?: WelltoryBiometrics;
  sobriety?: SobrietyRecoveryContext;
}

const DEFAULT_FILTERS: HistoryFilterState = {
  searchQuery: '',
  selectedEmotions: [],
  selectedSmartTags: [],
  dateRangePreset: 'all',
  fromDate: '',
  toDate: '',
  minIntensity: 1,
  maxIntensity: 10,
  selectedSomatic: [],
  hasReflectionOnly: false,
};

export const MoodHistoryView: React.FC<MoodHistoryViewProps> = ({
  entries,
  onDeleteEntry,
  onUpdateEntry,
  onSelectDatePrompt,
  onNavigateToWheel,
  onOpenIntegrations,
  welltory,
  sobriety,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'trends' | 'calendar'>('timeline');
  const [filters, setFilters] = useState<HistoryFilterState>(DEFAULT_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isPdfReportOpen, setIsPdfReportOpen] = useState(false);

  // Mindsera retroactive analysis drawer / modal
  const [analyzingEntry, setAnalyzingEntry] = useState<MoodEntry | null>(null);
  const [activePersona, setActivePersona] = useState<MindseraPersona>('stoic');
  const [activeFrameworkId, setActiveFrameworkId] = useState<string>('dichotomy_of_control');
  const [isGeneratingMindsComment, setIsGeneratingMindsComment] = useState(false);

  // Calendar month state
  const [calendarMonthDate, setCalendarMonthDate] = useState(() => new Date());

  // Integration Data Overlay Toggles for the Trends Chart
  const [overlayToggles, setOverlayToggles] = useState({
    showIntensity: true,
    showStress: true,
    showSleep: true,
    showHrv: false,
    showSteps: false,
    showSprintTasks: false,
  });

  const toggleOverlay = (key: keyof typeof overlayToggles) => {
    setOverlayToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick preset helper
  const handleDatePresetChange = (preset: HistoryFilterState['dateRangePreset']) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setFilters((prev) => ({ ...prev, dateRangePreset: 'all', fromDate: '', toDate: '' }));
      return;
    }

    if (preset === 'today') {
      setFilters((prev) => ({
        ...prev,
        dateRangePreset: 'today',
        fromDate: todayStr,
        toDate: todayStr,
      }));
      return;
    }

    if (preset === '7d') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setFilters((prev) => ({
        ...prev,
        dateRangePreset: '7d',
        fromDate: past.toISOString().split('T')[0],
        toDate: todayStr,
      }));
      return;
    }

    if (preset === '30d') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setFilters((prev) => ({
        ...prev,
        dateRangePreset: '30d',
        fromDate: past.toISOString().split('T')[0],
        toDate: todayStr,
      }));
      return;
    }

    if (preset === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilters((prev) => ({
        ...prev,
        dateRangePreset: 'this_month',
        fromDate: firstDay.toISOString().split('T')[0],
        toDate: todayStr,
      }));
      return;
    }

    setFilters((prev) => ({ ...prev, dateRangePreset: 'custom' }));
  };

  const toggleEmotionFilter = (emotionName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedEmotions.includes(emotionName);
      return {
        ...prev,
        selectedEmotions: exists
          ? prev.selectedEmotions.filter((e) => e !== emotionName)
          : [...prev.selectedEmotions, emotionName],
      };
    });
  };

  const toggleSmartTagFilter = (smartTag: string) => {
    setFilters((prev) => {
      const current = prev.selectedSmartTags || [];
      const cleanTag = smartTag.replace(/^#/, '');
      const exists = current.includes(cleanTag);
      return {
        ...prev,
        selectedSmartTags: exists
          ? current.filter((t) => t !== cleanTag)
          : [...current, cleanTag],
      };
    });
  };

  const toggleSomaticFilter = (somatic: string) => {
    setFilters((prev) => {
      const exists = prev.selectedSomatic.includes(somatic);
      return {
        ...prev,
        selectedSomatic: exists
          ? prev.selectedSomatic.filter((s) => s !== somatic)
          : [...prev.selectedSomatic, somatic],
      };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCalendarDate(null);
  };

  // Discovered Smart Tags across all entries (Strictly verified & auto-tagged)
  const allSmartTags = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      // Use existing sentimentAnalysis tags or run lightweight sentiment inference
      const sa = e.sentimentAnalysis || analyzeJournalSentimentAndTags(e.journalText, e.primaryEmotion);
      const combined = [
        ...(sa.emotionTags || []),
        ...(sa.themeTags || []),
        ...(e.tags || []),
      ];
      combined.forEach((t) => {
        if (!t) return;
        const clean = t.trim().replace(/^#/, '');
        if (clean && clean !== 'Daily Check-in' && clean !== 'General' && clean.length > 2) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  // Generate Mindsera Minds Comment for a selected past entry
  const handleGenerateMindsCommentForEntry = async () => {
    if (!analyzingEntry) return;
    setIsGeneratingMindsComment(true);
    try {
      const activeFw = MINDSERA_FRAMEWORKS.find((f) => f.id === activeFrameworkId);
      const res = await fetch('/api/mindsera-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: activePersona,
          frameworkName: activeFw?.name,
          frameworkPromptTemplate: activeFw?.promptTemplate,
          journalText: analyzingEntry.journalText,
          emotionPath: [analyzingEntry.primaryEmotion, analyzingEntry.secondaryEmotion, analyzingEntry.tertiaryEmotion].filter(Boolean) as string[],
          intensity: analyzingEntry.intensity,
          somaticSensations: analyzingEntry.somaticSensations,
          biometrics: analyzingEntry.biometricsSnapshot,
          taskSprint: analyzingEntry.projectContextSnapshot?.sprintPressure,
        }),
      });
      const data: MindseraMindsComment = await res.json();
      const existing = (analyzingEntry.mindseraMindsComments || []).filter((c) => c.persona !== data.persona);
      const updatedEntry: MoodEntry = {
        ...analyzingEntry,
        appliedFramework: activeFw?.name || analyzingEntry.appliedFramework,
        mindseraMindsComments: [data, ...existing],
      };
      if (onUpdateEntry) {
        onUpdateEntry(updatedEntry);
      }
      setAnalyzingEntry(null);
    } catch (err) {
      console.warn('Notice generating Minds comment for entry:', err);
    } finally {
      setIsGeneratingMindsComment(false);
    }
  };

  const isFilterActive = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.selectedEmotions.length > 0 ||
      (filters.selectedSmartTags && filters.selectedSmartTags.length > 0) ||
      filters.dateRangePreset !== 'all' ||
      filters.fromDate !== '' ||
      filters.toDate !== '' ||
      filters.minIntensity > 1 ||
      filters.maxIntensity < 10 ||
      filters.selectedSomatic.length > 0 ||
      filters.hasReflectionOnly ||
      selectedCalendarDate !== null
    );
  }, [filters, selectedCalendarDate]);

  // Master Filter Logic applied across entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // 1. Keyword search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const textMatch = e.journalText.toLowerCase().includes(q);
        const tagMatch = e.tags.some((t) => t.toLowerCase().includes(q));
        const sentimentMatch =
          e.sentimentAnalysis &&
          (e.sentimentAnalysis.valence.toLowerCase().includes(q) ||
            e.sentimentAnalysis.emotionTags.some((t) => t.toLowerCase().includes(q)) ||
            e.sentimentAnalysis.themeTags.some((t) => t.toLowerCase().includes(q)));
        const emoMatch =
          e.primaryEmotion.toLowerCase().includes(q) ||
          (e.secondaryEmotion && e.secondaryEmotion.toLowerCase().includes(q)) ||
          (e.tertiaryEmotion && e.tertiaryEmotion.toLowerCase().includes(q));
        const promptMatch = e.promptUsed && e.promptUsed.toLowerCase().includes(q);
        const somaticMatch = e.somaticSensations.some((s) => s.toLowerCase().includes(q));
        const aiMatch = e.aiReflection && e.aiReflection.toLowerCase().includes(q);

        if (!textMatch && !tagMatch && !sentimentMatch && !emoMatch && !promptMatch && !somaticMatch && !aiMatch) {
          return false;
        }
      }

      // 2. Emotion category
      if (filters.selectedEmotions.length > 0) {
        if (!filters.selectedEmotions.includes(e.primaryEmotion)) {
          return false;
        }
      }

      // 2.5 Smart Tagging category (Strict multi-tag intersection)
      if (filters.selectedSmartTags && filters.selectedSmartTags.length > 0) {
        const sa = e.sentimentAnalysis || analyzeJournalSentimentAndTags(e.journalText, e.primaryEmotion);
        const entryTags = [
          ...(sa.emotionTags || []),
          ...(sa.themeTags || []),
          ...(e.tags || []),
        ].map((t) => t.toLowerCase().replace(/^#/, ''));

        const matchesSmartTag = filters.selectedSmartTags.some((st) =>
          entryTags.includes(st.toLowerCase().replace(/^#/, ''))
        );
        if (!matchesSmartTag) return false;
      }

      // 3. Date range
      if (filters.fromDate && e.date < filters.fromDate) {
        return false;
      }
      if (filters.toDate && e.date > filters.toDate) {
        return false;
      }

      // 4. Intensity range
      if (e.intensity < filters.minIntensity || e.intensity > filters.maxIntensity) {
        return false;
      }

      // 5. Somatic sensations
      if (filters.selectedSomatic.length > 0) {
        const hasSomatic = filters.selectedSomatic.some((s) => e.somaticSensations.includes(s));
        if (!hasSomatic) return false;
      }

      // 6. AI reflection requirement
      if (filters.hasReflectionOnly && !e.aiReflection) {
        return false;
      }

      // 7. Calendar date click
      if (selectedCalendarDate && e.date !== selectedCalendarDate) {
        return false;
      }

      return true;
    });
  }, [entries, filters, selectedCalendarDate]);

  // Analytics Metrics on filtered entries
  const metrics = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        total: 0,
        avgIntensity: '0.0',
        topEmotion: 'N/A',
        topSomatic: 'N/A',
        emotionCounts: {} as Record<string, number>,
      };
    }

    const emotionCounts: Record<string, number> = {};
    const somaticCounts: Record<string, number> = {};
    let totalIntensity = 0;

    filteredEntries.forEach((e) => {
      totalIntensity += e.intensity;
      emotionCounts[e.primaryEmotion] = (emotionCounts[e.primaryEmotion] || 0) + 1;
      e.somaticSensations.forEach((s) => {
        somaticCounts[s] = (somaticCounts[s] || 0) + 1;
      });
    });

    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topSomatic = Object.entries(somaticCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const avgIntensity = (totalIntensity / filteredEntries.length).toFixed(1);

    return {
      total: filteredEntries.length,
      avgIntensity,
      topEmotion,
      topSomatic,
      emotionCounts,
    };
  }, [filteredEntries]);

  // Chronological multi-stream data points for Recharts overlay
  const overlayTrendData = useMemo(() => {
    const sorted = [...filteredEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const dailyMap = new Map<
      string,
      {
        date: string;
        displayDate: string;
        dayLabel: string;
        intensity: number;
        stress: number;
        sleepHours: number;
        hrv: number;
        stepsK: number;
        sprintTasks: number;
        dominantEmotion: string;
        dominantColor: string;
        count: number;
      }
    >();

    sorted.forEach((e) => {
      const existing = dailyMap.get(e.date);
      const intensity = e.intensity;
      const stress = e.biometricsSnapshot?.stressScore ?? 45;
      const sleepHours = e.biometricsSnapshot?.sleepHours ?? 7.2;
      const hrv = e.biometricsSnapshot?.hrvScore ?? 62;
      const stepsK = Number(((e.biometricsSnapshot?.dailySteps ?? 8000) / 1000).toFixed(1));
      const sprintTasks = e.projectContextSnapshot?.pendingTasks ?? 3;

      if (!existing) {
        const dObj = new Date(e.date);
        dailyMap.set(e.date, {
          date: e.date,
          displayDate: dObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          dayLabel: dObj.toLocaleDateString([], { weekday: 'short' }),
          intensity,
          stress,
          sleepHours,
          hrv,
          stepsK,
          sprintTasks,
          dominantEmotion: e.primaryEmotion,
          dominantColor: e.emotionColor,
          count: 1,
        });
      } else {
        existing.intensity = Number(
          ((existing.intensity * existing.count + intensity) / (existing.count + 1)).toFixed(1)
        );
        existing.stress = Math.round((existing.stress * existing.count + stress) / (existing.count + 1));
        existing.count += 1;
      }
    });

    return Array.from(dailyMap.values());
  }, [filteredEntries]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = calendarMonthDate.getFullYear();
    const month = calendarMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const entriesByDate: Record<string, MoodEntry[]> = {};
    filteredEntries.forEach((entry) => {
      if (!entriesByDate[entry.date]) entriesByDate[entry.date] = [];
      entriesByDate[entry.date].push(entry);
    });

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, dateStr: null, entries: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({
        dayNumber: d,
        dateStr,
        entries: entriesByDate[dateStr] || [],
      });
    }

    return days;
  }, [calendarMonthDate, filteredEntries]);

  // Export filtered entries as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `feelings-journal-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Matching Entries
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-serif-heading">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-500">of {entries.length} total</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Top Feeling
          </span>
          <span className="text-xl lg:text-2xl font-bold text-slate-900 font-serif-heading truncate block">
            {metrics.topEmotion}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Intensity
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-serif-heading">
              {metrics.avgIntensity}
            </span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            Top Body Signal
          </span>
          <span className="text-sm font-semibold text-slate-800 line-clamp-1">
            {metrics.topSomatic}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        {/* Top Header: View Tabs & Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Sub tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-indigo-500" />
              <span>Chronological Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'trends'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Trends & Integration Overlays</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              <span>Calendar View</span>
            </button>
          </div>

          {/* Export Actions: JSON & Clinical PDF Report */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPdfReportOpen(true)}
              title="Export formatted monthly clinical PDF report for clinical review or personal records"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Clinical PDF Report</span>
            </button>

            <button
              onClick={handleExportJson}
              title="Export matching entries as JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON ({filteredEntries.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPREHENSIVE SEARCH & FILTER BAR */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/90 rounded-2xl p-4 md:p-5 border border-slate-200/90 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Keyword Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search keywords, reflections, prompts, tags (#Work, #Nature)..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters({ ...filters, searchQuery: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Date Range Preset Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pl-1">
                <CalendarRange className="w-3.5 h-3.5" />
                Range:
              </span>
              {(['all', 'today', '7d', '30d', 'this_month', 'custom'] as const).map((preset) => {
                const label =
                  preset === 'all'
                    ? 'All Time'
                    : preset === 'today'
                    ? 'Today'
                    : preset === '7d'
                    ? 'Last 7 Days'
                    : preset === '30d'
                    ? 'Last 30 Days'
                    : preset === 'this_month'
                    ? 'This Month'
                    : 'Custom Dates';

                const isSelected = filters.dateRangePreset === preset;

                return (
                  <button
                    key={preset}
                    onClick={() => handleDatePresetChange(preset)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              {/* Advanced Filter Toggle Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  showAdvancedFilters || filters.minIntensity > 1 || filters.maxIntensity < 10 || filters.selectedSomatic.length > 0
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(filters.selectedSomatic.length > 0 || filters.minIntensity > 1 || filters.maxIntensity < 10) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Custom Date Range Pickers (if custom selected) */}
          {filters.dateRangePreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">From Date:</span>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <span className="font-semibold text-slate-700">To Date:</span>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              {(filters.fromDate || filters.toDate) && (
                <button
                  onClick={() => setFilters({ ...filters, fromDate: '', toDate: '' })}
                  className="text-slate-400 hover:text-slate-600 underline text-[11px] cursor-pointer"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}

          {/* Row 3: Emotion Category Filter Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                Filter by Core Feelings:
              </span>
              {filters.selectedEmotions.length > 0 && (
                <button
                  onClick={() => setFilters({ ...filters, selectedEmotions: [] })}
                  className="text-[11px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
                >
                  Clear Feelings
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {EMOTIONS_DATA.map((emo) => {
                const isSelected = filters.selectedEmotions.includes(emo.name);
                const count = entries.filter((e) => e.primaryEmotion === emo.name).length;

                return (
                  <button
                    key={emo.id}
                    onClick={() => toggleEmotionFilter(emo.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: emo.color }}
                    />
                    <span>{emo.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3.5: Smart Tagging Filter Pills (AI Discovered & Sentiment Tags) */}
          {allSmartTags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                    Filter by Smart Tags:
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-purple-100 text-purple-700 font-semibold border border-purple-200/60">
                    ✨ Smart Tagging Enabled
                  </span>
                </div>
                {(filters.selectedSmartTags && filters.selectedSmartTags.length > 0) && (
                  <button
                    onClick={() => setFilters({ ...filters, selectedSmartTags: [] })}
                    className="text-[11px] text-purple-600 hover:text-purple-800 underline cursor-pointer"
                  >
                    Clear Smart Tags
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {allSmartTags.slice(0, 16).map(({ tag, count }) => {
                  const isSelected = (filters.selectedSmartTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleSmartTagFilter(tag)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-purple-900 text-purple-100 border-purple-800 shadow-2xs'
                          : 'bg-white text-purple-800 hover:bg-purple-50/80 border-purple-200/80'
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5 text-purple-500" />
                      <span>#{tag}</span>
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded-full ${
                          isSelected ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Filter Summary Bar */}
          {isFilterActive && (
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Active Filters:
                </span>

                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                    Search: "{filters.searchQuery}"
                    <button onClick={() => setFilters({ ...filters, searchQuery: '' })} className="hover:text-indigo-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.dateRangePreset !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 border border-slate-300 text-slate-800 font-medium">
                    Range: {filters.dateRangePreset}
                    <button onClick={() => handleDatePresetChange('all')} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.selectedEmotions.map((emo) => (
                  <span key={emo} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                    {emo}
                    <button onClick={() => toggleEmotionFilter(emo)} className="hover:text-amber-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {(filters.selectedSmartTags || []).map((st) => (
                  <span key={st} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-medium">
                    #{st}
                    <button onClick={() => toggleSmartTagFilter(st)} className="hover:text-purple-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.selectedSomatic.map((som) => (
                  <span key={som} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                    {som}
                    <button onClick={() => toggleSomaticFilter(som)} className="hover:text-rose-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono text-[11px]">
                  Showing {filteredEntries.length} of {entries.length}
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Row 4: Expandable Advanced Filters (Intensity & Somatic) */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-200/80 space-y-4 animate-in fade-in duration-200">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    Emotional Intensity Range:
                  </span>
                  <span className="text-indigo-600 font-bold">
                    {filters.minIntensity} - {filters.maxIntensity} / 10
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={filters.minIntensity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= filters.maxIntensity) {
                        setFilters({ ...filters, minIntensity: val });
                      }
                    }}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={filters.maxIntensity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= filters.minIntensity) {
                        setFilters({ ...filters, maxIntensity: val });
                      }
                    }}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  Filter by Bodily Signals:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SOMATIC_OPTIONS.map((sens) => {
                    const isSelected = filters.selectedSomatic.includes(sens);
                    return (
                      <button
                        key={sens}
                        onClick={() => toggleSomaticFilter(sens)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {sens}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Badges & Reset Bar */}
          {isFilterActive && (
            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-medium">Active filters:</span>

                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-medium">
                    "{filters.searchQuery}"
                    <button
                      onClick={() => setFilters({ ...filters, searchQuery: '' })}
                      className="hover:text-indigo-950"
                    >
                      ×
                    </button>
                  </span>
                )}

                {filters.selectedEmotions.map((emo) => (
                  <span
                    key={emo}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 font-medium"
                  >
                    {emo}
                    <button onClick={() => toggleEmotionFilter(emo)} className="hover:text-slate-950">
                      ×
                    </button>
                  </span>
                ))}

                {filters.selectedSomatic.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-medium"
                  >
                    {s}
                    <button onClick={() => toggleSomaticFilter(s)} className="hover:text-rose-950">
                      ×
                    </button>
                  </span>
                ))}

                {(filters.fromDate || filters.toDate) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-medium">
                    {filters.fromDate || 'Start'} → {filters.toDate || 'End'}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, fromDate: '', toDate: '', dateRangePreset: 'all' })
                      }
                      className="hover:text-blue-950"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedCalendarDate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-white font-medium">
                    Date: {selectedCalendarDate}
                    <button onClick={() => setSelectedCalendarDate(null)} className="hover:text-slate-300">
                      ×
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={resetFilters}
                className="flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-800 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: CHRONOLOGICAL FEED */}
        {/* ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => {
                const fullEmotionPath = [
                  entry.primaryEmotion,
                  entry.secondaryEmotion,
                  entry.tertiaryEmotion,
                ]
                  .filter(Boolean)
                  .join(' → ');

                return (
                  <div
                    key={entry.id}
                    className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-xl text-xs font-bold tracking-tight shadow-2xs"
                          style={{
                            backgroundColor: `${entry.emotionColor}20`,
                            color: entry.emotionColor,
                          }}
                        >
                          {fullEmotionPath}
                        </span>

                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                          Intensity {entry.intensity}/10
                        </span>

                        {/* Automated Sentiment Analysis Badge */}
                        {entry.sentimentAnalysis && (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                              entry.sentimentAnalysis.valence === 'Positive'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : entry.sentimentAnalysis.valence === 'Cathartic Growth'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : entry.sentimentAnalysis.valence === 'Challenging'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                            title={`Automated sentiment analysis score: ${entry.sentimentAnalysis.score > 0 ? '+' : ''}${entry.sentimentAnalysis.score}`}
                          >
                            <Sparkles className="w-3 h-3 text-current" />
                            <span>
                              Sentiment: {entry.sentimentAnalysis.valence} ({entry.sentimentAnalysis.score > 0 ? '+' : ''}
                              {entry.sentimentAnalysis.score})
                            </span>
                          </span>
                        )}

                        {entry.biometricsSnapshot && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            <Activity className="w-3 h-3" />
                            HRV {entry.biometricsSnapshot.hrvScore}ms • {entry.biometricsSnapshot.stressScore}% Stress
                            {entry.biometricsSnapshot.sleepHours && (
                              <span className="text-slate-500 ml-1">
                                ({entry.biometricsSnapshot.sleepHours}h sleep)
                              </span>
                            )}
                          </span>
                        )}

                        {entry.projectContextSnapshot?.sprintPressure && (
                          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Sprint: {entry.projectContextSnapshot.sprintPressure}
                            {entry.projectContextSnapshot.activeProject && ` (${entry.projectContextSnapshot.activeProject})`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>
                          {new Date(entry.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          at {entry.time}
                        </span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          title="Delete entry"
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {entry.promptUsed && (
                      <div className="flex items-start gap-2 text-xs font-medium text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                        <Quote className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <span className="font-serif-heading">{entry.promptUsed}</span>
                      </div>
                    )}

                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                      {entry.journalText}
                    </p>

                    {/* Somatic & Tagging Section */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {/* Somatic sensations */}
                      {entry.somaticSensations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {entry.somaticSensations.map((sens, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg"
                            >
                              <HeartPulse className="w-2.5 h-2.5 text-rose-500" />
                              {sens}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Automated Emotion & Theme Tags Display */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Automated Emotion Tags */}
                        {entry.sentimentAnalysis?.emotionTags &&
                          entry.sentimentAnalysis.emotionTags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mr-0.5 flex items-center gap-0.5">
                                <Tag className="w-2.5 h-2.5" /> Emotion:
                              </span>
                              {entry.sentimentAnalysis.emotionTags.map((emTag, idx) => (
                                <button
                                  type="button"
                                  key={`em-${idx}`}
                                  onClick={() => setFilters({ ...filters, searchQuery: emTag })}
                                  title={`Auto-applied emotion tag from sentiment analysis. Click to filter by #${emTag}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <span>#{emTag}</span>
                                </button>
                              ))}
                            </div>
                          )}

                        {/* Automated Theme Tags */}
                        {entry.sentimentAnalysis?.themeTags &&
                          entry.sentimentAnalysis.themeTags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mr-0.5 flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5" /> Theme:
                              </span>
                              {entry.sentimentAnalysis.themeTags.map((thTag, idx) => (
                                <button
                                  type="button"
                                  key={`th-${idx}`}
                                  onClick={() => setFilters({ ...filters, searchQuery: thTag })}
                                  title={`Auto-applied thematic tag from sentiment analysis. Click to filter by #${thTag}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <span>#{thTag}</span>
                                </button>
                              ))}
                            </div>
                          )}

                        {/* Additional User Custom Tags */}
                        {entry.tags
                          .filter(
                            (t) =>
                              !entry.sentimentAnalysis?.emotionTags.includes(t) &&
                              !entry.sentimentAnalysis?.themeTags.includes(t)
                          )
                          .map((tag, idx) => (
                            <button
                              type="button"
                              key={`user-tag-${idx}`}
                              onClick={() => setFilters({ ...filters, searchQuery: tag })}
                              title={`User tag. Click to filter by #${tag}`}
                              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                            >
                              #{tag}
                            </button>
                          ))}

                        {/* Automated System Indicator */}
                        {entry.sentimentAnalysis && (
                          <span className="text-[10px] text-slate-400 font-mono italic ml-auto hidden sm:inline">
                            ✨ Auto-tagged by sentiment analysis
                          </span>
                        )}
                      </div>
                    </div>

                    {entry.aiReflection && (
                      <div className="mt-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>AI Takeaway</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">
                          {entry.aiReflection}
                        </p>
                      </div>
                    )}

                    {/* Mindsera Minds Comments & Custom Framework Analysis */}
                    {entry.mindseraMindsComments && entry.mindseraMindsComments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {entry.mindseraMindsComments.map((mc) => (
                          <div
                            key={mc.id}
                            className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70 text-xs text-purple-950 space-y-2"
                          >
                            <div className="flex items-center justify-between border-b border-purple-200/50 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-700 flex items-center justify-center font-bold">
                                  <Brain className="w-3.5 h-3.5" />
                                </span>
                                <div>
                                  <span className="font-semibold text-purple-900 block font-serif-heading">
                                    {mc.personaTitle}
                                  </span>
                                  {mc.frameworkName && (
                                    <span className="text-[10px] text-purple-600 font-mono">
                                      Framework: {mc.frameworkName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-purple-600 uppercase">
                                Mindsera Lens
                              </span>
                            </div>

                            <p className="leading-relaxed whitespace-pre-line text-purple-900">
                              {mc.commentText}
                            </p>

                            <div className="pt-2 border-t border-purple-200/50">
                              <span className="text-[10px] font-mono uppercase text-purple-700 font-semibold block mb-0.5">
                                Actionable Inquiry:
                              </span>
                              <p className="font-medium text-purple-950 italic">
                                "{mc.actionableInquiry}"
                              </p>
                            </div>

                            {mc.coreDichotomyOrInsight && (
                              <div className="text-[11px] text-purple-800">
                                💡 <span className="font-medium">Core Mental Model:</span> {mc.coreDichotomyOrInsight}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Card Footer Actions: Mindsera Analysis & Metadata */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        {entry.appliedFramework && (
                          <span className="text-purple-700 font-medium">
                            Mindsera: {entry.appliedFramework}
                          </span>
                        )}
                        {entry.appliedFramework && entry.biometricsSnapshot && <span>·</span>}
                        {entry.biometricsSnapshot?.hrvScore && (
                          <span>HRV {entry.biometricsSnapshot.hrvScore}ms</span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setAnalyzingEntry(entry);
                          setActivePersona(entry.mindseraMindsComments?.[0]?.persona || 'stoic');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5 text-purple-600" />
                        <span>
                          {entry.mindseraMindsComments?.length
                            ? 'Switch Mind Lens / Re-analyze'
                            : 'Analyze with Mindsera'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center space-y-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-700">
                  No mood entries found matching your search and filter criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TRENDS & MULTI-STREAM INTEGRATION OVERLAYS */}
        {/* ========================================================================= */}
        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* Multi-Stream Overlay Controller & Chart */}
            <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              {/* Header & Overlay Selector Pills */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-serif-heading flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Multi-Stream Data Overlays
                    </h4>
                    <p className="text-xs text-slate-500">
                      Toggle telemetries below to overlay physical and project metrics against your emotional intensity.
                    </p>
                  </div>
                </div>

                {/* Overlay Toggle Chips */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider pl-1">
                    Active Layers:
                  </span>

                  {/* Mood Intensity Toggle */}
                  <button
                    onClick={() => toggleOverlay('showIntensity')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      overlayToggles.showIntensity
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Mood Intensity (1-10)</span>
                  </button>

                  {/* Welltory Stress Toggle */}
                  <button
                    onClick={() => toggleOverlay('showStress')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      overlayToggles.showStress
                        ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Welltory Stress (%)</span>
                  </button>

                  {/* Samsung Health Sleep Toggle */}
                  <button
                    onClick={() => toggleOverlay('showSleep')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      overlayToggles.showSleep
                        ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Samsung Sleep (Hrs)</span>
                  </button>

                  {/* Welltory HRV Toggle */}
                  <button
                    onClick={() => toggleOverlay('showHrv')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      overlayToggles.showHrv
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Welltory HRV (ms)</span>
                  </button>

                  {/* Samsung Health Steps Toggle */}
                  <button
                    onClick={() => toggleOverlay('showSteps')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      overlayToggles.showSteps
                        ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Steps (k)</span>
                  </button>

                  {/* TickTick MCP Tasks Toggle */}
                  <button
                    onClick={() => toggleOverlay('showSprintTasks')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                      overlayToggles.showSprintTasks
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>TickTick Tasks</span>
                  </button>
                </div>
              </div>

              {/* Recharts Composed Chart with Overlay Streams */}
              {overlayTrendData.length > 0 ? (
                <div className="w-full h-72 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={overlayTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      {/* Left YAxis: Intensity (0-10) */}
                      <YAxis
                        yAxisId="left"
                        domain={[0, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      {/* Right YAxis: Biometrics & Telemetry (0-100%) */}
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />

                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white text-xs p-3.5 rounded-2xl shadow-xl space-y-1.5 border border-slate-800">
                                <p className="font-bold text-slate-200">
                                  {d.displayDate} ({d.dayLabel})
                                </p>
                                <p className="flex items-center gap-1.5 font-semibold text-amber-400">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: d.dominantColor }}
                                  />
                                  <span>
                                    {d.dominantEmotion} (Intensity {d.intensity}/10)
                                  </span>
                                </p>
                                {overlayToggles.showStress && (
                                  <p className="text-rose-400 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3" />
                                    <span>Welltory Stress: {d.stress}%</span>
                                  </p>
                                )}
                                {overlayToggles.showSleep && (
                                  <p className="text-blue-400 flex items-center gap-1.5">
                                    <Moon className="w-3 h-3" />
                                    <span>Samsung Sleep: {d.sleepHours} hrs</span>
                                  </p>
                                )}
                                {overlayToggles.showHrv && (
                                  <p className="text-emerald-400 flex items-center gap-1.5">
                                    <HeartPulse className="w-3 h-3" />
                                    <span>Welltory HRV: {d.hrv} ms</span>
                                  </p>
                                )}
                                {overlayToggles.showSteps && (
                                  <p className="text-purple-400 flex items-center gap-1.5">
                                    <Footprints className="w-3 h-3" />
                                    <span>Samsung Steps: {d.stepsK * 1000}</span>
                                  </p>
                                )}
                                {overlayToggles.showSprintTasks && (
                                  <p className="text-amber-300 flex items-center gap-1.5">
                                    <CheckSquare className="w-3 h-3" />
                                    <span>TickTick Pending Tasks: {d.sprintTasks}</span>
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      {/* Area for Mood Intensity */}
                      {overlayToggles.showIntensity && (
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="intensity"
                          name="Mood Intensity"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          fill="#fef3c7"
                          fillOpacity={0.4}
                        />
                      )}

                      {/* Line for Welltory Stress */}
                      {overlayToggles.showStress && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="stress"
                          name="Stress %"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#f43f5e' }}
                        />
                      )}

                      {/* Line for Samsung Health Sleep (mapped on right axis 1h = 10%) */}
                      {overlayToggles.showSleep && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="sleepHours"
                          name="Sleep Hours"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#3b82f6' }}
                        />
                      )}

                      {/* Line for Welltory HRV */}
                      {overlayToggles.showHrv && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="hrv"
                          name="HRV (ms)"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#10b981' }}
                        />
                      )}

                      {/* Line for Steps */}
                      {overlayToggles.showSteps && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="stepsK"
                          name="Steps (k)"
                          stroke="#a855f7"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#a855f7' }}
                        />
                      )}

                      {/* Line for Sprint Tasks */}
                      {overlayToggles.showSprintTasks && (
                        <Line
                          yAxisId="left"
                          type="step"
                          dataKey="sprintTasks"
                          name="Pending Tasks"
                          stroke="#d97706"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#d97706' }}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No records matching current filters to render multi-stream overlays.
                </div>
              )}
            </div>

            {/* Grid: Primary Emotion Share & Cross-Integration Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emotion Share Breakdown */}
              <div className="bg-slate-50/70 p-6 rounded-3xl border border-slate-200/80">
                <h4 className="text-base font-bold text-slate-900 font-serif-heading mb-1">
                  Primary Emotion Distribution
                </h4>
                <p className="text-xs text-slate-500 mb-5">
                  Proportion of check-ins across the six core emotional spectrums.
                </p>

                <div className="space-y-3.5">
                  {EMOTIONS_DATA.map((emo) => {
                    const count = metrics.emotionCounts[emo.name] || 0;
                    const percent = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;

                    return (
                      <div key={emo.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: emo.color }}
                            />
                            {emo.name}
                          </span>
                          <span className="text-slate-500 font-medium">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: emo.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cross-Integration Correlation Findings */}
              <div className="bg-slate-50/70 p-6 rounded-3xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-base font-bold text-slate-900 font-serif-heading">
                      Integration Correlation Findings
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Key intersections observed between physical telemetry and project velocity.
                  </p>

                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="flex justify-between items-center font-semibold text-slate-800">
                        <span>Sprint Tasks &gt; 4 (Tik Tom)</span>
                        <span className="text-rose-600 font-bold">2.4x Anxious Frequency</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        High sprint pressure reliably correlates with jaw clenching and chest tightness in afternoon check-ins.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="flex justify-between items-center font-semibold text-slate-800">
                        <span>Sleep &gt; 7.5 hrs (Samsung Health)</span>
                        <span className="text-emerald-600 font-bold">+52% Contentment</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Restorative nights paired with &gt; 8,000 steps produce peak Peaceful & Joyful reflections with low baseline heart rates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Configure connected streams</span>
                  {onOpenIntegrations && (
                    <button
                      onClick={onOpenIntegrations}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Manage Integrations</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CALENDAR VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 font-serif-heading">
                  {monthNames[calendarMonthDate.getMonth()]} {calendarMonthDate.getFullYear()}
                </h4>
                <p className="text-xs text-slate-500">
                  Tap any day cell to filter entries for that specific date.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = new Date(calendarMonthDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCalendarMonthDate(prev);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCalendarMonthDate(new Date())}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Today
                </button>

                <button
                  onClick={() => {
                    const next = new Date(calendarMonthDate);
                    next.setMonth(next.getMonth() + 1);
                    setCalendarMonthDate(next);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-3xl border border-slate-200/80 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((cd, index) => {
                  if (!cd.dayNumber) {
                    return <div key={`empty-${index}`} className="h-20 rounded-2xl bg-transparent" />;
                  }

                  const hasEntries = cd.entries.length > 0;
                  const isSelected = selectedCalendarDate === cd.dateStr;

                  return (
                    <div
                      key={cd.dateStr}
                      onClick={() => {
                        if (hasEntries) {
                          setSelectedCalendarDate(isSelected ? null : cd.dateStr);
                        }
                      }}
                      className={`h-22 p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        hasEntries ? 'cursor-pointer hover:shadow-xs' : 'opacity-60'
                      } ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : hasEntries
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-white/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-white' : 'text-slate-700'
                          }`}
                        >
                          {cd.dayNumber}
                        </span>
                        {hasEntries && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {cd.entries.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {cd.entries.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className={`text-[10px] truncate px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                              isSelected ? 'bg-white/10 text-white' : 'text-slate-800'
                            }`}
                            style={{
                              backgroundColor: isSelected ? undefined : `${e.emotionColor}20`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: e.emotionColor }}
                            />
                            <span className="truncate">{e.primaryEmotion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mindsera Retroactive Analysis Modal */}
      {analyzingEntry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">
                    Mindsera Minds Comment Analysis
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Apply custom mental models to entry from {analyzingEntry.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnalyzingEntry(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Entry Summary Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span className="font-semibold text-slate-200">{analyzingEntry.primaryEmotion}</span>
                {analyzingEntry.secondaryEmotion && <span>→ {analyzingEntry.secondaryEmotion}</span>}
                <span>·</span>
                <span>Intensity {analyzingEntry.intensity}/10</span>
              </div>
              <p className="text-slate-300 line-clamp-3 italic font-serif-heading">
                "{analyzingEntry.journalText}"
              </p>
              {analyzingEntry.somaticSensations?.length > 0 && (
                <p className="text-[11px] text-slate-400">
                  🫀 Somatic: {analyzingEntry.somaticSensations.join(', ')}
                </p>
              )}
            </div>

            {/* Persona Selector */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                1. Select Mind Persona:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'stoic' as MindseraPersona, label: 'Stoic', sub: 'Marcus Aurelius' },
                  { id: 'psychologist' as MindseraPersona, label: 'Psychologist', sub: 'Carl Rogers / CBT' },
                  { id: 'challenger' as MindseraPersona, label: 'Challenger', sub: 'Socrates / Munger' },
                  { id: 'strategist' as MindseraPersona, label: 'Strategist', sub: 'First Principles' },
                  { id: 'neuroscientist' as MindseraPersona, label: 'Neuroscientist', sub: 'Andrew Huberman' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activePersona === p.id
                        ? 'border-purple-500 bg-purple-500/20 text-purple-200 shadow-xs'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-xs block text-slate-100">{p.label}</span>
                    <span className="text-[10px] text-slate-400 block">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Selector */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                2. Select Custom Framework / Template:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {MINDSERA_FRAMEWORKS.map((fw) => (
                  <div
                    key={fw.id}
                    onClick={() => setActiveFrameworkId(fw.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeFrameworkId === fw.id
                        ? 'border-purple-500/80 bg-purple-950/30'
                        : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-100">{fw.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{fw.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {fw.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setAnalyzingEntry(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateMindsCommentForEntry}
                disabled={isGeneratingMindsComment}
                className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                {isGeneratingMindsComment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Minds Comment...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    <span>Generate & Attach Minds Comment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical PDF Report Modal */}
      <ClinicalPdfReportModal
        isOpen={isPdfReportOpen}
        onClose={() => setIsPdfReportOpen(false)}
        entries={entries}
        welltory={welltory}
        sobriety={sobriety}
      />
    </div>
  );
};
