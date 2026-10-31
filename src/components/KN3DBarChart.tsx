import React, { useState } from 'react';

export interface Bar3DItem {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  secondaryValue?: string | number;
  color?: string;
}

interface KN3DBarChartProps {
  title: string;
  subtitle?: string;
  items: Bar3DItem[];
  height?: number;
  showTrendArrow?: boolean;
  valueSuffix?: string;
  onItemClick?: (id: string) => void;
  selectedId?: string;
}

export const KN3DBarChart: React.FC<KN3DBarChartProps> = ({
  title,
  subtitle,
  items,
  height = 310,
  showTrendArrow = true,
  valueSuffix = 'casos',
  onItemClick,
  selectedId
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const chartHeight = height - 50; // Increased vertical room for 3D bars

  // SVG Geometry Calculations (Enlarged bars and perspective)
  const n = items.length;
  const barWidth = Math.min(Math.max(46, Math.floor(480 / (n * 1.4))), 68);
  const depthX = 15;
  const depthY = 10;

  return (
    <div className="bg-[#001833] rounded-xl border border-[#003366] p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]">
      {/* Background Coordinate Grid like reference image */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00a3e0 1px, transparent 1px), linear-gradient(to bottom, #00a3e0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div>
          <h4 className="text-xs font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {title}
          </h4>
          {subtitle && <p className="text-[10px] text-slate-300">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded border border-cyan-400/30">
          Barras 3D KN
        </span>
      </div>

      {/* SVG 3D Bars Viewport */}
      <div className="relative z-10 w-full" style={{ height: `${chartHeight + 35}px` }}>
        <svg
          width="100%"
          height={chartHeight + 35}
          viewBox={`0 0 ${Math.max(480, n * 80)} ${chartHeight + 35}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible select-none"
        >
          <defs>
            {/* Front Gradient matching the reference image's vibrant glowing blue */}
            <linearGradient id="bar-grad-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="35%" stopColor="#0077b6" />
              <stop offset="100%" stopColor="#003366" />
            </linearGradient>

            {/* Front Gradient for Hovered/Selected */}
            <linearGradient id="bar-grad-front-active" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#caf0f8" />
              <stop offset="30%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#004080" />
            </linearGradient>

            {/* Side Depth Gradient (Shadow facet) */}
            <linearGradient id="bar-grad-side" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#004e82" />
              <stop offset="100%" stopColor="#001830" />
            </linearGradient>

            {/* Top Cap Bevel Highlight */}
            <linearGradient id="bar-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#90e0ef" />
            </linearGradient>

            {/* Glowing Arrow Drop Shadow */}
            <filter id="arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.8" />
            </filter>

            {/* Floor Reflection Grid */}
            <linearGradient id="floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0077b6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#001830" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Floor plane base line */}
          <line
            x1="20"
            y1={chartHeight}
            x2={Math.max(480, n * 80) - 20}
            y2={chartHeight}
            stroke="#0077b6"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Background Telemetry Grid Lines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = chartHeight - ratio * (chartHeight - 30);
            return (
              <g key={i}>
                <line
                  x1="30"
                  y1={y}
                  x2={Math.max(480, n * 80) - 30}
                  y2={y}
                  stroke="#003366"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <text
                  x="15"
                  y={y + 3}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(maxValue * ratio)}
                </text>
              </g>
            );
          })}

          {/* 3D Extruded Bar Columns */}
          {items.map((item, idx) => {
            const barH = Math.max((item.value / maxValue) * (chartHeight - 40), 18);
            const totalWidth = Math.max(480, n * 80);
            const spacing = totalWidth / (n + 1);
            const x = spacing * (idx + 1) - barWidth / 2;
            const y = chartHeight - barH;

            const isHovered = hoveredId === item.id;
            const isSelected = selectedId === item.id;

            return (
              <g
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onItemClick && onItemClick(item.id)}
                className="cursor-pointer transition-transform duration-150"
              >
                {/* Floor glow under bar */}
                <ellipse
                  cx={x + barWidth / 2 + depthX / 2}
                  cy={chartHeight + 4}
                  rx={barWidth * 0.7}
                  ry="5"
                  fill="#00b4d8"
                  opacity={isHovered ? 0.6 : 0.3}
                />

                {/* 1. FRONT FACE */}
                <path
                  d={`M ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${chartHeight} L ${x} ${chartHeight} Z`}
                  fill={isHovered || isSelected ? 'url(#bar-grad-front-active)' : 'url(#bar-grad-front)'}
                  stroke="#00e5ff"
                  strokeWidth={isHovered ? '1.5' : '0.6'}
                  strokeOpacity={isHovered ? 1 : 0.5}
                />

                {/* 2. RIGHT DEPTH FACE */}
                <path
                  d={`M ${x + barWidth} ${y} L ${x + barWidth + depthX} ${y - depthY} L ${x + barWidth + depthX} ${chartHeight - depthY} L ${x + barWidth} ${chartHeight} Z`}
                  fill="url(#bar-grad-side)"
                  stroke="#004e82"
                  strokeWidth="0.6"
                />

                {/* 3. TOP ILLUMINATED CAP */}
                <path
                  d={`M ${x} ${y} L ${x + depthX} ${y - depthY} L ${x + barWidth + depthX} ${y - depthY} L ${x + barWidth} ${y} Z`}
                  fill="url(#bar-grad-top)"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />

                {/* Top Value Label above 3D bar */}
                <text
                  x={x + barWidth / 2 + depthX / 2}
                  y={y - depthY - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="drop-shadow-sm font-mono"
                >
                  {item.value}
                </text>

                {/* Bottom X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="sans-serif"
                >
                  {item.label}
                </text>

                {item.sublabel && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 28}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {item.sublabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* DYNAMIC SOARING WHITE ASCENDING ARROW (Exact match to reference image!) */}
          {showTrendArrow && items.length >= 2 && (() => {
            const totalWidth = Math.max(480, n * 80);
            const spacing = totalWidth / (n + 1);

            // Starting point from bottom left
            const startX = spacing * 0.8;
            const startY = chartHeight - 15;

            // Target endpoint at the highest / last column
            const lastIdx = n - 1;
            const lastH = Math.max((items[lastIdx].value / maxValue) * (chartHeight - 40), 18);
            const endX = spacing * (lastIdx + 1) + barWidth / 2 + depthX + 15;
            const endY = chartHeight - lastH - depthY - 20;

            // Control curve points for an accelerating swoop
            const cpX = (startX + endX) * 0.45;
            const cpY = startY - 10;

            return (
              <g className="pointer-events-none">
                {/* Background Shadow line for glow */}
                <path
                  d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
                  fill="none"
                  stroke="#00b4d8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.4"
                  filter="url(#arrow-glow)"
                />

                {/* White Main Glowing Arrow Body */}
                <path
                  d={`M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />

                {/* Arrow Head Tip */}
                <polygon
                  points={`${endX},${endY - 6} ${endX - 16},${endY + 2} ${endX - 10},${endY - 4} ${endX - 12},${endY - 14}`}
                  fill="#FFFFFF"
                  filter="url(#arrow-glow)"
                />
              </g>
            );
          })()}
        </svg>

        {/* Floating Tooltip */}
        {hoveredId && (() => {
          const hoveredItem = items.find((i) => i.id === hoveredId);
          if (!hoveredItem) return null;
          return (
            <div className="absolute top-2 right-2 bg-slate-900/90 text-white px-3 py-1 rounded-md text-xs font-mono border border-cyan-400/40 shadow-lg pointer-events-none z-20">
              <strong className="text-cyan-300">{hoveredItem.label}:</strong> {hoveredItem.value} {valueSuffix}
              {hoveredItem.secondaryValue !== undefined && (
                <span className="text-slate-300 ml-1.5">({hoveredItem.secondaryValue})</span>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
