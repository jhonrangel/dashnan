import * as XLSX from 'xlsx';
import { ClaimRecord } from '../types/claims';
import { KN_STANDARD_HEADERS } from '../data/initialData';

// Helper to normalize strings for comparison
function cleanHeader(key: string): string {
  return key
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

// Normalizes observation text removing accents/tildes so "RECLAMACIÓN" and "RECLAMACION" don't split
export function normalizeObservation(obs: string): string {
  if (!obs) return 'SIN OBSERVACION';
  const cleaned = String(obs)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strips tildes: Ó->O, Í->I, etc.
    .replace(/\s+/g, ' '); // Collapses redundant spaces

  if (cleaned.includes('NIEGA') && cleaned.includes('FILMICA')) {
    return 'SE NIEGA RECLAMACION CON EVIDENCIA FILMICA';
  }
  if (cleaned.includes('UNIDAD') && cleaned.includes('BODEGA')) {
    return 'UNIDAD EN BODEGA';
  }
  return cleaned;
}

export function parseExcelFile(file: File): Promise<ClaimRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with raw values
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('El archivo no contiene filas con datos válidos.');
        }

        const parsedRecords: ClaimRecord[] = rawRows.map((row, index) => {
          // Map dynamic header keys to expected fields
          const rowMap: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            rowMap[cleanHeader(k)] = row[k];
          });

          const getValue = (...possibleKeys: string[]): any => {
            for (const key of possibleKeys) {
              const cleaned = cleanHeader(key);
              if (rowMap[cleaned] !== undefined && rowMap[cleaned] !== '') {
                return rowMap[cleaned];
              }
            }
            return '';
          };

          const rawQty = getValue('QTY', 'CANTIDAD', 'UNIDADES');
          const qty = isNaN(Number(rawQty)) || rawQty === '' ? 1 : Number(rawQty);

          const rawDias = getValue('DIAS RESPUESTA', 'DIAS DE RESPUESTA', 'DIASRESPUESTA');
          const diasRespuesta = isNaN(Number(rawDias)) || rawDias === '' ? 0 : Number(rawDias);

          const mes = String(getValue('MES', 'MES DEL CASO') || 'MARZO').trim().toUpperCase();
          const responsableAbrir = String(getValue('RESPONSABLE ABRIR CASO', 'RESPONSABLE ABRIR', 'ABIERTO POR') || 'DIANA').trim().toUpperCase();
          const caso = String(getValue('CASO', 'NUMERO CASO', 'ID CASO') || `CASO ${index + 1}`).trim().toUpperCase();
          const status = String(getValue('STATUS', 'ESTADO') || 'CERRADO').trim().toUpperCase();
          
          let fechaNovedad = getValue('FECHA DE NOVEDAD KN', 'FECHA NOVEDAD', 'FECHA KN');
          if (fechaNovedad instanceof Date) {
            fechaNovedad = `${fechaNovedad.getDate()}/${fechaNovedad.getMonth() + 1}/${fechaNovedad.getFullYear()}`;
          }

          let fechaRespuesta = getValue('FECHA RESPUESTA ADIDAS', 'FECHA ADIDAS', 'FECHA RESPUESTA');
          if (fechaRespuesta instanceof Date) {
            fechaRespuesta = `${fechaRespuesta.getDate()}/${fechaRespuesta.getMonth() + 1}/${fechaRespuesta.getFullYear()}`;
          }

          const rawReason = String(getValue('REASON CODE', 'REASONCODE', 'MOTIVO', 'ESTADO RECLAMACION') || 'EN ANALISIS').trim().toUpperCase();
          let reasonCode: ClaimRecord['reasonCode'] = rawReason;
          if (rawReason.includes('ACEPTADA') && !rawReason.includes('NO ACEPTADA')) {
            reasonCode = 'ACEPTADA';
          } else if (rawReason.includes('NO ACEPTADA') || rawReason.includes('NEGADA') || rawReason.includes('RECHAZADA')) {
            reasonCode = 'NO ACEPTADA';
          }

          const rawTipo = String(getValue('TIPO', 'CANAL') || 'B2B').trim().toUpperCase();
          const tipo = rawTipo.includes('B2C') ? 'B2C' : 'B2B';

          return {
            id: `UPLOAD-${Date.now()}-${index + 1}`,
            mes,
            responsableAbrir,
            caso,
            status,
            fechaNovedadKn: String(fechaNovedad || ''),
            diasRespuesta,
            diasDespuesDespacho: getValue('DIAS DESPUES DE DESPACHO', 'DIAS DESPACHO'),
            nombreClienteTienda: String(getValue('NOMBRE CLIENTE / TIENDA', 'NOMBRE CLIENTE', 'TIENDA', 'CLIENTE') || 'CLIENTE LOGÍSTICO').trim(),
            orden: String(getValue('ORDEN', 'NUMERO ORDEN', 'PEDIDO') || '').trim(),
            soAco: String(getValue('SO / ACO', 'SO', 'ACO') || '').trim(),
            articulo: String(getValue('ARTICULO', 'ITEM') || '').trim().toUpperCase(),
            talla: String(getValue('TALLA', 'SIZE') || 'UN').trim(),
            qty,
            novedad: String(getValue('NOVEDAD', 'TIPO NOVEDAD') || 'FALTANTE').trim().toUpperCase(),
            sku: String(getValue('SKU') || '').trim().replace(/[\r\n]+/g, ''),
            conCobro: String(getValue('CON COBRO', 'COBRO') || 'SIN COBRO').trim().toUpperCase(),
            fechaRespuestaAdidas: String(fechaRespuesta || ''),
            tipo,
            observacion: normalizeObservation(String(getValue('OBSERVACION', 'OBSERVACIONES', 'DETALLE') || 'SIN OBSERVACION')),
            reasonCode,
            responsableCerrar: String(getValue('RESPONSABLE CERRAR CASO', 'RESPONSABLE CERRAR', 'CERRADO POR') || responsableAbrir).trim().toUpperCase()
          };
        });

        resolve(parsedRecords);
      } catch (err: any) {
        reject(err || new Error('Error al procesar el archivo Excel.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo.'));
    };

    reader.readAsBinaryString(file);
  });
}

