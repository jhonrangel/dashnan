import React, { useState } from 'react';
import { ClaimFilters } from '../types/claims';
import {
  Search,
  Filter,
  RotateCcw,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

interface DashboardFiltersProps {
  filters: ClaimFilters;
  onFilterChange: (newFilters: ClaimFilters) => void;
  onResetFilters: () => void;
  uniqueValues: {
    meses: string[];
    statuses: string[];
    reasonCodes: string[];
    tipos: string[];
    responsablesAbrir: string[];
    responsablesCerrar: string[];
    novedades: string[];
    conCobroList: string[];
    observaciones: string[];
    tiendasClientes: string[];
    articulos: string[];
    tallas: string[];
  };
  totalFiltered: number;
  totalOriginal: number;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  uniqueValues,
  totalFiltered,
  totalOriginal
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search') return Boolean(val);
    if (key === 'minDiasRespuesta' || key === 'maxDiasRespuesta') return val !== null;
    return Boolean(val);
  }).length;

  const updateField = (field: keyof ClaimFilters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const applyPreset = (preset: Partial<ClaimFilters>) => {
    onFilterChange({
      ...filters,
      ...preset
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Row 1: Search bar, Filter Stats & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Global Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateField('search', e.target.value)}
            placeholder="Buscar por cliente, tienda, orden, artículo, talla, SKU o número de caso..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366] transition-all font-sans"
          />
          {filters.search && (
            <button
              onClick={() => updateField('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-slate-700 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#003366]" />
            <span>Casos:</span>
            <strong className="text-[#003366] font-bold">{totalFiltered}</strong>
            <span className="text-slate-400">/</span>
            <span>{totalOriginal}</span>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-700 hover:text-[#003366] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors font-medium"
          >
            <span>{showAdvanced ? 'Menos filtros' : '+ Más filtros'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#003366] hover:bg-[#002244] rounded-lg transition-colors font-semibold shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Quick Filter Presets (One-click) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
          Filtros Rápidos:
        </span>

        <button
          onClick={onResetFilters}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            activeFiltersCount === 0
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos ({totalOriginal})
        </button>

        <button
          onClick={() => applyPreset({ reasonCode: 'ACEPTADA' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.reasonCode === 'ACEPTADA'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Solo Aceptadas
        </button>

        <button
          onClick={() => applyPreset({ reasonCode: 'NO ACEPTADA' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.reasonCode === 'NO ACEPTADA'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Solo No Aceptadas
        </button>

        <button
          onClick={() => applyPreset({ tipo: 'B2B' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.tipo === 'B2B'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Canal B2B (Tiendas)
        </button>

        <button
          onClick={() => applyPreset({ tipo: 'B2C' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.tipo === 'B2C'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Canal B2C (E-Comm)
        </button>

        <button
          onClick={() => applyPreset({ conCobro: 'SIN COBRO' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.conCobro === 'SIN COBRO'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Sin Cobro
        </button>

        <button
          onClick={() => applyPreset({ observacion: 'UNIDAD EN BODEGA' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.observacion === 'UNIDAD EN BODEGA'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Obs: Bodega
        </button>

        <button
          onClick={() => applyPreset({ observacion: 'SE NIEGA RECLAMACION CON EVIDENCIA FILMICA' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.observacion === 'SE NIEGA RECLAMACION CON EVIDENCIA FILMICA'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Obs: Evidencia Fílmica
        </button>

        <button
          onClick={() => applyPreset({ diasRespuestaOption: '0' })}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
            filters.diasRespuestaOption === '0'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          SLA 0 Días
        </button>
      </div>

      {/* Row 3: Primary Dropdown Grid (7-columns including prominent Observación Logística KN) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Mes */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Mes
          </label>
          <select
            value={filters.mes}
            onChange={(e) => updateField('mes', e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
          >
            <option value="">Todos los meses</option>
            {uniqueValues.meses.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Observación Logística KN (Prominente) */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-[#003366] uppercase tracking-wider mb-1 truncate" title="Observación Logística KN">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
            <span>Obs. Logística KN</span>
          </label>
          <select
            value={filters.observacion}
            onChange={(e) => updateField('observacion', e.target.value)}
            className={`w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none truncate font-medium ${
              filters.observacion
                ? 'bg-blue-50 border-[#003366] text-[#003366] font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="">Todas las observaciones</option>
            {uniqueValues.observaciones.map((obs) => (
              <option key={obs} value={obs}>
                {obs}
              </option>
            ))}
          </select>
        </div>

        {/* Reason Code */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Reason Code
          </label>
          <select
            value={filters.reasonCode}
            onChange={(e) => updateField('reasonCode', e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
          >
            <option value="">Todos los motivos</option>
            {uniqueValues.reasonCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        {/* Canal Tipo */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Canal
          </label>
          <select
            value={filters.tipo}
            onChange={(e) => updateField('tipo', e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
          >
            <option value="">Todos los canales</option>
            {uniqueValues.tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Abre Caso */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Abre Caso
          </label>
          <select
            value={filters.responsableAbrir}
            onChange={(e) => updateField('responsableAbrir', e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
          >
            <option value="">Todos</option>
            {uniqueValues.responsablesAbrir.map((resp) => (
              <option key={resp} value={resp}>
                {resp}
              </option>
            ))}
          </select>
        </div>

        {/* Cierra Caso */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Cierra Caso
          </label>
          <select
            value={filters.responsableCerrar}
            onChange={(e) => updateField('responsableCerrar', e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
          >
            <option value="">Todos</option>
            {uniqueValues.responsablesCerrar.map((resp) => (
              <option key={resp} value={resp}>
                {resp}
              </option>
            ))}
          </select>
        </div>

        {/* SLA Días */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            SLA Respuesta
          </label>
          <select
            value={filters.diasRespuestaOption || ''}
            onChange={(e) => updateField('diasRespuestaOption', e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
          >
            <option value="">Cualquier SLA</option>
            <option value="0">0 días (Mismo día)</option>
            <option value="1">1 día</option>
            <option value="2+">2 o más días</option>
          </select>
        </div>
      </div>

      {/* Row 4: Secondary / Advanced Filters (Collapsible for compactness) */}
      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs animate-in fade-in duration-150">
          {/* Tienda / Cliente */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tienda / Cliente
            </label>
            <select
              value={filters.tiendaCliente || ''}
              onChange={(e) => updateField('tiendaCliente', e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none truncate"
            >
              <option value="">Todas las tiendas y clientes</option>
              {uniqueValues.tiendasClientes.map((tc) => (
                <option key={tc} value={tc}>
                  {tc}
                </option>
              ))}
            </select>
          </div>

          {/* Artículo */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Artículo
            </label>
            <select
              value={filters.articulo || ''}
              onChange={(e) => updateField('articulo', e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
            >
              <option value="">Todos</option>
              {uniqueValues.articulos.map((art) => (
                <option key={art} value={art}>
                  {art}
                </option>
              ))}
            </select>
          </div>

          {/* Talla */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Talla
            </label>
            <select
              value={filters.talla || ''}
              onChange={(e) => updateField('talla', e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
            >
              <option value="">Todas</option>
              {uniqueValues.tallas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Novedad */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Novedad
            </label>
            <select
              value={filters.novedad}
              onChange={(e) => updateField('novedad', e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none"
            >
              <option value="">Todas</option>
              {uniqueValues.novedades.map((nov) => (
                <option key={nov} value={nov}>
                  {nov}
                </option>
              ))}
            </select>
          </div>

          {/* Condición de Cobro */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Condición Cobro
            </label>
            <select
              value={filters.conCobro}
              onChange={(e) => updateField('conCobro', e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs focus:ring-1 focus:ring-[#003366] focus:outline-none truncate"
            >
              <option value="">Todos (Cobro)</option>
              {uniqueValues.conCobroList.map((cc) => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
