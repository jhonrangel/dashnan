import React, { useState, useMemo, useEffect } from 'react';
import { ClaimRecord, ClaimFilters, CursorType } from './types/claims';
import { INITIAL_CLAIMS } from './data/initialData';
import { loadSavedClaims, saveClaimsToStorage, resetStorageToInitial, StorageMetadata } from './utils/storage';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { DashboardMetrics } from './components/DashboardMetrics';
import { ThreeDVisualizer } from './components/ThreeDVisualizer';
import { ThreeDEffectCharts } from './components/ThreeDEffectCharts';
import { KNAllObservationsDetail } from './components/KNAllObservationsDetail';
import { DashboardFilters } from './components/DashboardFilters';
import { ClaimsTable } from './components/ClaimsTable';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { exportClaimsToExcel, normalizeObservation } from './utils/excelParser';
import { Check, Database } from 'lucide-react';

const INITIAL_FILTERS: ClaimFilters = {
  search: '',
  mes: '',
  status: '',
  reasonCode: '',
  tipo: '',
  responsableAbrir: '',
  responsableCerrar: '',
  novedad: '',
  conCobro: '',
  observacion: '',
  tiendaCliente: '',
  articulo: '',
  talla: '',
  diasRespuestaOption: '',
  minDiasRespuesta: null,
  maxDiasRespuesta: null
};

