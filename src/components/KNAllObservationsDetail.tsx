import React, { useState, useMemo } from 'react';
import { ClaimRecord } from '../types/claims';
import {
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  RotateCcw,
  Package,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { normalizeObservation } from '../utils/excelParser';

interface KNAllObservationsDetailProps {
  claims: ClaimRecord[];
  allClaims: ClaimRecord[];
  selectedObservacion?: string;
  onSelectObservacion?: (obs: string) => void;
}

// Tonal blue gradient stops for consistent corporate KN branding
const BLUE_SHADES = [
  '#003366',
  '#004e82',
  '#256fa6',
  '#3b82f6',
  '#5392c5',
  '#72a8d4',
  '#90bde0',
  '#b3d4ec'
];

export const KNAllObservationsDetail: React.FC<KNAllObservationsDetailProps> = ({
  claims,
  allClaims,
  selectedObservacion,
  onSelectObservacion
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'cases' | 'qty' | 'acceptance' | 'alpha'>('cases');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const total = claims.length || 1;

  // Aggregate all unique observations with detailed statistics
  const allObservationsData = useMemo(() => {
    const map = new Map<
      string,
      {
        count: number;
        qty: number;
        aceptadas: number;
        noAceptadas: number;
        tiendas: Set<string>;
      }
    >();

    claims.forEach((c) => {
      const obs = normalizeObservation(c.observacion || 'SIN OBSERVACION');
      if (!map.has(obs)) {
        map.set(obs, {
          count: 0,
          qty: 0,
          aceptadas: 0,
          noAceptadas: 0,
          tiendas: new Set<string>()
        });
      }
      const entry = map.get(obs)!;
      entry.count += 1;
      entry.qty += Number(c.qty) || 0;
      if (c.reasonCode === 'ACEPTADA') entry.aceptadas += 1;
      if (c.reasonCode === 'NO ACEPTADA') entry.noAceptadas += 1;
      if (c.nombreClienteTienda) entry.tiendas.add(c.nombreClienteTienda);
    });

    const list = Array.from(map.entries()).map(([obs, stats], idx) => {
      const pct = Math.round((stats.count / total) * 100);
      const acceptancePct = stats.count > 0 ? Math.round((stats.aceptadas / stats.count) * 100) : 0;
      const color = BLUE_SHADES[idx % BLUE_SHADES.length];

      return {
        id: obs,
        label: obs,
        count: stats.count,
        qty: stats.qty,
        aceptadas: stats.aceptadas,
        noAceptadas: stats.noAceptadas,
        pct,
        acceptancePct,
        tiendasCount: stats.tiendas.size,
        color
      };
    });

    return list;
  }, [claims, total]);

  // Filtered and sorted observations
  const filteredAndSorted = useMemo(() => {
    let result = allObservationsData;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => o.label.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortBy === 'cases') return b.count - a.count;
      if (sortBy === 'qty') return b.qty - a.qty;
      if (sortBy === 'acceptance') return b.acceptancePct - a.acceptancePct;
      if (sortBy === 'alpha') return a.label.localeCompare(b.label);
      return 0;
    });

    return result;
  }, [allObservationsData, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  const maxCountInList = Math.max(...allObservationsData.map((o) => o.count), 1);
  const totalQtySum = allObservationsData.reduce((acc, o) => acc + o.qty, 0);
  const totalAceptadas = allObservationsData.reduce((acc, o) => acc + o.aceptadas, 0);
  const globalAcceptanceRate = claims.length > 0 ? Math.round((totalAceptadas / claims.length) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header with Title and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#003366] tracking-tight uppercase">
              Detalle Gráfico y Maestro de Todas las Observaciones Logísticas KN
            </h3>
            <p className="text-xs text-slate-500">
              Desglose exhaustivo de motivos con barras de frecuencia, unidades y resolución Adidas
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#003366] bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            {allObservationsData.length} motivos distintos · {claims.length} casos activos
          </span>
          {selectedObservacion && (
            <button
              onClick={() => onSelectObservacion && onSelectObservacion('')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Quitar Filtro ({selectedObservacion})</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip strictly in 3-color palette */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#003366] text-white flex items-center justify-center text-xs font-bold">
            #
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Motivos</div>
            <div className="text-sm font-bold text-slate-900 font-mono">{allObservationsData.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-200 text-[#003366] flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Casos Analizados</div>
            <div className="text-sm font-bold text-[#003366] font-mono">{claims.length}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-200 text-[#003366] flex items-center justify-center">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Unidades (QTY)</div>
            <div className="text-sm font-bold text-slate-900 font-mono">{totalQtySum} uds</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#003366] text-white flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Tasa Aceptación</div>
            <div className="text-sm font-bold text-[#003366] font-mono">{globalAcceptanceRate}% Bodega</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search input & Sorting buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar observación por nombre..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Ordenar por:</span>
          <button
            onClick={() => setSortBy('cases')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              sortBy === 'cases'
                ? 'bg-[#003366] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Casos
          </button>
          <button
            onClick={() => setSortBy('qty')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              sortBy === 'qty'
                ? 'bg-[#003366] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Unidades QTY
          </button>
          <button
            onClick={() => setSortBy('acceptance')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              sortBy === 'acceptance'
                ? 'bg-[#003366] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            % Aceptación
          </button>
          <button
            onClick={() => setSortBy('alpha')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              sortBy === 'alpha'
                ? 'bg-[#003366] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Graphical Breakdown List: Clean, high-density cards with progress bars */}
      <div className="space-y-2.5">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No se encontraron observaciones que coincidan con la búsqueda.
          </div>
        ) : (
          paginatedItems.map((item, index) => {
            const isSelected = selectedObservacion === item.id;
            const widthPct = Math.max((item.count / maxCountInList) * 100, 8);
            const globalIndex = (currentPage - 1) * pageSize + index + 1;

            return (
              <div
                key={item.id}
                onClick={() =>
                  onSelectObservacion &&
                  onSelectObservacion(isSelected ? '' : item.id)
                }
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/70 border-[#003366] shadow-sm ring-1 ring-[#003366]'
                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top line: Name, Badges, Count */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 truncate max-w-[70%]">
                    <span className="w-5 h-5 rounded-md bg-[#003366] text-white text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                      {globalIndex}
                    </span>
                    <span
                      className="font-bold text-slate-900 text-xs truncate group-hover:text-[#003366] transition-colors"
                      title={item.id}
                    >
                      {item.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="font-mono font-bold text-[#003366] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.count} casos ({item.pct}%)
                    </span>
                    <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {item.qty} unidades
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                        isSelected
                          ? 'bg-[#003366] text-white'
                          : 'bg-slate-200 text-slate-700 group-hover:bg-[#003366] group-hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Filtrado' : 'Filtrar'}
                    </span>
                  </div>
                </div>

                {/* Graphical 3D Progress Bar */}
                <div className="relative h-3 bg-white rounded-full overflow-hidden border border-slate-200 mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-500 relative"
                    style={{
                      width: `${widthPct}%`,
                      background: isSelected
                        ? 'linear-gradient(90deg, #002244 0%, #003366 50%, #256fa6 100%)'
                        : 'linear-gradient(90deg, #003366 0%, #256fa6 60%, #5392c5 100%)'
                    }}
                  >
                    {/* Top specular highlight line */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                  </div>
                </div>

                {/* Bottom line: Resolution stats (Aceptadas vs Negadas) & Stores */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-[#003366]" />
                      <strong>Aceptadas:</strong> {item.aceptadas} ({item.acceptancePct}%)
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <strong>Negadas:</strong> {item.noAceptadas} ({100 - item.acceptancePct}%)
                    </span>
                  </div>

                  <span className="text-slate-500 text-[10px]">
                    Impacta en {item.tiendasCount} tiendas/clientes diferentes
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredAndSorted.length)} de{' '}
            {filteredAndSorted.length} observaciones
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-700 text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
