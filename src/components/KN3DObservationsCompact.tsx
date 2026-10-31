import React, { useState } from 'react';
import { ClaimRecord } from '../types/claims';
import { KN_STANDARD_OBSERVATIONS } from '../data/initialData';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface KN3DObservationsCompactProps {
  claims: ClaimRecord[];
  onSelectObservacion?: (obs: string) => void;
  selectedObservacion?: string;
}

export const KN3DObservationsCompact: React.FC<KN3DObservationsCompactProps> = ({
  claims,
  onSelectObservacion,
  selectedObservacion
}) => {
  const [hoveredObs, setHoveredObs] = useState<string | null>(null);

  const obsCounts = React.useMemo(() => {
    const map = new Map<string, { count: number; qty: number; aceptadas: number; noAceptadas: number }>();

    KN_STANDARD_OBSERVATIONS.forEach((obs) => {
      map.set(obs, { count: 0, qty: 0, aceptadas: 0, noAceptadas: 0 });
    });

    claims.forEach((c) => {
      const obs = c.observacion || 'SIN OBSERVACION';
      if (!map.has(obs)) map.set(obs, { count: 0, qty: 0, aceptadas: 0, noAceptadas: 0 });
      const entry = map.get(obs)!;
      entry.count += 1;
      entry.qty += Number(c.qty) || 0;
      if (c.reasonCode === 'ACEPTADA') entry.aceptadas += 1;
      if (c.reasonCode === 'NO ACEPTADA') entry.noAceptadas += 1;
    });

    return Array.from(map.entries())
      .map(([obs, stats]) => ({
        obs,
        ...stats,
        pct: claims.length > 0 ? Math.round((stats.count / claims.length) * 100) : 0
      }))
      .filter((o) => o.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [claims]);

  const maxCount = Math.max(...obsCounts.map((o) => o.count), 1);

  return (
    <div className="bg-[#001833] rounded-xl border border-[#003366] p-4 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00a3e0 1px, transparent 1px), linear-gradient(to bottom, #00a3e0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
          <div>
            <h4 className="text-xs font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
              Observaciones Logísticas KN (Compacto 3D)
            </h4>
            <p className="text-[10px] text-slate-300">
              Causas raíz de faltantes y evidencia fílmica · Clic para filtrar
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded border border-cyan-400/30">
            {obsCounts.length} motivos
          </span>
        </div>

        {/* Compact 3D Horizontal Bars List */}
        <div className="space-y-2.5">
          {obsCounts.map((item) => {
            const widthPct = Math.max((item.count / maxCount) * 100, 15);
            const isSelected = selectedObservacion === item.obs;
            const isHovered = hoveredObs === item.obs;

            return (
              <div
                key={item.obs}
                onMouseEnter={() => setHoveredObs(item.obs)}
                onMouseLeave={() => setHoveredObs(null)}
                onClick={() => onSelectObservacion && onSelectObservacion(isSelected ? '' : item.obs)}
                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white/15 border-cyan-400'
                    : isHovered
                    ? 'bg-white/10 border-cyan-400/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-100 truncate text-[11px]" title={item.obs}>
                      {item.obs}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[11px]">
                    <span className="text-cyan-300 font-bold">{item.count} casos</span>
                    <span className="text-slate-400">({item.pct}%)</span>
                  </div>
                </div>

                {/* 3D Extruded Horizontal Bar */}
                <div className="relative h-4 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-cyan-900/40">
                  <div
                    className="h-full rounded-full transition-all duration-500 relative flex items-center justify-between px-2"
                    style={{
                      width: `${widthPct}%`,
                      background: isSelected
                        ? 'linear-gradient(90deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)'
                        : 'linear-gradient(90deg, #003366 0%, #0077b6 50%, #00b4d8 100%)',
                      boxShadow: '0 0 8px rgba(0, 180, 216, 0.4)'
                    }}
                  >
                    {/* Top specular sheen line */}
                    <div className="absolute inset-x-0 top-0.5 h-[1px] bg-white/60" />
                    <span className="text-[9px] font-mono font-bold text-white z-10">
                      {item.qty} uds
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-white/90 z-10">
                      <span>A:{item.aceptadas}</span>
                      <span>·</span>
                      <span>N:{item.noAceptadas}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-2">
          <span>A = Aceptadas (Bodega)</span>
          <span>·</span>
          <span>N = Negadas (Fílmica)</span>
        </span>
        <span className="text-cyan-300">Selecciona para filtrar</span>
      </div>
    </div>
  );
};
