import React, { useState, useRef } from 'react';
import { ClaimRecord } from '../types/claims';
import { parseExcelFile, downloadSampleTemplate } from '../utils/excelParser';
import { Upload, FileSpreadsheet, X, Check, AlertTriangle, Download, ArrowRight, RefreshCw, Database } from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (newRecords: ClaimRecord[], fileName: string) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<ClaimRecord[] | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    setCurrentFileName(file.name);
    try {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        throw new Error('Formato no compatible. Por favor sube un archivo Excel (.xlsx, .xls) o CSV.');
      }
      const records = await parseExcelFile(file);
      if (records.length === 0) {
        throw new Error('El archivo no contiene filas procesables.');
      }
      setPreviewRows(records);
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el archivo Excel. Verifica el formato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (previewRows && previewRows.length > 0) {
      onDataLoaded(previewRows, currentFileName || 'Nuevo_Excel_KN.xlsx');
      onClose();
      setPreviewRows(null);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#003366] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Cargar y Reemplazar Excel en Línea</h3>
              <p className="text-xs text-slate-200">
                Elimina los datos anteriores y guarda la nueva base en línea permanentemente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Dropzone */}
          {!previewRows && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#003366] bg-slate-100 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#003366] hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-full bg-slate-100 text-[#003366] flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-200">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-[#003366] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Haz clic o arrastra el nuevo archivo Excel aquí
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Archivos soportados: Microsoft Excel (.xlsx, .xls) o CSV delimitado
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#003366] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
                <Database className="w-3.5 h-3.5 text-[#003366]" />
                <span>Al cargar, reemplaza los datos y queda guardado en línea automáticamente</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Error al procesar archivo</strong>
                {error}
              </div>
            </div>
          )}

          {/* Preview of Parsed Rows */}
          {previewRows && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-100 border border-[#003366] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#003366]">
                      Archivo: {currentFileName}
                    </h5>
                    <p className="text-xs text-slate-600">
                      Se identificaron <strong className="font-mono text-slate-900">{previewRows.length}</strong> registros listos para reemplazar la data anterior.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewRows(null)}
                  className="text-xs text-[#003366] underline hover:text-[#002244] font-semibold"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Persistence Online Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2.5 text-slate-700">
                <RefreshCw className="w-4 h-4 text-[#003366] shrink-0" />
                <span>
                  <strong>Acción programada:</strong> Eliminará la base anterior, cargará estos {previewRows.length} registros y los guardará en línea para todas las sesiones.
                </span>
              </div>

              {/* Table Preview */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Vista previa de los primeros 4 registros a guardar en línea:
                </span>
                <div className="border border-slate-200 rounded-lg overflow-x-auto text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">CASO</th>
                        <th className="p-2">MES</th>
                        <th className="p-2">RESPONSABLE</th>
                        <th className="p-2">CLIENTE/TIENDA</th>
                        <th className="p-2">ARTÍCULO</th>
                        <th className="p-2 text-right">QTY</th>
                        <th className="p-2">REASON CODE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {previewRows.slice(0, 4).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-[#003366]">{r.caso}</td>
                          <td className="p-2 text-slate-600 font-sans">{r.mes}</td>
                          <td className="p-2 text-slate-700">{r.responsableAbrir}</td>
                          <td className="p-2 text-slate-600 font-sans truncate max-w-[140px]">
                            {r.nombreClienteTienda}
                          </td>
                          <td className="p-2 text-slate-700">{r.articulo}</td>
                          <td className="p-2 text-right text-slate-900 font-bold">{r.qty}</td>
                          <td className="p-2">
                            <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#003366] border border-slate-300">
                              {r.reasonCode}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Download Template & Columns Info */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 text-[#003366] hover:underline font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar plantilla modelo (.xlsx)
            </button>
            <span>21 columnas oficiales KN validadas</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          {previewRows && (
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg shadow-sm transition-all"
            >
              <span>Reemplazar y Guardar en Línea</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
