import React from 'react';
import { ClaimRecord } from '../types/claims';
import {
  PieChart,
  Calendar,
  Users,
  Store,
  Tag,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { KNStyleDonutChart } from './KNStyleDonutChart';
import { KN3DBarChart, Bar3DItem } from './KN3DBarChart';
import { KNObservationsDonut } from './KNObservationsDonut';

interface ThreeDEffectChartsProps {
  claims: ClaimRecord[];
  allClaims: ClaimRecord[];
  monthlyTrendClaims?: ClaimRecord[];
  selectedMonth: string;
  selectedObservacion?: string;
  onSelectMonth?: (mes: string) => void;
  onSelectObservacion?: (obs: string) => void;
  onSelectReasonCode?: (code: string) => void;
  onSelectTipo?: (tipo: string) => void;
  onSelectConCobro?: (cobro: string) => void;
  onSelectNovedad?: (novedad: string) => void;
  onSelectResponsable?: (resp: string) => void;
  onSelectTienda?: (tienda: string) => void;
  onSelectArticulo?: (art: string) => void;
}

export const ThreeDEffectCharts: React.FC<ThreeDEffectChartsProps> = ({
  claims,
  allClaims,
  monthlyTrendClaims,
  selectedMonth,
  selectedObservacion,
  onSelectMonth,
  onSelectObservacion,
  onSelectReasonCode,
  onSelectTipo,
  onSelectConCobro,
  onSelectNovedad,
  onSelectResponsable,
  onSelectTienda,
  onSelectArticulo
}) => {
  const total = claims.length || 1;

  // Month-over-Month calculation (Mes a Mes) dynamically driven by active filters
  const monthlyBarItems: Bar3DItem[] = React.useMemo(() => {
    const monthOrder = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const activeDataset = monthlyTrendClaims || claims;

    // Preserve all distinct months from allClaims for clean x-axis comparison
    const allMonthsSet = new Set<string>();
    allClaims.forEach((c) => {
      const m = (c.mes || 'MARZO').toUpperCase().trim();
      allMonthsSet.add(m);
    });

    const map = new Map<string, ClaimRecord[]>();
    allMonthsSet.forEach((m) => map.set(m, []));

    activeDataset.forEach((c) => {
      const m = (c.mes || 'MARZO').toUpperCase().trim();
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(c);
    });

    return Array.from(map.entries())
      .map(([mes, list]) => {
        const aceptadas = list.filter((c) => c.reasonCode === 'ACEPTADA').length;
        const totalMes = list.length;
        const tasaAceptacion = totalMes > 0 ? Math.round((aceptadas / totalMes) * 100) : 0;

        return {
          id: mes,
          label: mes,
          sublabel: totalMes > 0 ? `${tasaAceptacion}% Acept.` : '0 casos',
          value: totalMes,
          secondaryValue: totalMes > 0 ? `${tasaAceptacion}% Aceptación Adidas (${totalMes} casos)` : '0 casos con filtros activos'
        };
      })
      .sort((a, b) => {
        const idxA = monthOrder.indexOf(a.id);
        const idxB = monthOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.id.localeCompare(b.id);
      });
  }, [monthlyTrendClaims, claims, allClaims]);

  // Donut 1: Reason Code
  const reasonData = React.useMemo(() => {
    const aceptadas = claims.filter((c) => c.reasonCode === 'ACEPTADA').length;
    const noAceptadas = claims.filter((c) => c.reasonCode === 'NO ACEPTADA').length;
    return {
      aceptadas,
      noAceptadas,
      aceptadasPct: Math.round((aceptadas / total) * 100),
      noAceptadasPct: Math.round((noAceptadas / total) * 100)
    };
  }, [claims, total]);

  // Donut 2: Canal B2B vs B2C
  const channelData = React.useMemo(() => {
    const b2b = claims.filter((c) => c.tipo === 'B2B').length;
    const b2c = claims.filter((c) => c.tipo === 'B2C').length;
    return {
      b2b,
      b2c,
      b2bPct: Math.round((b2b / total) * 100),
      b2cPct: Math.round((b2c / total) * 100)
    };
  }, [claims, total]);

  // Donut 3: Cobro
  const cobroData = React.useMemo(() => {
    const sinCobro = claims.filter((c) => c.conCobro === 'SIN COBRO').length;
    const conCobro = claims.filter((c) => c.conCobro !== 'SIN COBRO').length;
    return {
      sinCobro,
      conCobro,
      sinCobroPct: Math.round((sinCobro / total) * 100),
      conCobroPct: Math.round((conCobro / total) * 100)
    };
  }, [claims, total]);

  // Donut 4: Novedad
  const novedadData = React.useMemo(() => {
    const faltante = claims.filter((c) => c.novedad === 'FALTANTE').length;
    const otras = claims.filter((c) => c.novedad !== 'FALTANTE').length;
    return {
      faltante,
      otras,
      faltantePct: Math.round((faltante / total) * 100),
      otrasPct: Math.round((otras / total) * 100)
    };
  }, [claims, total]);

  // Top Tiendas / Clientes
  const topTiendas = React.useMemo(() => {
    const map = new Map<string, { count: number; qty: number }>();
    claims.forEach((c) => {
      const name = c.nombreClienteTienda || 'CLIENTE';
      if (!map.has(name)) map.set(name, { count: 0, qty: 0 });
      map.get(name)!.count += 1;
      map.get(name)!.qty += Number(c.qty) || 0;
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [claims]);

  // Top Artículos
  const topArticulos = React.useMemo(() => {
    const map = new Map<string, { count: number; qty: number; talla: string }>();
    claims.forEach((c) => {
      const art = c.articulo || 'ARTICULO';
      if (!map.has(art)) map.set(art, { count: 0, qty: 0, talla: c.talla });
      map.get(art)!.count += 1;
      map.get(art)!.qty += Number(c.qty) || 0;
    });
    return Array.from(map.entries())
      .map(([art, data]) => ({ art, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [claims]);

  // Responsables
  const responsablesData = React.useMemo(() => {
    const map = new Map<string, { count: number; qty: number; aceptadas: number }>();
    claims.forEach((c) => {
      const resp = c.responsableAbrir || 'DIANA';
      if (!map.has(resp)) map.set(resp, { count: 0, qty: 0, aceptadas: 0 });
      map.get(resp)!.count += 1;
      map.get(resp)!.qty += Number(c.qty) || 0;
      if (c.reasonCode === 'ACEPTADA') map.get(resp)!.aceptadas += 1;
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        pct: Math.round((data.count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [claims, total]);

  const maxTiendaCount = Math.max(...topTiendas.map((t) => t.count), 1);
  const maxArtCount = Math.max(...topArticulos.map((a) => a.count), 1);
  const maxRespCount = Math.max(...responsablesData.map((r) => r.count), 1);

  return (
    <div className="space-y-4">
      {/* FILA 1: BARRAS 3D ESTILO IMAGEN (MES A MES CON FLECHA ASCENDENTE) + OBSERVACIONES COMPACTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Izquierda (6 cols): Barras 3D de Meses con Flecha Ascendente */}
        <div className="lg:col-span-6">
          <KN3DBarChart
            title="Evolución Mes a Mes en Barras 3D (KN Logistics)"
            subtitle="Tendencia ascendente de control operativo y efectividad de resolución"
            items={monthlyBarItems}
            showTrendArrow={true}
            selectedId={selectedMonth}
            onItemClick={onSelectMonth}
            valueSuffix="casos"
          />
        </div>

        {/* Derecha (6 cols): Observaciones Logísticas en Gráfico de Dona Ampliado con Filtrico Lista */}
        <div className="lg:col-span-6">
          <KNObservationsDonut
            claims={claims}
            selectedObservacion={selectedObservacion}
            onSelectObservacion={onSelectObservacion}
          />
        </div>
      </div>

      {/* FILA 2: COLECCIÓN DE DONAS ESTILO IMAGEN DE REFERENCIA */}
      <div>
        <div className="flex items-center justify-between pb-1.5 mb-2 px-1">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#003366]" />
            <h4 className="text-xs font-bold text-[#003366] uppercase tracking-wider">
              Colección de Donas Estilo KN (Porcentajes Internos y Núcleo Turquesa)
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
            {claims.length} casos activos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Dona 1: Reason Code */}
          <KNStyleDonutChart
            title="Reason Code"
            subtitle="Resolución Adidas"
            size={160}
            centerText={`${reasonData.aceptadasPct}%`}
            centerSubtext="ACEPTADAS"
            data={[
              {
                id: 'ACEPTADA',
                label: 'Aceptada en Bodega',
                shortLabel: 'ACEPT',
                count: reasonData.aceptadas,
                color: '#003366'
              },
              {
                id: 'NO ACEPTADA',
                label: 'No Aceptada (Evidencia Fílmica)',
                shortLabel: 'NEGADA',
                count: reasonData.noAceptadas,
                color: '#5392c5'
              }
            ]}
            onSliceClick={onSelectReasonCode}
          />

          {/* Dona 2: Canal B2B vs B2C */}
          <KNStyleDonutChart
            title="Canal de Entrega"
            subtitle="Tiendas vs Clientes"
            size={160}
            centerText={`${channelData.b2bPct}%`}
            centerSubtext="B2B TIENDAS"
            data={[
              {
                id: 'B2B',
                label: 'Canal B2B (Tiendas)',
                shortLabel: 'B2B',
                count: channelData.b2b,
                color: '#003366'
              },
              {
                id: 'B2C',
                label: 'Canal B2C (E-Commerce)',
                shortLabel: 'B2C',
                count: channelData.b2c,
                color: '#90bde0'
              }
            ]}
            onSliceClick={onSelectTipo}
          />

          {/* Dona 3: Cobro */}
          <KNStyleDonutChart
            title="Condición Cobro"
            subtitle="Financiero"
            size={160}
            centerText={`${cobroData.sinCobroPct}%`}
            centerSubtext="SIN COBRO"
            data={[
              {
                id: 'SIN COBRO',
                label: 'Sin Cobro',
                shortLabel: 'SIN COBRO',
                count: cobroData.sinCobro,
                color: '#003366'
              },
              {
                id: 'CON COBRO',
                label: 'Con Cobro',
                shortLabel: 'CON COBRO',
                count: cobroData.conCobro,
                color: '#5392c5'
              }
            ]}
            onSliceClick={onSelectConCobro}
          />

          {/* Dona 4: Novedad */}
          <KNStyleDonutChart
            title="Tipo de Novedad"
            subtitle="Causa operativa"
            size={160}
            centerText={`${novedadData.faltantePct}%`}
            centerSubtext="FALTANTES"
            data={[
              {
                id: 'FALTANTE',
                label: 'Faltante de Producto',
                shortLabel: 'FALT',
                count: novedadData.faltante,
                color: '#003366'
              },
              {
                id: 'OTRAS',
                label: 'Otras Novedades / Troque',
                shortLabel: 'OTRAS',
                count: novedadData.otras,
                color: '#90bde0'
              }
            ]}
            onSliceClick={onSelectNovedad}
          />
        </div>
      </div>

      {/* FILA 3: RANKINGS COMPACTOS EN 3D */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Tiendas/Clientes */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5 uppercase tracking-wider">
              <Store className="w-3.5 h-3.5 text-[#003366]" />
              Top Clientes / Tiendas
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Casos</span>
          </div>

          <div className="space-y-2">
            {topTiendas.map((item) => {
              const widthPct = Math.max((item.count / maxTiendaCount) * 100, 20);
              return (
                <div
                  key={item.name}
                  onClick={() => onSelectTienda && onSelectTienda(item.name)}
                  className="cursor-pointer group p-1.5 rounded hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-800 font-medium truncate max-w-[170px]" title={item.name}>
                      {item.name}
                    </span>
                    <strong className="font-mono text-[#003366] text-xs shrink-0">{item.count}</strong>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#003366] rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Artículos Reclamados */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-[#003366]" />
              Top Artículos Afectados
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Unidades</span>
          </div>

          <div className="space-y-2">
            {topArticulos.map((item) => {
              const widthPct = Math.max((item.qty / maxArtCount) * 100, 20);
              return (
                <div
                  key={item.art}
                  onClick={() => onSelectArticulo && onSelectArticulo(item.art)}
                  className="cursor-pointer group p-1.5 rounded hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-900">
                      {item.art} <span className="text-slate-400 font-normal text-[10px]">({item.talla})</span>
                    </span>
                    <strong className="font-mono text-slate-800 text-xs shrink-0">{item.qty} uds</strong>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-slate-600 rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analistas KN */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#003366]" />
              Analistas Logísticos
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Carga</span>
          </div>

          <div className="space-y-2">
            {responsablesData.map((item) => {
              const widthPct = Math.max((item.count / maxRespCount) * 100, 20);
              return (
                <div
                  key={item.name}
                  onClick={() => onSelectResponsable && onSelectResponsable(item.name)}
                  className="cursor-pointer group p-1.5 rounded hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">
                      {item.name}
                    </span>
                    <div className="font-mono text-xs">
                      <strong className="text-[#003366]">{item.count}</strong>
                      <span className="text-slate-400 text-[10px] ml-1">({item.aceptadas} A)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#003366] rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
