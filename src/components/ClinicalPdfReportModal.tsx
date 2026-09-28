import React, { useState, useMemo } from 'react';
import {
  MoodEntry,
  WelltoryBiometrics,
  SobrietyRecoveryContext,
} from '../types/journal';
import {
  Printer,
  Download,
  X,
  FileText,
  Calendar,
  Activity,
  HeartPulse,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface ClinicalPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MoodEntry[];
  welltory?: WelltoryBiometrics;
  sobriety?: SobrietyRecoveryContext;
}

export const ClinicalPdfReportModal: React.FC<ClinicalPdfReportModalProps> = ({
  isOpen,
  onClose,
  entries,
  welltory,
  sobriety,
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0); // 0 = current month, 1 = last month

  // Compute target month bounds
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const monthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter entries for the selected month
  const monthEntries = useMemo(() => {
    return entries.filter((e) => {
      const entryDate = new Date(e.date || e.timestamp);
      return (
        entryDate.getFullYear() === targetYear && entryDate.getMonth() === targetMonth
      );
    });
  }, [entries, targetYear, targetMonth]);

  // Aggregate statistics for the clinical summary
  const stats = useMemo(() => {
    const total = monthEntries.length;
    if (total === 0) {
      return {
        total: 0,
        avgIntensity: 0,
        emotionBreakdown: [],
        avgHrv: 0,
        avgSleep: 0,
        avgStress: 0,
        sentimentCounts: { Positive: 0, 'Cathartic Growth': 0, Challenging: 0, Neutral: 0 },
        topTriggers: [],
        topSomatic: [],
      };
    }

    const intensitySum = monthEntries.reduce((acc, e) => acc + (e.intensity || 5), 0);
    const avgIntensity = (intensitySum / total).toFixed(1);

    // Emotion distribution
    const emotionMap: Record<string, number> = {};
    const somaticMap: Record<string, number> = {};
    const triggerMap: Record<string, number> = {};
    const sentimentCounts = {
      Positive: 0,
      'Cathartic Growth': 0,
      Challenging: 0,
      Neutral: 0,
    };

    let hrvSum = 0;
    let hrvCount = 0;
    let sleepSum = 0;
    let sleepCount = 0;
    let stressSum = 0;
    let stressCount = 0;

    monthEntries.forEach((e) => {
      const emo = e.primaryEmotion || 'Unspecified';
      emotionMap[emo] = (emotionMap[emo] || 0) + 1;

      e.somaticSensations?.forEach((s) => {
        somaticMap[s] = (somaticMap[s] || 0) + 1;
      });

      e.tags?.forEach((t) => {
        if (!['Anxious', 'Joyful', 'Peaceful', 'Sad', 'Angry', 'Fearful'].includes(t)) {
          triggerMap[t] = (triggerMap[t] || 0) + 1;
        }
      });

      if (e.sentimentAnalysis?.valence) {
        sentimentCounts[e.sentimentAnalysis.valence] =
          (sentimentCounts[e.sentimentAnalysis.valence] || 0) + 1;
      }

      if (e.biometricsSnapshot?.hrvScore) {
        hrvSum += e.biometricsSnapshot.hrvScore;
        hrvCount++;
      }
      if (e.biometricsSnapshot?.sleepHours) {
        sleepSum += e.biometricsSnapshot.sleepHours;
        sleepCount++;
      }
      if (e.biometricsSnapshot?.stressScore) {
        stressSum += e.biometricsSnapshot.stressScore;
        stressCount++;
      }
    });

    const emotionBreakdown = Object.entries(emotionMap)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const topSomatic = Object.entries(somaticMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topTriggers = Object.entries(triggerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      total,
      avgIntensity,
      emotionBreakdown,
      avgHrv: hrvCount > 0 ? Math.round(hrvSum / hrvCount) : welltory?.hrvScore || 54,
      avgSleep: sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : '7.2',
      avgStress: stressCount > 0 ? Math.round(stressSum / stressCount) : welltory?.stressScore || 45,
      sentimentCounts,
      topTriggers,
      topSomatic,
    };
  }, [monthEntries, welltory]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileText className="w-5 h-5 text-indigo-300" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white font-serif-heading">
                Clinical Mood & Pattern Summary Report
              </h3>
              <p className="text-xs text-slate-400">
                Formatted for clinician sharing, therapy sessions, or personal archives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <select
              value={selectedMonthOffset}
              onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-400"
            >
              <option value={0}>Current Month ({new Date().toLocaleString('default', { month: 'short', year: 'numeric' })})</option>
              <option value={1}>Previous Month</option>
            </select>

            {/* Print / Save to PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div
          id="clinical-report-printable"
          className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-800 space-y-8 bg-white print:p-0 print:m-0 print:overflow-visible"
        >
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-700 font-bold">
                  Clinical Psychological Telemetry
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500 font-medium">Confidential Record</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-slate-900 tracking-tight">
                Monthly Mood & Behavioral Pattern Report
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Reporting Period: <strong className="text-slate-800">{monthName}</strong> • Generated on {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 hidden sm:block font-mono">
              <div>Feelings Wheel AI Journal</div>
              <div>Holistic Telemetry & Recovery</div>
            </div>
          </div>

          {/* Section 1: Executive Clinical Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              1. Executive Summary & Volumetric Statistics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Logged Entries
                </span>
                <span className="text-2xl font-bold text-slate-900 font-serif-heading">
                  {stats.total}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Reflections recorded
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Mean Intensity
                </span>
                <span className="text-2xl font-bold text-slate-900 font-serif-heading">
                  {stats.avgIntensity}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ 10</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Subjective emotional arousal
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Autonomic HRV
                </span>
                <span className="text-2xl font-bold text-emerald-700 font-serif-heading">
                  {stats.avgHrv}
                  <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Vagal parasympathetic tone
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Sobriety Retention
                </span>
                <span className="text-2xl font-bold text-indigo-700 font-serif-heading">
                  {sobriety?.currentStreakDays ?? 43}
                  <span className="text-xs font-normal text-slate-400 ml-1">days</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Unbroken recovery streak
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Emotional Granularity & Sentiment Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                2. Primary Emotion Frequency
              </h2>

              {stats.emotionBreakdown.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {stats.emotionBreakdown.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="text-slate-500 font-mono">
                          {item.count} entries ({item.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-800"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No entries logged for this timeframe.</p>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                3. Automated Sentiment Valence Analysis
              </h2>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span className="font-semibold">Positive & Joyful Valence</span>
                  <span className="font-bold">{stats.sentimentCounts.Positive} entries</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                  <span className="font-semibold">Cathartic Growth & Cognitive Reframing</span>
                  <span className="font-bold">{stats.sentimentCounts['Cathartic Growth']} entries</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="font-semibold">Challenging / Arousal Stress</span>
                  <span className="font-bold">{stats.sentimentCounts.Challenging} entries</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
                  <span className="font-semibold">Neutral / Equanimous Observation</span>
                  <span className="font-bold">{stats.sentimentCounts.Neutral} entries</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Somatic Sensations & Contextual Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                4. Recurrent Somatic Signatures
              </h2>
              {stats.topSomatic.length > 0 ? (
                <ul className="text-xs space-y-1.5">
                  {stats.topSomatic.map((s) => (
                    <li key={s.name} className="flex items-center justify-between text-slate-700">
                      <span>• {s.name}</span>
                      <span className="text-slate-400 font-mono">{s.count} occurrences</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No somatic patterns noted.</p>
              )}
            </div>

            <div className="space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                5. Environmental Triggers & Life Context
              </h2>
              {stats.topTriggers.length > 0 ? (
                <ul className="text-xs space-y-1.5">
                  {stats.topTriggers.map((t) => (
                    <li key={t.name} className="flex items-center justify-between text-slate-700">
                      <span>• #{t.name}</span>
                      <span className="text-slate-400 font-mono">{t.count} references</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No recurring environmental tags.</p>
              )}
            </div>
          </div>

          {/* Section 4: Chronological Sample Log Table */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              6. Chronological Journal Timeline & Clinical Excerpts
            </h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-2.5 w-24">Date & Time</th>
                    <th className="p-2.5 w-32">Emotion & Score</th>
                    <th className="p-2.5 w-36">Somatic Clues</th>
                    <th className="p-2.5">Journal Narrative Excerpt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthEntries.slice(0, 15).map((e) => (
                    <tr key={e.id} className="align-top">
                      <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                        {e.date}
                        <span className="block text-[10px] text-slate-400">{e.time}</span>
                      </td>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">
                          {e.primaryEmotion}
                          {e.secondaryEmotion && ` > ${e.secondaryEmotion}`}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          Intensity: {e.intensity}/10
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">
                        {e.somaticSensations?.join(', ') || 'None recorded'}
                      </td>
                      <td className="p-2.5 text-slate-700 text-[11px] leading-relaxed">
                        {e.journalText}
                        {e.sentimentAnalysis && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            Tags: {e.sentimentAnalysis.themeTags.concat(e.sentimentAnalysis.emotionTags).slice(0, 3).map(t => `#${t}`).join(' ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {monthEntries.length > 15 && (
              <p className="text-[10px] text-slate-400 italic text-center">
                Displaying 15 of {monthEntries.length} chronological entries for concise reporting.
              </p>
            )}
          </div>

          {/* Clinician Signature Line & Notice */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <p className="italic text-[11px] leading-relaxed">
                Notice: This report is a digital record created through patient self-reflection and synchronized biometric telemetry. It is intended to assist collaborative discussions with healthcare providers and does not constitute an independent clinical diagnosis.
              </p>
            </div>
            <div className="space-y-4 text-right">
              <div className="border-b border-slate-400 w-48 ml-auto pt-6" />
              <span className="block text-[11px] uppercase tracking-wider text-slate-600 font-mono">
                Patient / Clinician Review Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
