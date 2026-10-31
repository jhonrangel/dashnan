import React, { useState, useMemo } from 'react';
import { ClaimRecord } from '../types/claims';
import { exportClaimsToExcel } from '../utils/excelParser';
import {
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface ClaimsTableProps {
  claims: ClaimRecord[];
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({ claims }) => {
  const [sortField, setSortField] = useState<keyof ClaimRecord>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);

  const handleSort = (field: keyof ClaimRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [claims, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedClaims.length / pageSize) || 1;
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClaims.slice(start, start + pageSize);
  }, [sortedClaims, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#003366]" />
          <h4 className="text-sm font-semibold text-slate-900">
            Detalle Registros de Novedades ({claims.length})
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportClaimsToExcel(claims)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#002244] rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 select-none">
              <th
                onClick={() => handleSort('caso')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>CASO</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('responsableAbrir')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>ABIERTO POR</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('nombreClienteTienda')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>CLIENTE / TIENDA</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('articulo')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>ARTÍCULO / TALLA</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('qty')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>QTY</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('diasRespuesta')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>SLA (DÍAS)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('tipo')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>CANAL</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('reasonCode')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>REASON CODE</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3">OBSERVACIÓN</th>
              <th className="py-2.5 px-3 text-center">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedClaims.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  No se encontraron casos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              paginatedClaims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {claim.caso}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                    <span className="font-medium text-[#003366]">{claim.responsableAbrir}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 max-w-[220px] truncate" title={claim.nombreClienteTienda}>
                    {claim.nombreClienteTienda}
                  </td>
                  <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                    <span className="text-slate-900 font-semibold">{claim.articulo}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({claim.talla})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {claim.qty}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        claim.diasRespuesta === 0
                          ? 'bg-[#003366] text-white border-[#003366]'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {claim.diasRespuesta} d
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        claim.tipo === 'B2B'
                          ? 'bg-slate-100 text-[#003366] font-bold border-[#003366]/30'
                          : 'bg-white text-slate-700 font-medium border-slate-200'
                      }`}
                    >
                      {claim.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {claim.reasonCode === 'ACEPTADA' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span
                        className={`font-semibold text-[11px] ${
                          claim.reasonCode === 'ACEPTADA' ? 'text-[#003366]' : 'text-slate-600'
                        }`}
                      >
                        {claim.reasonCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-[200px] truncate" title={claim.observacion}>
                    {claim.observacion}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="p-1 rounded text-slate-400 hover:text-[#003366] hover:bg-slate-100 transition-colors"
                      title="Ver todos los detalles del caso"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#003366]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400">·</span>
          <span>
            Página <strong className="font-mono">{currentPage}</strong> de{' '}
            <strong className="font-mono">{totalPages}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#003366] text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-mono leading-none">
                    {selectedClaim.caso}
                  </h4>
                  <span className="text-xs text-blue-200">
                    Mes: {selectedClaim.mes} · Status: {selectedClaim.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Cliente / Tienda
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {selectedClaim.nombreClienteTienda}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Canal / Tipo
                  </span>
                  <span className="font-mono font-bold text-[#003366]">
                    {selectedClaim.tipo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">ORDEN</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedClaim.orden || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">SO / ACO</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedClaim.soAco || 'Sin ACO'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">SKU</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedClaim.sku}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">ARTÍCULO</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedClaim.articulo}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">TALLA</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedClaim.talla}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">CANTIDAD (QTY)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedClaim.qty} uds
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold text-[11px]">Reason Code:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                      selectedClaim.reasonCode === 'ACEPTADA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedClaim.reasonCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                    Observación Detallada
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedClaim.observacion}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Abre Caso</span>
                  <span className="font-semibold text-slate-800">
                    {selectedClaim.responsableAbrir} ({selectedClaim.fechaNovedadKn})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Cierra Caso</span>
                  <span className="font-semibold text-slate-800">
                    {selectedClaim.responsableCerrar} ({selectedClaim.fechaRespuestaAdidas})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Días SLA</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedClaim.diasRespuesta} días
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Condición Cobro</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedClaim.conCobro}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-1.5 text-xs font-semibold text-[#003366] hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
