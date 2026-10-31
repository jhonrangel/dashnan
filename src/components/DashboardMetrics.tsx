import React from 'react';
import { ClaimRecord } from '../types/claims';
import { Package, CheckCircle2, Clock, Building2, DollarSign } from 'lucide-react';

interface DashboardMetricsProps {
  claims: ClaimRecord[];
  allClaimsCount: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ claims, allClaimsCount }) => {
  const totalRecords = claims.length;
  const totalQty = claims.reduce((acc, c) => acc + (Number(c.qty) || 0), 0);
  
  // Unique cases
  const uniqueCasos = new Set(claims.map((c) => c.caso)).size;

  const aceptadas = claims.filter((c) => c.reasonCode === 'ACEPTADA');
  const noAceptadas = claims.filter((c) => c.reasonCode === 'NO ACEPTADA');

  const tasaAceptacion = totalRecords > 0 ? Math.round((aceptadas.length / totalRecords) * 100) : 0;

  const b2bCount = claims.filter((c) => c.tipo === 'B2B').length;
  const b2cCount = claims.filter((c) => c.tipo === 'B2C').length;

  const sinCobroCount = claims.filter((c) => c.conCobro === 'SIN COBRO').length;
  const conCobroCount = claims.filter((c) => c.conCobro !== 'SIN COBRO').length;

  const sumDias = claims.reduce((acc, c) => acc + (Number(c.diasRespuesta) || 0), 0);
  const avgDiasRespuesta = totalRecords > 0 ? (sumDias / totalRecords).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Metric 1: Total Casos & Unidades */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#003366] transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Volumen Casos</span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-[#003366] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-[#003366] tabular-nums">
            {totalRecords}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({uniqueCasos} expedientes)
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span>Total QTY:</span>
          <strong className="font-mono text-slate-900">{totalQty} unidades</strong>
        </div>
      </div>

      {/* Metric 2: Aceptadas vs No Aceptadas */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#003366] transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Aceptación Adidas</span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-[#003366] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-[#003366] tabular-nums">
            {tasaAceptacion}%
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {aceptadas.length} de {totalRecords}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
          <span className="text-[#003366] font-semibold">Aceptadas: {aceptadas.length}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600">Negadas: {noAceptadas.length}</span>
        </div>
      </div>

      {/* Metric 3: Canal B2B vs B2C */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#003366] transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Canal Logístico</span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-[#003366] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-[#003366] tabular-nums">
            {b2bCount} <span className="text-xs font-normal text-slate-500">B2B</span>
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-2xl font-bold font-mono text-slate-700 tabular-nums">
            {b2cCount} <span className="text-xs font-normal text-slate-500">B2C</span>
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center gap-1 pt-2 border-t border-slate-100 font-mono">
          <span>Tiendas: <strong className="text-slate-900">{Math.round((b2bCount / (totalRecords || 1)) * 100)}%</strong></span>
          <span className="text-slate-300">·</span>
          <span>E-Comm: <strong className="text-slate-900">{Math.round((b2cCount / (totalRecords || 1)) * 100)}%</strong></span>
        </div>
      </div>

      {/* Metric 4: SLA Días de Respuesta */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#003366] transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">SLA Respuesta</span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-[#003366] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-[#003366] tabular-nums">
            {avgDiasRespuesta}
          </span>
          <span className="text-xs text-slate-500">días promedio</span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-[#003366] shrink-0" />
          <span>Tiempo de resolución Adidas</span>
        </div>
      </div>

      {/* Metric 5: Gestión de Cobro */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-[#003366] transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Estado Cobro</span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-[#003366] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-[#003366] tabular-nums">
            {sinCobroCount}
          </span>
          <span className="text-xs text-slate-500">Sin Cobro</span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
          <span>Sin cobro: <strong className="text-slate-900">{sinCobroCount}</strong></span>
          <span className="text-slate-300">·</span>
          <span>Con cobro: <strong className="text-slate-900">{conCobroCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
