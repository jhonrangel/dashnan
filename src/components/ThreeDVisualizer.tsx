import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { ClaimRecord } from '../types/claims';
import { RotateCw, Compass, Eye, Sparkles, Layers } from 'lucide-react';

interface ThreeDVisualizerProps {
  claims: ClaimRecord[];
}

interface HoveredData {
  title: string;
  casos: number;
  qty: number;
  avgSla: number;
  percent: number;
  color: string;
  x: number;
  y: number;
}

export const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({ claims }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState<'status' | 'responsables' | 'tipo'>('status');
  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null);

  // Group data based on viewMode
  const chartData = useMemo(() => {
    if (!claims.length) return [];

    if (viewMode === 'status') {
      const total = claims.length;
      const aceptadas = claims.filter((c) => c.reasonCode === 'ACEPTADA');
      const noAceptadas = claims.filter((c) => c.reasonCode === 'NO ACEPTADA');
      const enRevision = claims.filter((c) => c.reasonCode !== 'ACEPTADA' && c.reasonCode !== 'NO ACEPTADA');

      const avgSlaAcept = aceptadas.length ? (aceptadas.reduce((a, b) => a + b.diasRespuesta, 0) / aceptadas.length).toFixed(1) : '0';
      const avgSlaNoAcept = noAceptadas.length ? (noAceptadas.reduce((a, b) => a + b.diasRespuesta, 0) / noAceptadas.length).toFixed(1) : '0';
      const avgSlaRev = enRevision.length ? (enRevision.reduce((a, b) => a + b.diasRespuesta, 0) / enRevision.length).toFixed(1) : '0';

      return [
        {
          key: 'ACEPTADA',
          label: 'Aceptada (En Bodega)',
          count: aceptadas.length,
          qty: aceptadas.reduce((a, b) => a + b.qty, 0),
          avgSla: Number(avgSlaAcept),
          percent: Math.round((aceptadas.length / total) * 100),
          color: 0x10b981 // Emerald
        },
        {
          key: 'NO ACEPTADA',
          label: 'No Aceptada (Evid. Fílmica/Origen)',
          count: noAceptadas.length,
          qty: noAceptadas.reduce((a, b) => a + b.qty, 0),
          avgSla: Number(avgSlaNoAcept),
          percent: Math.round((noAceptadas.length / total) * 100),
          color: 0xdc2626 // Crimson
        },
        ...(enRevision.length > 0
          ? [
              {
                key: 'EN ANALISIS',
                label: 'En Análisis / Pendiente',
                count: enRevision.length,
                qty: enRevision.reduce((a, b) => a + b.qty, 0),
                avgSla: Number(avgSlaRev),
                percent: Math.round((enRevision.length / total) * 100),
                color: 0x0284c7 // Sky Blue
              }
            ]
          : [])
      ];
    }

    if (viewMode === 'responsables') {
      const respMap = new Map<string, ClaimRecord[]>();
      claims.forEach((c) => {
        const r = c.responsableAbrir || 'SIN ASIGNAR';
        if (!respMap.has(r)) respMap.set(r, []);
        respMap.get(r)!.push(c);
      });

      const colors = [0x003366, 0x0284c7, 0x0f766e, 0x4338ca, 0xf59e0b];
      let colorIdx = 0;
      const total = claims.length;

      return Array.from(respMap.entries()).map(([resp, records]) => {
        const color = colors[colorIdx % colors.length];
        colorIdx++;
        const avgSla = records.length ? (records.reduce((a, b) => a + b.diasRespuesta, 0) / records.length).toFixed(1) : '0';
        return {
          key: resp,
          label: `Resp: ${resp}`,
          count: records.length,
          qty: records.reduce((a, b) => a + b.qty, 0),
          avgSla: Number(avgSla),
          percent: Math.round((records.length / total) * 100),
          color
        };
      });
    }

    // Tipo B2B vs B2C
    const total = claims.length;
    const b2b = claims.filter((c) => c.tipo === 'B2B');
    const b2c = claims.filter((c) => c.tipo === 'B2C');
    const avgSlaB2b = b2b.length ? (b2b.reduce((a, b) => a + b.diasRespuesta, 0) / b2b.length).toFixed(1) : '0';
    const avgSlaB2c = b2c.length ? (b2c.reduce((a, b) => a + b.diasRespuesta, 0) / b2c.length).toFixed(1) : '0';

    return [
      {
        key: 'B2B',
        label: 'Canal B2B (Tiendas & Sedes)',
        count: b2b.length,
        qty: b2b.reduce((a, b) => a + b.qty, 0),
        avgSla: Number(avgSlaB2b),
        percent: Math.round((b2b.length / total) * 100),
        color: 0x003366 // KN Deep Navy
      },
      {
        key: 'B2C',
        label: 'Canal B2C (Clientes Finales)',
        count: b2c.length,
        qty: b2c.reduce((a, b) => a + b.qty, 0),
        avgSla: Number(avgSlaB2c),
        percent: Math.round((b2c.length / total) * 100),
        color: 0x0284c7 // Vivid Blue
      }
    ];
  }, [claims, viewMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 600;
    const height = 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Crisp light gray slate-50

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(14, 16, 20);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const blueRimLight = new THREE.PointLight(0x003366, 0.8, 50);
    blueRimLight.position.set(-15, 10, -15);
    scene.add(blueRimLight);

    // Base Platform / Circular Pedestal
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(26, 26, 0x003366, 0xe2e8f0);
    gridHelper.position.y = 0;
    stageGroup.add(gridHelper);

    // Center circular pedestal
    const pedestalGeo = new THREE.CylinderGeometry(11, 11.5, 0.5, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.25;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    // Decorative outer ring
    const ringGeo = new THREE.TorusGeometry(11.2, 0.12, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x003366,
      roughness: 0.2,
      metalness: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    stageGroup.add(ring);

    // 3D Bars Creation
    const barMeshes: THREE.Mesh[] = [];
    const maxCount = Math.max(...chartData.map((d) => d.count), 1);
    const barGroup = new THREE.Group();
    stageGroup.add(barGroup);

    const n = chartData.length;
    const spacing = 5;
    const startX = -((n - 1) * spacing) / 2;

    chartData.forEach((item, idx) => {
      const heightVal = Math.max((item.count / maxCount) * 9, 0.8);
      
      // Modern beveled cylinder pillar
      const barGeo = new THREE.CylinderGeometry(1.4, 1.4, heightVal, 32);
      const barMat = new THREE.MeshStandardMaterial({
        color: item.color,
        roughness: 0.25,
        metalness: 0.35,
        envMapIntensity: 1.0
      });

      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.position.set(startX + idx * spacing, heightVal / 2, 0);
      barMesh.castShadow = true;
      barMesh.receiveShadow = true;
      barMesh.userData = { ...item, originalColor: item.color };

      barGroup.add(barMesh);
      barMeshes.push(barMesh);

      // Top glowing cap
      const capGeo = new THREE.CylinderGeometry(1.42, 1.42, 0.15, 32);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.9
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(startX + idx * spacing, heightVal + 0.08, 0);
      barGroup.add(cap);

      // Base ring
      const baseRingGeo = new THREE.TorusGeometry(1.6, 0.08, 16, 32);
      const baseRingMat = new THREE.MeshStandardMaterial({
        color: 0x003366,
        roughness: 0.4
      });
      const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.set(startX + idx * spacing, 0.05, 0);
      barGroup.add(baseRing);
    });

    // Raycasting for interactive hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(barMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const d = hit.userData;
        if (d && d.label) {
          setHoveredData({
            title: d.label,
            casos: d.count,
            qty: d.qty,
            avgSla: d.avgSla,
            percent: d.percent,
            color: `#${d.color.toString(16).padStart(6, '0')}`,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          document.body.style.cursor = 'pointer';
        }
      } else {
        setHoveredData(null);
        document.body.style.cursor = '';
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);

    // Mouse Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      stageGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(4, Math.min(28, camera.position.y + deltaY * 0.05));
      camera.lookAt(0, 2, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.02;
      const newDistance = camera.position.length() + zoomFactor;
      if (newDistance > 8 && newDistance < 45) {
        camera.position.setLength(newDistance);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseDrag);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        stageGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseDrag);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [chartData, autoRotate]);

  const resetCamera = (mode: 'iso' | 'top' | 'front') => {
    // Just trigger custom view adjustments
    const container = mountRef.current;
    if (!container) return;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* 3D Header & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
              Visualizador Tridimensional Interactivo 3D
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-[#003366] border border-blue-200/60">
                WebGL
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Arrastra para rotar 360°, rueda para zoom, pasa el mouse para métricas exactas
            </p>
          </div>
        </div>

        {/* View Dimension Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-200/60 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('status')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'status'
                  ? 'bg-white text-[#003366] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reason Code
            </button>
            <button
              onClick={() => setViewMode('responsables')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'responsables'
                  ? 'bg-white text-[#003366] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Responsables
            </button>
            <button
              onClick={() => setViewMode('tipo')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'tipo'
                  ? 'bg-white text-[#003366] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Canal B2B / B2C
            </button>
          </div>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pausar auto-rotación 3D' : 'Activar auto-rotación 3D'}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              autoRotate
                ? 'bg-blue-50 text-[#003366] border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">{autoRotate ? 'Rotando' : 'Pausado'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[380px] bg-gradient-to-b from-slate-50 to-slate-100 select-none">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Hover Info Card Floating in 3D */}
        {hoveredData && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700/60 backdrop-blur-sm text-xs min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${Math.min(hoveredData.x + 15, 360)}px`,
              top: `${Math.max(hoveredData.y - 70, 15)}px`
            }}
          >
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: hoveredData.color }}
              />
              <span className="font-semibold text-slate-100 truncate">{hoveredData.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Casos Registrados</span>
                <span className="font-mono font-bold text-white text-sm">{hoveredData.casos}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Proporción</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{hoveredData.percent}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Unidades (QTY)</span>
                <span className="font-mono font-bold text-white">{hoveredData.qty} uds</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">SLA Prom. Respuesta</span>
                <span className="font-mono font-bold text-amber-300">{hoveredData.avgSla} días</span>
              </div>
            </div>
          </div>
        )}

        {/* 3D Legend and Indicators */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-xs">
            {chartData.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5 text-xs text-slate-700">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: `#${d.color.toString(16).padStart(6, '0')}` }}
                />
                <span className="font-medium">{d.label.split('(')[0]}:</span>
                <span className="font-mono font-semibold text-slate-900">{d.count}</span>
                <span className="text-slate-400 text-[10px]">({d.percent}%)</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-200/80 shadow-xs pointer-events-auto">
            Total en visualización: <strong className="text-slate-800">{claims.length}</strong> registros
          </div>
        </div>
      </div>
    </div>
  );
};