export function exportClaimsToExcel(claims: ClaimRecord[], filename = 'Reporte_Novedades_KN_Adidas.xlsx'): void {
  const data = claims.map((c) => ({
    'MES': c.mes,
    'RESPONSABLE ABRIR CASO': c.responsableAbrir,
    'CASO': c.caso,
    'STATUS': c.status,
    'FECHA DE NOVEDAD KN': c.fechaNovedadKn,
    'DIAS RESPUESTA': c.diasRespuesta,
    'DIAS DESPUES DE DESPACHO': c.diasDespuesDespacho,
    'NOMBRE CLIENTE / TIENDA': c.nombreClienteTienda,
    'ORDEN': c.orden,
    'SO / ACO': c.soAco,
    'ARTICULO': c.articulo,
    'TALLA': c.talla,
    'QTY': c.qty,
    'NOVEDAD': c.novedad,
    'SKU': c.sku,
    'CON COBRO': c.conCobro,
    'FECHA RESPUESTA ADIDAS': c.fechaRespuestaAdidas,
    'TIPO': c.tipo,
    'OBSERVACION': c.observacion,
    'REASON CODE': c.reasonCode,
    'RESPONSABLE CERRAR CASO': c.responsableCerrar
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { header: KN_STANDARD_HEADERS });
  
  // Set generous column widths
  worksheet['!cols'] = [
    { wch: 10 }, // MES
    { wch: 24 }, // RESPONSABLE ABRIR
    { wch: 12 }, // CASO
    { wch: 12 }, // STATUS
    { wch: 20 }, // FECHA DE NOVEDAD
    { wch: 14 }, // DIAS RESPUESTA
    { wch: 22 }, // DIAS DESPUES DE DESPACHO
    { wch: 32 }, // NOMBRE CLIENTE / TIENDA
    { wch: 16 }, // ORDEN
    { wch: 16 }, // SO / ACO
    { wch: 14 }, // ARTICULO
    { wch: 8 },  // TALLA
    { wch: 8 },  // QTY
    { wch: 14 }, // NOVEDAD
    { wch: 16 }, // SKU
    { wch: 14 }, // CON COBRO
    { wch: 22 }, // FECHA RESPUESTA ADIDAS
    { wch: 10 }, // TIPO
    { wch: 42 }, // OBSERVACION
    { wch: 16 }, // REASON CODE
    { wch: 24 }  // RESPONSABLE CERRAR
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Casos KN');
  XLSX.writeFile(workbook, filename);
}

export function downloadSampleTemplate(): void {
  const sampleData = [
    {
      'MES': 'MARZO',
      'RESPONSABLE ABRIR CASO': 'DIANA',
      'CASO': 'CASO 1',
      'STATUS': 'CERRADO',
      'FECHA DE NOVEDAD KN': '02/03/2026',
      'DIAS RESPUESTA': 0,
      'DIAS DESPUES DE DESPACHO': '',
      'NOMBRE CLIENTE / TIENDA': 'FO CO BOGOTA MALL PLAZA NQS CALIMA',
      'ORDEN': '6555372028',
      'SO / ACO': '',
      'ARTICULO': 'GW9283',
      'TALLA': '8',
      'QTY': 1,
      'NOVEDAD': 'FALTANTE',
      'SKU': 'GW9283610',
      'CON COBRO': 'SIN COBRO',
      'FECHA RESPUESTA ADIDAS': '02/03/2026',
      'TIPO': 'B2B',
      'OBSERVACION': 'UNIDAD EN BODEGA',
      'REASON CODE': 'ACEPTADA',
      'RESPONSABLE CERRAR CASO': 'DIANA'
    },
    {
      'MES': 'MARZO',
      'RESPONSABLE ABRIR CASO': 'ANGELA',
      'CASO': 'CASO 4',
      'STATUS': 'CERRADO',
      'FECHA DE NOVEDAD KN': '03/03/2026',
      'DIAS RESPUESTA': 1,
      'DIAS DESPUES DE DESPACHO': '',
      'NOMBRE CLIENTE / TIENDA': 'John Jairo Piamba Alvarado',
      'ORDEN': '328842519',
      'SO / ACO': 'ACO92618448',
      'ARTICULO': 'JC6463',
      'TALLA': 'M',
      'QTY': 1,
      'NOVEDAD': 'FALTANTE',
      'SKU': 'JC6463120',
      'CON COBRO': 'SIN COBRO',
      'FECHA RESPUESTA ADIDAS': '04/03/2026',
      'TIPO': 'B2C',
      'OBSERVACION': 'UNIDAD EN BODEGA',
      'REASON CODE': 'ACEPTADA',
      'RESPONSABLE CERRAR CASO': 'SEBASTIAN'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: KN_STANDARD_HEADERS });
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
    { wch: 14 }, { wch: 22 }, { wch: 32 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 16 },
    { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 40 }, { wch: 16 }, { wch: 24 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla KN Novedades');
  XLSX.writeFile(workbook, 'Plantilla_Novedades_KN.xlsx');
}
