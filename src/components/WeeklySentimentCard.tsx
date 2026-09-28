import React, { useMemo } from 'react';
import { MoodEntry } from '../types/journal';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
  Activity,
  Heart,
} from 'lucide-react';

interface WeeklySentimentCardProps {
  entries: MoodEntry[];
  onViewFullHistory: () => void;
  onOpenJournalModal?: () => void;
}

export const WeeklySentimentCard: React.FC<WeeklySentimentCardProps> = ({
  entries,
  onViewFullHistory,
  onOpenJournalModal,
}) => {
  // Compute data for the last 7 days (Day -6 to Day 0)
  const { chartData, avgIntensity, trendDirection, trendDiff, dominantEmotion, dominantColor, totalWeeklyEntries } =
    useMemo(() => {
      const today = new Date();
      const days = [];

      // Generate dates for the past 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
        const shortDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

        // Find entries on this day
        const dayEntries = entries.filter((e) => e.date === dateStr);
        let avgDayIntensity = 0;
        let dayEmotion = 'None';
        let dayColor = '#94a3b8';

        if (dayEntries.length > 0) {
          const sum = dayEntries.reduce((acc, curr) => acc + curr.intensity, 0);
          avgDayIntensity = Number((sum / dayEntries.length).toFixed(1));
          dayEmotion = dayEntries[0].primaryEmotion;
          dayColor = dayEntries[0].emotionColor;
        }

        days.push({
          dateStr,
          dayLabel,
          shortDate,
          intensity: avgDayIntensity,
          count: dayEntries.length,
          emotion: dayEmotion,
          color: dayColor,
        });
      }

      // Filter days with entries
      const recordedDays = days.filter((d) => d.count > 0);
      const totalWeeklyEntries = entries.filter((e) => {
        const diff = (today.getTime() - new Date(e.timestamp).getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
      }).length;

      const sumIntensity = recordedDays.reduce((acc, curr) => acc + curr.intensity, 0);
      const avgIntensity = recordedDays.length > 0 ? (sumIntensity / recordedDays.length).toFixed(1) : '6.5';

      // Compare first half of week vs second half of week to detect trend
      const firstHalf = days.slice(0, 3).filter((d) => d.count > 0);
      const secondHalf = days.slice(4, 7).filter((d) => d.count > 0);
      const firstAvg = firstHalf.length ? firstHalf.reduce((a, b) => a + b.intensity, 0) / firstHalf.length : 6;
      const secondAvg = secondHalf.length ? secondHalf.reduce((a, b) => a + b.intensity, 0) / secondHalf.length : 7;
      const diff = Number((secondAvg - firstAvg).toFixed(1));

      let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
      if (diff > 0.3) trendDirection = 'up';
      else if (diff < -0.3) trendDirection = 'down';

      // Find dominant emotion in last 7 days
      const counts: Record<string, { count: number; color: string }> = {};
      entries.slice(0, 10).forEach((e) => {
        if (!counts[e.primaryEmotion]) {
          counts[e.primaryEmotion] = { count: 0, color: e.emotionColor };
        }
        counts[e.primaryEmotion].count += 1;
      });

      const top = Object.entries(counts).sort((a, b) => b[1].count - a[1].count)[0];
      const dominantEmotion = top ? top[0] : 'Joyful';
      const dominantColor = top ? top[1].color : '#F59E0B';

      return {
        chartData: days,
        avgIntensity,
        trendDirection,
        trendDiff: Math.abs(diff),
        dominantEmotion,
        dominantColor,
        totalWeeklyEntries,
      };
    }, [entries]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 transition-all hover:border-slate-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Summary Metrics & Sentiment */}
        <div className="space-y-3 lg:max-w-md">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-heading tracking-tight">
              Weekly Sentiment Trend
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
              Last 7 Days
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-heading">
              {avgIntensity}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10 intensity</span>

            {/* Trend Indicator */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                trendDirection === 'up'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : trendDirection === 'down'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              ) : trendDirection === 'down' ? (
                <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {trendDirection === 'up'
                  ? `+${trendDiff} momentum`
                  : trendDirection === 'down'
                  ? `-${trendDiff} steady`
                  : 'Equilibrium'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>Dominant mood:</span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${dominantColor}18`,
                color: dominantColor,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dominantColor }}
              />
              {dominantEmotion}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{totalWeeklyEntries} check-ins recorded</span>
          </div>
        </div>

        {/* Right Side: Recharts Sparkline */}
        <div className="flex-1 lg:max-w-md w-full min-w-0">
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dominantColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={dominantColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dayLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis domain={[0, 10]} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl space-y-0.5 border border-slate-800">
                          <p className="font-semibold text-slate-200">
                            {data.dayLabel}, {data.shortDate}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: data.color || '#F59E0B' }}
                            />
                            <span>
                              {data.count > 0
                                ? `${data.emotion} (${data.intensity}/10)`
                                : 'No check-in'}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="intensity"
                  stroke={dominantColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#intensityGradient)"
                  dot={{ r: 3, fill: dominantColor, strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 5, fill: dominantColor, strokeWidth: 2, stroke: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">7-Day Intensity Sparkline</span>
            <button
              onClick={onViewFullHistory}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Explore Mood History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
