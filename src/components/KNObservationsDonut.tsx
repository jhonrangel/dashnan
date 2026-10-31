import React, { useState } from 'react';
import { ClaimRecord } from '../types/claims';
import { AlertCircle, Filter, RotateCcw, Check, ListFilter } from 'lucide-react';
import { normalizeObservation } from '../utils/excelParser';

interface KNObservationsDonutProps {
  claims: ClaimRecord[];
  onSelectObservacion?: (obs: string) => void;
  selectedObservacion?: string;
}

// Tonal blue palette strictly matching the reference image /public/assets/aistudio/image_c6efd9df.png
const OBSERVATION_COLORS: Record<string, string> = {
  'UNIDAD EN BODEGA': '#003366', // Deep KN Navy (primary 42% slice)
  'SE NIEGA RECLAMACION CON EVIDENCIA FILMICA': '#2b6ea6', // Ocean blue
  'TROQUE DE PRODUCTO': '#5291c7', // Steel blue
  'ERROR EN DESPACHO': '#80b5de', // Powder blue
  'SIN OBSERVACION': '#b0d6f2' // Ice light blue
};

const FALLBACK_BLUES = ['#003366', '#2b6ea6', '#5291c7', '#80b5de', '#b0d6f2'];

export const KNObservationsDonut: React.FC<KNObservationsDonutProps> = ({
  claims,
  onSelectObservacion,
  selectedObservacion
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = claims.length || 1;

  // Group by observacion using normalized text (removes tilde/accent duplication)
  const obsData = React.useMemo(() => {
    const map = new Map<string, { count: number; qty: number; aceptadas: number; noAceptadas: number }>();

    claims.forEach((c) => {
      const obs = normalizeObservation(c.observacion || 'SIN OBSERVACION');
      if (!map.has(obs)) {
        map.set(obs, { count: 0, qty: 0, aceptadas: 0, noAceptadas: 0 });
      }
      const entry = map.get(obs)!;
      entry.count += 1;
      entry.qty += Number(c.qty) || 0;
      if (c.reasonCode === 'ACEPTADA') entry.aceptadas += 1;
      if (c.reasonCode === 'NO ACEPTADA') entry.noAceptadas += 1;
    });

    return Array.from(map.entries())
      .map(([obs, stats], idx) => {
        const pct = Math.round((stats.count / total) * 100);
        let shortLabel = obs;
        if (obs.includes('BODEGA')) shortLabel = 'BODEGA';
        else if (obs.includes('FILMICA') || obs.includes('NIEGA')) shortLabel = 'EVID. FÍLMICA';
        else if (obs.length > 12) shortLabel = obs.substring(0, 11) + '…';

        const color = OBSERVATION_COLORS[obs] || FALLBACK_BLUES[idx % FALLBACK_BLUES.length];

        return {
          id: obs,
          label: obs,
          shortLabel,
          count: stats.count,
          qty: stats.qty,
          aceptadas: stats.aceptadas,
          noAceptadas: stats.noAceptadas,
          pct,
          color
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [claims, total]);

  // SVG Geometry for Enlarged Donut (Increased size for high impact)
  const size = 270;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42; // ~113px
  const innerR = size * 0.27; // ~73px
  const labelR = (outerR + innerR) / 2;
  const tickStartR = outerR;
  const tickEndR = outerR + 9;
  const textR = tickEndR + 7;

  let currentAngle = -Math.PI / 2;

  const slices = obsData.map((item, idx) => {
    const fraction = item.count / total;
    const angleDelta = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDelta;
    const midAngle = startAngle + angleDelta / 2;
    currentAngle = endAngle;

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

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    const labelX = cx + labelR * Math.cos(midAngle);
    const labelY = cy + labelR * Math.sin(midAngle);

    const tickStartX = cx + tickStartR * Math.cos(midAngle);
    const tickStartY = cy + tickStartR * Math.sin(midAngle);
    const tickEndX = cx + tickEndR * Math.cos(midAngle);
    const tickEndY = cy + tickEndR * Math.sin(midAngle);

    const isRightSide = Math.cos(midAngle) >= 0;
    const extLabelX = cx + textR * Math.cos(midAngle);
    const extLabelY = cy + textR * Math.sin(midAngle);

    return {
      item,
      idx,
      fraction,
      pct: item.pct,
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
      color: item.color
    };
  });

  const topObservation = obsData[0];
  const activeObservationItem = obsData.find((o) => o.id === selectedObservacion);
  const displayObs = activeObservationItem || topObservation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-full flex flex-col justify-between hover:border-[#003366] transition-all">
      {/* Header with Title and "Filtrico Lista" */}
      <div className="space-y-2 pb-2 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#003366]" />
            <div>
              <h4 className="text-xs font-bold text-[#003366] uppercase tracking-wider leading-tight">
                Observaciones Logísticas KN
              </h4>
              <p className="text-[10px] text-slate-500">
                Gráfico de Dona Ampliado · Distribución de Causas Raíz
              </p>
            </div>
          </div>

          {/* Filtro Lista Desplegable (Filtrico Lista) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-[#003366]" />
              <span>Lista:</span>
            </span>
            <div className="relative">
              <select
                value={selectedObservacion || ''}
                onChange={(e) => onSelectObservacion && onSelectObservacion(e.target.value)}
                className={`text-xs pl-2.5 pr-7 py-1.5 rounded-lg border font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#003366] truncate max-w-[210px] sm:max-w-[280px] ${
                  selectedObservacion
                    ? 'bg-[#003366] text-white border-[#003366] font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
                title="Filtrar por Observación Logística en Lista"
              >
                <option value="" className="bg-white text-slate-800">
                  Todas las observaciones ({claims.length} casos)
                </option>
                {obsData.map((o) => (
                  <option key={o.id} value={o.id} className="bg-white text-slate-800 font-medium">
                    {o.id} ({o.count} casos · {o.pct}%)
                  </option>
                ))}
              </select>
            </div>

            {selectedObservacion && (
              <button
                onClick={() => onSelectObservacion && onSelectObservacion('')}
                className="p-1 text-slate-400 hover:text-[#003366] hover:bg-slate-100 rounded-md transition-colors"
                title="Limpiar filtro de observación"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {selectedObservacion && (
          <div className="flex items-center justify-between bg-blue-50/80 border border-[#003366]/20 px-2.5 py-1 rounded-lg text-xs text-[#003366]">
            <span className="font-semibold truncate max-w-[80%]">
              Filtro activo: <strong className="font-bold">{selectedObservacion}</strong>
            </span>
            <button
              onClick={() => onSelectObservacion && onSelectObservacion('')}
              className="text-[11px] font-bold text-[#003366] hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>✕ Quitar filtro</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Body: ONLY THE ENLARGED DONUT CHART (Centrado, Grande y Limpio) */}
      <div className="relative py-4 flex flex-col items-center justify-center flex-1">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none max-w-full"
        >
          {/* Outer subtle shadow / glow ring */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 2}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Center Tinted Circle (#c8e6e8 mint / soft cyan matching user reference) */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="#c8e6e8"
            className="transition-colors drop-shadow-xs"
          />

          {/* Slices with high contrast white boundaries */}
          {slices.map((s) => {
            const isHovered = hoveredIdx === s.idx;
            const isSelected = selectedObservacion === s.item.id;

            return (
              <g
                key={s.item.id}
                onMouseEnter={() => setHoveredIdx(s.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() =>
                  onSelectObservacion &&
                  onSelectObservacion(isSelected ? '' : s.item.id)
                }
                className="cursor-pointer transition-all duration-200"
              >
                {/* Arc Slice */}
                <path
                  d={s.pathD}
                  fill={s.color}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? '3' : '2'}
                  strokeLinejoin="round"
                  style={{
                    filter:
                      isSelected || isHovered
                        ? 'brightness(1.12) drop-shadow(0 4px 10px rgba(0, 51, 102, 0.35))'
                        : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))',
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isSelected ? 'scale(1.04)' : isHovered ? 'scale(1.02)' : 'scale(1)'
                  }}
                />

                {/* In-Slice Percentage Text (White, Bold, Monospace) */}
                {s.pct >= 6 && (
                  <text
                    x={s.labelX}
                    y={s.labelY + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={s.pct >= 20 ? '13' : '11'}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    {s.pct}%
                  </text>
                )}

                {/* External Pointer Tick and Label */}
                {s.pct >= 8 && (
                  <>
                    <line
                      x1={s.tickStartX}
                      y1={s.tickStartY}
                      x2={s.tickEndX}
                      y2={s.tickEndY}
                      stroke="#475569"
                      strokeWidth="1.2"
                    />
                    <text
                      x={s.extLabelX}
                      y={s.extLabelY + 3.5}
                      textAnchor={s.isRightSide ? 'start' : 'end'}
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      className="pointer-events-none select-none"
                    >
                      {s.item.shortLabel}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Center Core Text & Statistics */}
          {displayObs && (
            <g className="pointer-events-none">
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fill="#003366"
                fontSize="18"
                fontWeight="800"
                fontFamily="monospace"
              >
                {displayObs.pct}%
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="9"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {displayObs.shortLabel}
              </text>
              <text
                x={cx}
                y={cy + 22}
                textAnchor="middle"
                fill="#475569"
                fontSize="8"
                fontWeight="600"
                fontFamily="monospace"
              >
                {displayObs.count} casos
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIdx !== null && slices[hoveredIdx] && (
          <div className="absolute bottom-2 bg-slate-900/95 text-white px-3 py-1.5 rounded-lg text-xs shadow-xl pointer-events-none border border-slate-700 font-mono z-30 animate-in fade-in duration-150">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: slices[hoveredIdx].item.color }}
              />
              <span>{slices[hoveredIdx].item.label}</span>
            </div>
            <div className="text-cyan-300 text-[11px] mt-0.5">
              {slices[hoveredIdx].item.count} casos ({slices[hoveredIdx].pct}%) · {slices[hoveredIdx].item.qty} unidades
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">
              Aceptadas: {slices[hoveredIdx].item.aceptadas} · Negadas: {slices[hoveredIdx].item.noAceptadas}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#003366]" />
          <span>Haz clic en un segmento o en la lista para filtrar</span>
        </span>
        <span className="text-[#003366] font-bold">
          {selectedObservacion ? 'Filtro Aplicado' : `${obsData.length} Motivos`}
        </span>
      </div>
    </div>
  );
};