export default function App() {
  // Load persistent data from online browser storage
  const [initialLoaded] = useState(() => loadSavedClaims());
  const [claims, setClaims] = useState<ClaimRecord[]>(initialLoaded.claims);
  const [storageMeta, setStorageMeta] = useState<StorageMetadata>(initialLoaded.metadata);

  const [filters, setFilters] = useState<ClaimFilters>(INITIAL_FILTERS);
  const [cursorType, setCursorType] = useState<CursorType>('hand');
  const [chartViewType, setChartViewType] = useState<'3d-effects' | 'webgl'>('3d-effects');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Compute unique dropdown values dynamically from current dataset
  const uniqueValues = useMemo(() => {
    const getUniques = (extractor: (c: ClaimRecord) => string) => {
      const set = new Set<string>();
      claims.forEach((c) => {
        const val = extractor(c);
        if (val && val.trim()) set.add(val.trim());
      });
      return Array.from(set).sort();
    };

    return {
      meses: getUniques((c) => c.mes),
      statuses: getUniques((c) => c.status),
      reasonCodes: getUniques((c) => c.reasonCode),
      tipos: getUniques((c) => c.tipo),
      responsablesAbrir: getUniques((c) => c.responsableAbrir),
      responsablesCerrar: getUniques((c) => c.responsableCerrar),
      novedades: getUniques((c) => c.novedad),
      conCobroList: getUniques((c) => c.conCobro),
      observaciones: getUniques((c) => normalizeObservation(c.observacion)),
      tiendasClientes: getUniques((c) => c.nombreClienteTienda),
      articulos: getUniques((c) => c.articulo),
      tallas: getUniques((c) => c.talla)
    };
  }, [claims]);

  // Filtered dataset for charts, metrics, and tables
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Search text
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const searchable = [
          claim.caso,
          claim.nombreClienteTienda,
          claim.orden,
          claim.soAco,
          claim.articulo,
          claim.talla,
          claim.sku,
          claim.observacion,
          claim.responsableAbrir,
          claim.responsableCerrar
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      if (filters.mes && claim.mes !== filters.mes) return false;
      if (filters.status && claim.status !== filters.status) return false;
      if (filters.reasonCode && claim.reasonCode !== filters.reasonCode) return false;
      if (filters.tipo && claim.tipo !== filters.tipo) return false;
      if (filters.responsableAbrir && claim.responsableAbrir !== filters.responsableAbrir) return false;
      if (filters.responsableCerrar && claim.responsableCerrar !== filters.responsableCerrar) return false;
      if (filters.novedad && claim.novedad !== filters.novedad) return false;
      if (filters.conCobro && claim.conCobro !== filters.conCobro) return false;
      if (filters.observacion && normalizeObservation(claim.observacion) !== normalizeObservation(filters.observacion)) return false;
      if (filters.tiendaCliente && claim.nombreClienteTienda !== filters.tiendaCliente) return false;
      if (filters.articulo && claim.articulo !== filters.articulo) return false;
      if (filters.talla && claim.talla !== filters.talla) return false;

      // SLA options
      if (filters.diasRespuestaOption) {
        const dias = Number(claim.diasRespuesta) || 0;
        if (filters.diasRespuestaOption === '0' && dias !== 0) return false;
        if (filters.diasRespuestaOption === '1' && dias !== 1) return false;
        if (filters.diasRespuestaOption === '2+' && dias < 2) return false;
      }

      return true;
    });
  }, [claims, filters]);

  // Claims filtered by all active filters EXCEPT 'mes', so 3D Month-over-Month bars dynamically reflect active filters!
  const claimsForMonthlyTrend = useMemo(() => {
    return claims.filter((claim) => {
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const searchable = [
          claim.caso,
          claim.nombreClienteTienda,
          claim.orden,
          claim.soAco,
          claim.articulo,
          claim.talla,
          claim.sku,
          claim.observacion,
          claim.responsableAbrir,
          claim.responsableCerrar
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      if (filters.status && claim.status !== filters.status) return false;
      if (filters.reasonCode && claim.reasonCode !== filters.reasonCode) return false;
      if (filters.tipo && claim.tipo !== filters.tipo) return false;
      if (filters.responsableAbrir && claim.responsableAbrir !== filters.responsableAbrir) return false;
      if (filters.responsableCerrar && claim.responsableCerrar !== filters.responsableCerrar) return false;
      if (filters.novedad && claim.novedad !== filters.novedad) return false;
      if (filters.conCobro && claim.conCobro !== filters.conCobro) return false;
      if (filters.observacion && normalizeObservation(claim.observacion) !== normalizeObservation(filters.observacion)) return false;
      if (filters.tiendaCliente && claim.nombreClienteTienda !== filters.tiendaCliente) return false;
      if (filters.articulo && claim.articulo !== filters.articulo) return false;
      if (filters.talla && claim.talla !== filters.talla) return false;

      if (filters.diasRespuestaOption) {
        const dias = Number(claim.diasRespuesta) || 0;
        if (filters.diasRespuestaOption === '0' && dias !== 0) return false;
        if (filters.diasRespuestaOption === '1' && dias !== 1) return false;
        if (filters.diasRespuestaOption === '2+' && dias < 2) return false;
      }

      return true;
    });
  }, [claims, filters]);

  // Replaces the previous database and saves online
  const handleDataLoaded = (newRecords: ClaimRecord[], fileName: string) => {
    const meta = saveClaimsToStorage(newRecords, fileName);
    setClaims(newRecords);
    setStorageMeta(meta);
    setFilters(INITIAL_FILTERS);
    showToast(`Se eliminó la data anterior y se guardaron ${newRecords.length} registros en línea desde ${fileName}.`);
  };

  const handleResetData = () => {
    const meta = resetStorageToInitial();
    setClaims(INITIAL_CLAIMS);
    setStorageMeta(meta);
    setFilters(INITIAL_FILTERS);
    showToast('Base en línea restablecida a los datos de ejemplo iniciales.');
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 flex flex-col font-sans selection:bg-[#003366] selection:text-white">
      {/* Interactive Custom Cursor (Manito 👆 / Carita Feliz 😊 / Ancla ⚓ / Normal 🖱️) */}
      <CustomCursor cursorType={cursorType} />

      {/* Corporate Navigation Header */}
      <Header
        cursorType={cursorType}
        onCursorChange={setCursorType}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExport={() => exportClaimsToExcel(filteredClaims)}
        onResetData={handleResetData}
        totalRecords={claims.length}
        storageMeta={storageMeta}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#003366] text-white text-xs font-semibold rounded-xl shadow-2xl border border-white/20 animate-in slide-in-from-bottom-3 duration-200">
          <Database className="w-4 h-4 text-cyan-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport - Crisp Gray Background */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* 1. FILTROS BIEN PROFESIONALES PRIMERO (Search, Presets Rápidos, Multi-Dropdowns) */}
        <section aria-label="Filtros Profesionales del Tablero">
          <DashboardFilters
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={() => setFilters(INITIAL_FILTERS)}
            uniqueValues={uniqueValues}
            totalFiltered={filteredClaims.length}
            totalOriginal={claims.length}
          />
        </section>

        {/* 2. Executive KPI Metrics (3 Colores: Azul KN, Blanco, Gris) */}
        <section aria-label="Métricas Principales">
          <DashboardMetrics claims={filteredClaims} allClaimsCount={claims.length} />
        </section>

        {/* 3. Selector de Visualización: Gráficas 2D con Efectos 3D vs WebGL 3D */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="text-[#003366] font-bold">Modo de Visualización:</span>
            <span className="text-slate-500 font-normal">Mes a Mes, 4 Donas 3D y Ranking</span>
          </div>

          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setChartViewType('3d-effects')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${
                chartViewType === '3d-effects'
                  ? 'bg-[#003366] text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📊 Dashboard 3D Compacto (Mes a Mes & Donas)</span>
            </button>
            <button
              onClick={() => setChartViewType('webgl')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${
                chartViewType === 'webgl'
                  ? 'bg-[#003366] text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🌐 WebGL 3D 360°</span>
            </button>
          </div>
        </div>

        {/* 4. Gráficas 2D con Efectos 3D Compactadas */}
        {chartViewType === '3d-effects' ? (
          <section aria-label="Gráficas 2D con Efectos 3D">
            <ThreeDEffectCharts
              claims={filteredClaims}
              allClaims={claims}
              monthlyTrendClaims={claimsForMonthlyTrend}
              selectedMonth={filters.mes}
              selectedObservacion={filters.observacion}
              onSelectMonth={(mes) => setFilters((f) => ({ ...f, mes }))}
              onSelectObservacion={(obs) => setFilters((f) => ({ ...f, observacion: obs }))}
              onSelectReasonCode={(code) => setFilters((f) => ({ ...f, reasonCode: code }))}
              onSelectTipo={(tipo) => setFilters((f) => ({ ...f, tipo }))}
              onSelectConCobro={(cobro) => setFilters((f) => ({ ...f, conCobro: cobro }))}
              onSelectNovedad={(novedad) => setFilters((f) => ({ ...f, novedad }))}
              onSelectResponsable={(resp) => setFilters((f) => ({ ...f, responsableAbrir: resp }))}
              onSelectTienda={(tienda) => setFilters((f) => ({ ...f, tiendaCliente: tienda }))}
              onSelectArticulo={(art) => setFilters((f) => ({ ...f, articulo: art }))}
            />
          </section>
        ) : (
          <section aria-label="Visualizador WebGL 3D">
            <ThreeDVisualizer claims={filteredClaims} />
          </section>
        )}

        {/* 5. Detalle Gráfico Completo de Todas las Observaciones Logísticas KN (Al final/más abajo) */}
        <section aria-label="Detalle Gráfico de Todas las Observaciones">
          <KNAllObservationsDetail
            claims={filteredClaims}
            allClaims={claims}
            selectedObservacion={filters.observacion}
            onSelectObservacion={(obs) => setFilters((f) => ({ ...f, observacion: obs }))}
          />
        </section>

        {/* 6. Tabla de Registros de Alta Densidad */}
        <section aria-label="Tabla de Registros">
          <ClaimsTable claims={filteredClaims} />
        </section>
      </main>

      {/* Excel Upload Modal with Online Persistence & Replacement */}
      <ExcelUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Clean Corporate Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#003366]">Kuehne + Nagel Logistics</span>
            <span>—</span>
            <span>Control de Novedades y Garantías Adidas</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Base en línea: {storageMeta.fileName}</span>
            <span>·</span>
            <span>{claims.length} registros guardados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
