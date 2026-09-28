import React, { useState, useMemo } from 'react';
import { EMOTIONS_DATA, findEmotionById, getEmotionPath } from '../data/emotionsData';
import { EmotionNode, EmotionSelection } from '../types/journal';
import { Search, Sparkles, ChevronRight, RotateCcw, Info, HeartPulse } from 'lucide-react';

interface FeelingsWheelProps {
  selectedEmotion: EmotionSelection | null;
  onSelectEmotion: (selection: EmotionSelection) => void;
  onQuickJournal?: () => void;
}

interface ArcSegment {
  node: EmotionNode;
  parent?: EmotionNode;
  level: 'primary' | 'secondary' | 'tertiary';
  startAngle: number; // degrees
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
  lightColor: string;
}

export const FeelingsWheel: React.FC<FeelingsWheelProps> = ({
  selectedEmotion,
  onSelectEmotion,
  onQuickJournal,
}) => {
  const [hoveredNode, setHoveredNode] = useState<EmotionNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTierTab, setMobileTierTab] = useState<'primary' | 'secondary' | 'tertiary'>('primary');

  const size = 600;
  const center = size / 2;
  const R0 = 60;  // Center hole radius
  const R1 = 130; // Primary ring outer
  const R2 = 205; // Secondary ring outer
  const R3 = 285; // Tertiary ring outer

  // Build arc segments
  const arcSegments = useMemo(() => {
    const segments: ArcSegment[] = [];
    const totalPrimaries = EMOTIONS_DATA.length;
    const primarySpan = 360 / totalPrimaries;

    EMOTIONS_DATA.forEach((primaryNode, pIndex) => {
      const pStart = pIndex * primarySpan;
      const pEnd = (pIndex + 1) * primarySpan;

      // Primary segment
      segments.push({
        node: primaryNode,
        level: 'primary',
        startAngle: pStart,
        endAngle: pEnd,
        innerRadius: R0,
        outerRadius: R1,
        color: primaryNode.color,
        lightColor: primaryNode.lightColor,
      });

      const secondaries = primaryNode.children || [];
      const numSec = secondaries.length || 1;
      const secSpan = primarySpan / numSec;

      secondaries.forEach((secNode, sIndex) => {
        const sStart = pStart + sIndex * secSpan;
        const sEnd = sStart + secSpan;

        // Secondary segment
        segments.push({
          node: secNode,
          parent: primaryNode,
          level: 'secondary',
          startAngle: sStart,
          endAngle: sEnd,
          innerRadius: R1,
          outerRadius: R2,
          color: primaryNode.color,
          lightColor: primaryNode.lightColor,
        });

        const tertiaries = secNode.children || [];
        const numTert = tertiaries.length || 1;
        const tertSpan = secSpan / numTert;

        tertiaries.forEach((tertNode, tIndex) => {
          const tStart = sStart + tIndex * tertSpan;
          const tEnd = tStart + tertSpan;

          // Tertiary segment
          segments.push({
            node: tertNode,
            parent: secNode,
            level: 'tertiary',
            startAngle: tStart,
            endAngle: tEnd,
            innerRadius: R2,
            outerRadius: R3,
            color: primaryNode.color,
            lightColor: primaryNode.lightColor,
          });
        });
      });
    });

    return segments;
  }, []);

  // Helper to generate SVG path for arc
  const describeArc = (
    cx: number,
    cy: number,
    rIn: number,
    rOut: number,
    startAngle: number,
    endAngle: number
  ) => {
    // Subtract 0.4 degrees for crisp gutter separation
    const pad = 0.5;
    const actualStart = startAngle + pad;
    const actualEnd = endAngle - pad;

    const startRad = ((actualStart - 90) * Math.PI) / 180.0;
    const endRad = ((actualEnd - 90) * Math.PI) / 180.0;

    const x1Out = cx + rOut * Math.cos(startRad);
    const y1Out = cy + rOut * Math.sin(startRad);
    const x2Out = cx + rOut * Math.cos(endRad);
    const y2Out = cy + rOut * Math.sin(endRad);

    const x1In = cx + rIn * Math.cos(endRad);
    const y1In = cy + rIn * Math.sin(endRad);
    const x2In = cx + rIn * Math.cos(startRad);
    const y2In = cy + rIn * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${x1Out} ${y1Out}`,
      `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out} ${y2Out}`,
      `L ${x1In} ${y1In}`,
      `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x2In} ${y2In}`,
      'Z',
    ].join(' ');
  };

  const handleSegmentClick = (node: EmotionNode) => {
    const path = getEmotionPath(node.id);
    const primary = path[0]?.name || node.name;
    const secondary = path[1]?.name;
    const tertiary = path[2]?.name;

    onSelectEmotion({
      primary,
      secondary,
      tertiary,
      fullPath: path.map((n) => n.name),
      node,
    });
  };

  // Check if a node is in the active selected path
  const isSelectedPath = (nodeId: string) => {
    if (!selectedEmotion) return false;
    const path = getEmotionPath(selectedEmotion.node.id);
    return path.some((p) => p.id === nodeId);
  };

  // Filter search results
  const filteredSearchEmotions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const matches: { node: EmotionNode; path: EmotionNode[] }[] = [];

    const searchTree = (nodes: EmotionNode[]) => {
      for (const n of nodes) {
        if (n.name.toLowerCase().includes(query) || n.description.toLowerCase().includes(query)) {
          matches.push({ node: n, path: getEmotionPath(n.id) });
        }
        if (n.children) searchTree(n.children);
      }
    };
    searchTree(EMOTIONS_DATA);
    return matches.slice(0, 8);
  }, [searchQuery]);

  const activeDisplayNode = hoveredNode || selectedEmotion?.node;

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200/80 transition-all">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight font-serif-heading">
              Interactive Feelings Wheel
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tap from the inner core to outer nuances to pinpoint your exact emotion and trigger AI prompts.
          </p>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search feeling (e.g. anxious)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}

            {/* Quick search dropdown */}
            {filteredSearchEmotions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 max-h-60 overflow-y-auto">
                {filteredSearchEmotions.map(({ node, path }) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      handleSegmentClick(node);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-medium text-slate-800 text-sm group-hover:text-amber-700">
                        {node.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        ({node.level})
                      </span>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {path.map((p) => p.name).join(' → ')}
                      </p>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedEmotion && (
            <button
              onClick={() => {
                const defaultJoy = EMOTIONS_DATA[0];
                handleSegmentClick(defaultJoy);
              }}
              title="Reset selection"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Wheel Canvas & Details Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Radial Wheel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform select-none filter drop-shadow-sm transition-transform duration-300"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Arcs */}
              {arcSegments.map((seg) => {
                const isSelected = isSelectedPath(seg.node.id);
                const isHovered = hoveredNode?.id === seg.node.id;

                // Adjust color intensity based on level
                let fillColor = seg.color;
                let opacity = 0.88;
                if (seg.level === 'secondary') opacity = 0.72;
                if (seg.level === 'tertiary') opacity = 0.58;

                if (isSelected) {
                  opacity = 1.0;
                } else if (selectedEmotion && !isSelected) {
                  opacity *= 0.45; // Dim non-selected branches subtly
                }

                if (isHovered) {
                  opacity = Math.min(1.0, opacity + 0.25);
                }

                // Middle angle for label placement
                const midAngle = (seg.startAngle + seg.endAngle) / 2;
                const midRadius = (seg.innerRadius + seg.outerRadius) / 2;
                const midRad = ((midAngle - 90) * Math.PI) / 180.0;
                const textX = center + midRadius * Math.cos(midRad);
                const textY = center + midRadius * Math.sin(midRad);

                // Calculate angle for text rotation
                let textRot = midAngle;
                if (midAngle > 90 && midAngle < 270) {
                  textRot += 180;
                }

                // Font size according to level
                const fontSize = seg.level === 'primary' ? '12px' : seg.level === 'secondary' ? '10.5px' : '9px';
                const fontWeight = isSelected ? '700' : seg.level === 'primary' ? '600' : '500';

                return (
                  <g
                    key={`${seg.level}-${seg.node.id}`}
                    onClick={() => handleSegmentClick(seg.node)}
                    onMouseEnter={() => setHoveredNode(seg.node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-all duration-200 group"
                  >
                    <path
                      d={describeArc(center, center, seg.innerRadius, seg.outerRadius, seg.startAngle, seg.endAngle)}
                      fill={fillColor}
                      fillOpacity={opacity}
                      stroke={isSelected ? '#1e293b' : '#ffffff'}
                      strokeWidth={isSelected ? 2.5 : 1}
                      className="transition-all duration-200"
                    />

                    {/* Text Label */}
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRot}, ${textX}, ${textY})`}
                      fill={isSelected ? '#0f172a' : '#ffffff'}
                      style={{
                        fontSize,
                        fontWeight,
                        pointerEvents: 'none',
                        textShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                      className="tracking-tight"
                    >
                      {seg.node.name}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub Circle */}
              <circle
                cx={center}
                cy={center}
                r={R0 - 4}
                fill="#ffffff"
                stroke={activeDisplayNode ? activeDisplayNode.color : '#e2e8f0'}
                strokeWidth={3}
                className="transition-all duration-300 drop-shadow-sm cursor-pointer"
                onClick={() => {
                  if (activeDisplayNode) handleSegmentClick(activeDisplayNode);
                }}
              />

              {/* Center Text */}
              <text
                x={center}
                y={center - 6}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#0f172a"
                className="font-serif font-bold text-xs tracking-tight"
              >
                {activeDisplayNode?.name || 'Feelings'}
              </text>
              <text
                x={center}
                y={center + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#64748b"
                className="text-[9px] font-medium tracking-wide uppercase"
              >
                {activeDisplayNode?.level || 'Wheel'}
              </text>
            </svg>
          </div>

          {/* Wheel Legend / Level indicators */}
          <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span>Inner: Primary Core</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Middle: Nuance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Outer: Specificity</span>
            </div>
          </div>
        </div>

        {/* Selected Emotion Detail & Guidance (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-200/60">
          {activeDisplayNode ? (
            <div className="space-y-5">
              {/* Path Breadcrumb */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Emotional Spectrum</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5">
                  {getEmotionPath(activeDisplayNode.id).map((step, idx, arr) => (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => handleSegmentClick(step)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          step.id === activeDisplayNode.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {step.name}
                      </button>
                      {idx < arr.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Main Emotion Card */}
              <div
                className="p-5 rounded-2xl border transition-all"
                style={{
                  backgroundColor: `${activeDisplayNode.color}12`,
                  borderColor: `${activeDisplayNode.color}35`,
                }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: activeDisplayNode.color }}
                  >
                    {activeDisplayNode.name}
                  </h3>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${activeDisplayNode.color}25`,
                      color: activeDisplayNode.color,
                    }}
                  >
                    {activeDisplayNode.level}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                  {activeDisplayNode.description}
                </p>
              </div>

              {/* Somatic Clues */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>Common Bodily Signals</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeDisplayNode.somaticClues.map((clue, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs bg-white text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      {clue}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Callout */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    AI prompts are ready below based on this feeling.
                  </p>
                  {onQuickJournal && (
                    <button
                      onClick={onQuickJournal}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
                    >
                      Start Journaling
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                Select an emotion on the wheel
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click any inner, middle, or outer slice on the wheel to explore somatic clues and generate tailored AI prompts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
