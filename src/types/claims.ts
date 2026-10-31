export interface ClaimRecord {
  id: string;
  mes: string;
  responsableAbrir: string;
  caso: string;
  status: string;
  fechaNovedadKn: string;
  diasRespuesta: number;
  diasDespuesDespacho: string | number;
  nombreClienteTienda: string;
  orden: string;
  soAco: string;
  articulo: string;
  talla: string;
  qty: number;
  novedad: string;
  sku: string;
  conCobro: string;
  fechaRespuestaAdidas: string;
  tipo: 'B2B' | 'B2C' | string;
  observacion: string;
  reasonCode: 'ACEPTADA' | 'NO ACEPTADA' | 'EN ANALISIS' | string;
  responsableCerrar: string;
}

export interface ClaimFilters {
  search: string;
  mes: string;
  status: string;
  reasonCode: string;
  tipo: string;
  responsableAbrir: string;
  responsableCerrar: string;
  novedad: string;
  conCobro: string;
  observacion: string;
  tiendaCliente: string;
  articulo: string;
  talla: string;
  diasRespuestaOption: string;
  minDiasRespuesta: number | null;
  maxDiasRespuesta: number | null;
}

export type CursorType = 'hand' | 'happy' | 'anchor' | 'default';

export interface DashboardStats {
  totalRecords: number;
  totalQty: number;
  totalCasosUnicos: number;
  aceptadasCount: number;
  noAceptadasCount: number;
  tasaAceptacion: number;
  b2bCount: number;
  b2cCount: number;
  promedioDiasRespuesta: number;
  sinCobroCount: number;
  conCobroCount: number;
}
