import React, { useState } from 'react';

export interface DonutSliceItem {
  id: string;
  label: string;
  shortLabel?: string;
  count: number;
  qty?: number;
  color?: string;
}

interface KNStyleDonutChartProps {
  title: string;
  subtitle?: string;
  data: DonutSliceItem[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
  onSliceClick?: (id: string) => void;
}

// Tonal blue palette matching the user's reference image
const TONAL_BLUES = [
  '#003366', // Deepest Kuehne+Nagel navy (42% in image)
  '#004e82', // Dark ocean blue
  '#256fa6', // Mid blue
  '#5392c5', // Steel / soft blue (17% in image)
  '#90bde0', // Powder blue (14% in image)
  '#b9d7ef'  // Very light ice blue
];

export const KNStyleDonutChart: React.FC<KNStyleDonutChartProps> = ({
  title,
  subtitle,
  data,
  size = 260,
  centerText,
  centerSubtext,
  onSliceClick
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.count, 0) || 1;

  // Calculate arc angles
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.28;
  const labelR = (outerR + innerR) / 2;
  const tickStartR = outerR;
  const tickEndR = outerR + 8;
  const textR = tickEndR + 6;

  let currentAngle = -Math.PI / 2; // Start from top 12 o'clock

  const slices = data.map((item, idx) => {
    const fraction = item.count / total;
    const angleDelta = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDelta;
    const midAngle = startAngle + angleDelta / 2;
    currentAngle = endAngle;

    const pct = Math.round(fraction * 100);

    // Outer arc endpoints
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);

    // Inner arc endpoints
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const largeArc = angleDelta > Math.PI ? 1 : 0;

    // SVG path command
    const pathD = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    // Center coordinates for percentage label inside slice
    const labelX = cx + labelR * Math.cos(midAngle);
    const labelY = cy + labelR * Math.sin(midAngle);

    // Tick line start & end
    const tickStartX = cx + tickStartR * Math.cos(midAngle);
    const tickStartY = cy + tickStartR * Math.sin(midAngle);
    const tickEndX = cx + tickEndR * Math.cos(midAngle);
    const tickEndY = cy + tickEndR * Math.sin(midAngle);

    // Outside label position
    const isRightSide = Math.cos(midAngle) >= 0;
    const extLabelX = cx + textR * Math.cos(midAngle);
    const extLabelY = cy + textR * Math.sin(midAngle);

    const color = item.color || TONAL_BLUES[idx % TONAL_BLUES.length];

    return {
      item,
      idx,
      fraction,
      pct,
      pathD,
      labelX,
      labelY,
      tickStartX,
      tickStartY,
      tickEndX,
      tickEndY,
      extLabelX,
      extLabelY,
      isRightSide,
      color,
      midAngle
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-[#003366] transition-all">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-[#003366] tracking-tight uppercase">
            {title}
          </h4>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {total} casos
        </span>
      </div>

      {/* SVG Donut Matching User Image Exactly */}
      <div className="relative py-2 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none"
        >
          {/* Inner Tinted Disc (Mint / Soft ice cyan disc matching user's image) */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="#c8e6e8"
            className="transition-colors"
          />

          {/* Slices */}
          {slices.map((s) => {
            const isHovered = hoveredIdx === s.idx;
            return (
              <g
                key={s.item.id}
                onMouseEnter={() => setHoveredIdx(s.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSliceClick && onSliceClick(s.item.id)}
                className="cursor-pointer transition-transform duration-150"
              >
                {/* Arc Slice */}
                <path
                  d={s.pathD}
                  fill={s.color}
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  className="transition-opacity hover:opacity-90"
                  style={{
                    filter: isHovered ? 'brightness(1.1) drop-shadow(0 2px 5px rgba(0,0,0,0.25))' : 'none'
                  }}
                />

                {/* In-Slice Percentage Text (white font inside arc, like reference image) */}
                {s.pct >= 6 && (
                  <text
                    x={s.labelX}
                    y={s.labelY + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={s.pct >= 20 ? '11' : '10'}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none drop-shadow-xs"
                  >
                    {s.pct}%
                  </text>
                )}

                {/* External radial tick line + label for visible slices */}
                {s.pct >= 8 && (
                  <>
                    <line
                      x1={s.tickStartX}
                      y1={s.tickStartY}
                      x2={s.tickEndX}
                      y2={s.tickEndY}
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x={s.extLabelX}
                      y={s.extLabelY + 3}
                      textAnchor={s.isRightSide ? 'start' : 'end'}
                      fill="#0f172a"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      className="pointer-events-none"
                    >
                      {s.item.shortLabel || s.item.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Center Hole Text (if provided) */}
          {centerText && (
            <g className="pointer-events-none">
              <text
                x={cx}
                y={cy - 2}
                textAnchor="middle"
                fill="#003366"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {centerText}
              </text>
              {centerSubtext && (
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {centerSubtext}
                </text>
              )}
            </g>
          )}
        </svg>

        {/* Floating Tooltip on Hover */}
        {hoveredIdx !== null && slices[hoveredIdx] && (
          <div className="absolute bottom-1 bg-slate-900/95 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-lg pointer-events-none border border-slate-700 animate-in fade-in duration-100 font-mono z-20">
            <span className="font-bold text-slate-100">{slices[hoveredIdx].item.label}:</span>{' '}
            <strong className="text-cyan-300">{slices[hoveredIdx].item.count} casos</strong> ({slices[hoveredIdx].pct}%)
            {slices[hoveredIdx].item.qty !== undefined && (
              <span className="text-slate-400 block text-[10px]">
                Total: {slices[hoveredIdx].item.qty} unidades QTY
              </span>
            )}
          </div>
        )}
      </div>

      {/* Clean Bottom Legend */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 font-mono">
        {data.slice(0, 3).map((d, i) => (
          <div
            key={d.id}
            onClick={() => onSliceClick && onSliceClick(d.id)}
            className="flex items-center gap-1 cursor-pointer hover:text-[#003366]"
          >
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: d.color || TONAL_BLUES[i % TONAL_BLUES.length] }}
            />
            <span className="truncate max-w-[80px]" title={d.label}>
              {d.shortLabel || d.label}:
            </span>
            <strong className="text-slate-900">{d.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
