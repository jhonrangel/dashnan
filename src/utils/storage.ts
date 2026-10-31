import { ClaimRecord } from '../types/claims';
import { INITIAL_CLAIMS } from '../data/initialData';
import { normalizeObservation } from './excelParser';

const STORAGE_KEY = 'kn_claims_online_data_v2';
const METADATA_KEY = 'kn_claims_metadata_v2';

export interface StorageMetadata {
  fileName: string;
  totalRecords: number;
  lastUpdated: string;
  source: 'upload' | 'initial';
}

export function loadSavedClaims(): { claims: ClaimRecord[]; metadata: StorageMetadata } {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    const rawMeta = localStorage.getItem(METADATA_KEY);

    if (rawData) {
      const parsedClaims = JSON.parse(rawData);
      if (Array.isArray(parsedClaims) && parsedClaims.length > 0) {
        parsedClaims.forEach((c: ClaimRecord) => {
          c.observacion = normalizeObservation(c.observacion);
        });
        const metadata: StorageMetadata = rawMeta
          ? JSON.parse(rawMeta)
          : {
              fileName: 'Base_Guardada_En_Linea.xlsx',
              totalRecords: parsedClaims.length,
              lastUpdated: 'Recientemente',
              source: 'upload'
            };
        return { claims: parsedClaims, metadata };
      }
    }
  } catch (e) {
    console.warn('Error reading from storage:', e);
  }

  // Fallback to initial seed
  return {
    claims: INITIAL_CLAIMS,
    metadata: {
      fileName: 'Base_Inicial_KN_Adidas.xlsx',
      totalRecords: INITIAL_CLAIMS.length,
      lastUpdated: 'Datos oficiales cargados',
      source: 'initial'
    }
  };
}

export function saveClaimsToStorage(claims: ClaimRecord[], fileName = 'Archivo_Cargado.xlsx'): StorageMetadata {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString();
    const metadata: StorageMetadata = {
      fileName,
      totalRecords: claims.length,
      lastUpdated: timeStr,
      source: 'upload'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
    return metadata;
  } catch (e) {
    console.error('Error saving to storage:', e);
    return {
      fileName,
      totalRecords: claims.length,
      lastUpdated: 'Error al persistir',
      source: 'upload'
    };
  }
}

export function resetStorageToInitial(): StorageMetadata {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(METADATA_KEY);
  } catch (e) {
    console.warn(e);
  }

  return {
    fileName: 'Base_Inicial_KN_Adidas.xlsx',
    totalRecords: INITIAL_CLAIMS.length,
    lastUpdated: 'Restablecido a inicial',
    source: 'initial'
  };
}
