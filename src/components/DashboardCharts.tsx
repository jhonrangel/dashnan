import React from 'react';
import { ClaimRecord } from '../types/claims';
import { KN_STANDARD_OBSERVATIONS } from '../data/initialData';
import { AlertCircle, Users } from 'lucide-react';

interface DashboardChartsProps {
  claims: ClaimRecord[];
  onSelectObservacionFilter?: (obs: string) => void;
  onSelectResponsableFilter?: (resp: string) => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  claims,
  onSelectObservacionFilter,
  onSelectResponsableFilter
}) => {
  // Breakdown of Observaciones
  const obsCounts = React.useMemo(() => {
    const map = new Map<string, { count: number; qty: number; aceptadas: number; noAceptadas: number }>();
    
    // Seed standard observations
    KN_STANDARD_OBSERVATIONS.forEach((obs) => {
      map.set(obs, { count: 0, qty: 0, aceptadas: 0, noAceptadas: 0 });
    });

    claims.forEach((c) => {
      const obs = c.observacion || 'SIN OBSERVACION';
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
      .map(([obs, stats]) => ({
        obs,
        ...stats,
        pct: claims.length > 0 ? Math.round((stats.count / claims.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [claims]);

  // Breakdown of Responsables (Abrir vs Cerrar)
  const responsablesStats = React.useMemo(() => {
    const map = new Map<
      string,
      { opened: number; closed: number; aceptadas: number; noAceptadas: number; totalQty: number }
    >();

    claims.forEach((c) => {
      const opener = c.responsableAbrir || 'DIANA';
      const closer = c.responsableCerrar || opener;

      if (!map.has(opener)) {
        map.set(opener, { opened: 0, closed: 0, aceptadas: 0, noAceptadas: 0, totalQty: 0 });
      }
      if (!map.has(closer)) {
        map.set(closer, { opened: 0, closed: 0, aceptadas: 0, noAceptadas: 0, totalQty: 0 });
      }

      map.get(opener)!.opened += 1;
      map.get(opener)!.totalQty += Number(c.qty) || 0;

      map.get(closer)!.closed += 1;
      if (c.reasonCode === 'ACEPTADA') map.get(closer)!.aceptadas += 1;
      if (c.reasonCode === 'NO ACEPTADA') map.get(closer)!.noAceptadas += 1;
    });

    return Array.from(map.entries()).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => (b.opened + b.closed) - (a.opened + a.closed));
  }, [claims]);

  const maxObsCount = Math.max(...obsCounts.map((o) => o.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chart 1: Resumen Maestro de Observaciones en 3 Colores */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-[#003366] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#003366]" />
              Resumen Maestro de Observaciones Logísticas KN
            </h4>
            <p className="text-xs text-slate-500">
              Distribución de causas raíz, evidencia fílmica y unidades en bodega
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {obsCounts.filter((o) => o.count > 0).length} motivos activos
          </span>
        </div>

        <div className="space-y-3">
          {obsCounts.map((item) => {
            return (
              <div
                key={item.obs}
                onClick={() => onSelectObservacionFilter && item.count > 0 && onSelectObservacionFilter(item.obs)}
                className={`group p-2 rounded-lg transition-all ${
                  item.count > 0
                    ? 'hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 truncate max-w-[70%]">
                    <span className="font-semibold text-slate-800 truncate">{item.obs}</span>
                    {item.count > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({item.qty} uds)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                    <span className="font-bold text-slate-900">{item.count} casos</span>
                    <span className="text-slate-500">({item.pct}%)</span>
                  </div>
                </div>

                {/* Multi-segmented 3D Cylindrical Progress Bar (Blue and Gray) */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex relative shadow-inner border border-slate-200">
                  {item.aceptadas > 0 && (
                    <div
                      className="h-full transition-all duration-500 relative"
                      style={{
                        width: `${(item.aceptadas / maxObsCount) * 100}%`,
                        background: 'linear-gradient(180deg, #336699 0%, #003366 50%, #001f3f 100%)'
                      }}
                      title={`Aceptadas: ${item.aceptadas}`}
                    >
                      <div className="absolute inset-x-0 top-0.5 h-[1.5px] bg-white/70" />
                    </div>
                  )}
                  {item.noAceptadas > 0 && (
                    <div
                      className="h-full transition-all duration-500 relative"
                      style={{
                        width: `${(item.noAceptadas / maxObsCount) * 100}%`,
                        background: 'linear-gradient(180deg, #94A3B8 0%, #64748B 50%, #475569 100%)'
                      }}
                      title={`No Aceptadas: ${item.noAceptadas}`}
                    >
                      <div className="absolute inset-x-0 top-0.5 h-[1.5px] bg-white/70" />
                    </div>
                  )}
                  {item.count === 0 && (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#003366]" /> Aceptadas (Azul KN)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#64748B]" /> No Aceptadas (Gris)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Clic en motivo para filtrar</span>
        </div>
      </div>

      {/* Chart 2: Carga por Responsable */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-[#003366] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#003366]" />
                Carga Operativa por Responsable
              </h4>
              <p className="text-xs text-slate-500">
                Casos abiertos vs cerrados por analista
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {responsablesStats.map((resp) => (
              <div
                key={resp.name}
                onClick={() => onSelectResponsableFilter && onSelectResponsableFilter(resp.name)}
                className="p-3 rounded-lg border border-slate-200 hover:border-[#003366] hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {resp.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900">{resp.name}</span>
                      <span className="block text-[11px] text-slate-500">Analista Logístico</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-[#003366]">
                      {resp.opened} abiertos
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {resp.closed} cerrados
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-md font-mono border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aceptadas:</span>
                    <strong className="text-[#003366] font-bold">{resp.aceptadas}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Negadas:</span>
                    <strong className="text-slate-600 font-bold">{resp.noAceptadas}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Efectividad Global:</span>
          <span className="text-xs font-mono font-bold text-[#003366]">
            Total {claims.length} casos analizados por el equipo KN
          </span>
        </div>
      </div>
    </div>
  );
};
