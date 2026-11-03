import React, { useRef, useState, useEffect } from 'react';
import {
  OrbitNode,
  DualBridgePoros,
  VisualTheme,
  OrbitQuadrant,
  ConnectorStyle,
  QUADRANT_CONFIGS,
  GENERATION_LABELS,
  THEME_CONFIGS
} from './orbitTypes';
import {
  calculateOrbitLayout,
  generateConnectorPath
} from './orbitUtils';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Heart,
  Calendar,
  MapPin,
  X,
  Plus,
  Share2,
  Trash2,
  Edit2,
  ArrowRight,
  Filter
} from 'lucide-react';

interface OrbitQuCanvasProps {
  poros: DualBridgePoros;
  nodes: OrbitNode[];
  theme: VisualTheme;
  isDarkMode: boolean;
  showOrbitLines: boolean;
  globalConnectorStyle: ConnectorStyle;
  selectedQuadrantFilter: OrbitQuadrant | 'all';
  onEditNode: (node: OrbitNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddChildToNode: (parentNode: OrbitNode) => void;
  onEditPoros: () => void;
}

export const OrbitQuCanvas: React.FC<OrbitQuCanvasProps> = ({
  poros,
  nodes,
  theme,
  isDarkMode,
  showOrbitLines,
  globalConnectorStyle,
  selectedQuadrantFilter,
  onEditNode,
  onDeleteNode,
  onAddChildToNode,
  onEditPoros
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive Excel-like Drilldown Filter (Isolated Subtree)
  const [activeDrilldownId, setActiveDrilldownId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);

  // Canvas Dimensions
  const CANVAS_SIZE = 1200;
  const CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

  // Theme settings
  const themeCfg = THEME_CONFIGS[theme];
  const bgStyle = isDarkMode ? themeCfg.darkCanvasBg : themeCfg.lightCanvasBg;
  const ringStroke = isDarkMode ? themeCfg.ringStrokeDark : themeCfg.ringStrokeLight;

  // Filter nodes based on selected quadrant and drilldown
  const quadrantFilteredNodes = nodes.filter(n => {
    if (selectedQuadrantFilter === 'all') return true;
    return n.quadrant === selectedQuadrantFilter;
  });

  // Calculate layout
  const positionedNodes = calculateOrbitLayout(quadrantFilteredNodes, poros, CENTER);

  // Compute drilldown descendants if active
  const getDescendantIds = (rootId: string): Set<string> => {
    const ids = new Set<string>([rootId]);
    let added = true;
    while (added) {
      added = false;
      nodes.forEach(n => {
        if (n.parentId && ids.has(n.parentId) && !ids.has(n.id)) {
          ids.add(n.id);
          added = true;
        }
      });
    }
    return ids;
  };

  const visibleNodes = activeDrilldownId
    ? positionedNodes.filter(n => getDescendantIds(activeDrilldownId).has(n.id))
    : positionedNodes;

  // Node Map for fast lookup
  const nodeMap = new Map<string, OrbitNode>();
  positionedNodes.forEach(n => nodeMap.set(n.id, n));

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveDrilldownId(null);
  };

  // Concentric Orbit Radii to render
  const orbitRadii = [
    { label: 'Orbit I (Anak)', r: 155 },
    { label: 'Orbit II (Cucu)', r: 230 },
    { label: 'Orbit III (Orang Tua / Cicit)', r: 300 },
    { label: 'Orbit IV (Kakek/Nenek)', r: 380 },
    { label: 'Orbit V (Uyut/Buyut)', r: 460 },
    { label: 'Orbit VI (Moyang Luar)', r: 530 }
  ];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ background: bgStyle }}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-300"
    >
      {/* HUD Floating Controls (Top Left & Top Right) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg text-white">
        <button
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          className="p-1.5 hover:bg-white/20 rounded-xl transition"
          title="Perbesar Canvas (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-1.5 hover:bg-white/20 rounded-xl transition"
          title="Perkecil Canvas (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-white/20 rounded-xl transition text-xs font-mono font-bold flex items-center gap-1"
          title="Reset Sudut Pandang"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{Math.round(zoom * 100)}%</span>
        </button>
      </div>

      {/* Active Drilldown Filter Indicator */}
      {activeDrilldownId && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-emerald-950/85 text-emerald-200 border border-emerald-400/40 px-3 py-1.5 rounded-2xl shadow-xl text-xs backdrop-blur-md">
          <Filter className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>
            Fokus Cabang: <strong>{nodeMap.get(activeDrilldownId)?.name}</strong>
          </span>
          <button
            onClick={() => setActiveDrilldownId(null)}
            className="p-0.5 hover:text-white bg-emerald-800/80 rounded-full ml-1"
            title="Kembali ke Tampilan Penuh"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          width: CANVAS_SIZE,
          height: CANVAS_SIZE
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      >
        <svg
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Glow Filters */}
            <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Radial Core Gradient */}
            <radialGradient id="sunCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>

          {/* 1. Kuadran Separator Lines (Cosmic Crosshairs) */}
          <g opacity={isDarkMode ? 0.25 : 0.4}>
            <line
              x1={CENTER.x}
              y1={50}
              x2={CENTER.x}
              y2={CANVAS_SIZE - 50}
              stroke={isDarkMode ? '#94a3b8' : '#64748b'}
              strokeWidth="1.5"
              strokeDasharray="6,6"
            />
            <line
              x1={50}
              y1={CENTER.y}
              x2={CANVAS_SIZE - 50}
              y2={CENTER.y}
              stroke={isDarkMode ? '#94a3b8' : '#64748b'}
              strokeWidth="1.5"
              strokeDasharray="6,6"
            />
          </g>

          {/* Kuadran Labels Watermark */}
          {Object.entries(QUADRANT_CONFIGS).map(([k, q]) => {
            const isQ1 = k === 'ayah_user';
            const isQ2 = k === 'ibu_user';
            const isQ3 = k === 'ayah_pasangan';
            const isQ4 = k === 'ibu_pasangan';

            const xPos = isQ1 || isQ4 ? CENTER.x + 360 : CENTER.x - 360;
            const yPos = isQ1 || isQ2 ? CENTER.y - 380 : CENTER.y + 380;

            return (
              <g key={k} transform={`translate(${xPos}, ${yPos})`} opacity={isDarkMode ? 0.5 : 0.6}>
                <text
                  textAnchor="middle"
                  fill={q.colorHex}
                  fontSize="13"
                  fontWeight="bold"
                  letterSpacing="1"
                  className="uppercase font-mono"
                >
                  {q.label}
                </text>
                <text
                  textAnchor="middle"
                  y="16"
                  fill={isDarkMode ? '#cbd5e1' : '#475569'}
                  fontSize="11"
                  fontWeight="500"
                >
                  {q.clanName}
                </text>
              </g>
            );
          })}

          {/* 2. Concentric Orbit Circles (Toggled via showOrbitLines) */}
          {showOrbitLines && (
            <g className="orbit-rings transition-opacity duration-300">
              {orbitRadii.map((orbit, idx) => (
                <g key={idx}>
                  <circle
                    cx={CENTER.x}
                    cy={CENTER.y}
                    r={orbit.r}
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth={idx === 0 ? '1.5' : '1'}
                    strokeDasharray={idx % 2 === 0 ? '8,8' : '4,4'}
                  />
                  {/* Orbit Label Pin */}
                  <text
                    x={CENTER.x + 10}
                    y={CENTER.y - orbit.r + 14}
                    fill={isDarkMode ? '#94a3b8' : '#64748b'}
                    fontSize="9"
                    fontWeight="bold"
                    opacity={isDarkMode ? 0.45 : 0.7}
                    className="font-mono"
                  >
                    {orbit.label}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 3. Connectors (Lines from Poros or Parents to Nodes) */}
          <g className="connectors">
            {visibleNodes.map(node => {
              if (!node.x || !node.y) return null;

              // If has parent, connect to parent; if top level descendant, connect to Poros
              let startX = CENTER.x;
              let startY = CENTER.y;

              if (node.parentId && nodeMap.has(node.parentId)) {
                const parent = nodeMap.get(node.parentId)!;
                if (parent.x && parent.y) {
                  startX = parent.x;
                  startY = parent.y;
                }
              }

              const style = node.connectorStyle || globalConnectorStyle;
              const pathD = generateConnectorPath(startX, startY, node.x, node.y, style, CENTER.x, CENTER.y);
              const quadConfig = QUADRANT_CONFIGS[node.quadrant as Exclude<OrbitQuadrant, 'poros'>] || QUADRANT_CONFIGS.ayah_user;

              return (
                <path
                  key={`line_${node.id}`}
                  d={pathD}
                  fill="none"
                  stroke={quadConfig.colorHex}
                  strokeWidth="1.8"
                  strokeOpacity={isDarkMode ? 0.7 : 0.85}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 4. Poros Tengah: DUAL-AVATAR BRIDGE NODE (User & Pasangan) */}
          <g
            transform={`translate(${CENTER.x}, ${CENTER.y})`}
            onClick={onEditPoros}
            className="cursor-pointer interactive-node group"
          >
            {/* Outer Halo Glow */}
            <circle
              r="75"
              fill={isDarkMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.15)'}
              stroke="rgba(245, 158, 11, 0.3)"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="animate-spin-slow"
            />

            {/* Bridge Capsule Body */}
            <rect
              x="-82"
              y="-34"
              width="164"
              height="68"
              rx="34"
              fill={isDarkMode ? '#0f172a' : '#ffffff'}
              stroke="#f59e0b"
              strokeWidth="2.5"
              filter="url(#glowGold)"
              className="transition group-hover:scale-105 duration-200"
            />

            {/* Golden Heart Connector */}
            <circle cx="0" cy="0" r="14" fill="#f59e0b" />
            <path
              d="M -5 -2 C -5 -6 -1 -6 0 -3 C 1 -6 5 -6 5 -2 C 5 2 0 6 0 6 C 0 6 -5 2 -5 -2 Z"
              fill="#ffffff"
            />

            {/* Left Avatar: User (Ego) */}
            <g transform="translate(-46, 0)">
              <circle r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              {poros.user.photo ? (
                <image
                  href={poros.user.photo}
                  x="-22"
                  y="-22"
                  width="44"
                  height="44"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#userCircleClip)"
                />
              ) : (
                <text
                  textAnchor="middle"
                  dy="5"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {poros.user.nickname?.slice(0, 2).toUpperCase() || poros.user.name.slice(0, 2).toUpperCase()}
                </text>
              )}
            </g>

            {/* Right Avatar: Pasangan (Spouse) */}
            <g transform="translate(46, 0)">
              <circle r="22" fill="#ec4899" stroke="#f472b6" strokeWidth="2" />
              {poros.spouse.photo ? (
                <image
                  href={poros.spouse.photo}
                  x="-22"
                  y="-22"
                  width="44"
                  height="44"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#spouseCircleClip)"
                />
              ) : (
                <text
                  textAnchor="middle"
                  dy="5"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {poros.spouse.nickname?.slice(0, 2).toUpperCase() || poros.spouse.name.slice(0, 2).toUpperCase()}
                </text>
              )}
            </g>

            {/* Label below Poros */}
            <text
              textAnchor="middle"
              y="52"
              fill={isDarkMode ? '#fef08a' : '#b45309'}
              fontSize="11"
              fontWeight="bold"
              className="font-mono tracking-wider"
            >
              POROS UTAMA
            </text>
            <text
              textAnchor="middle"
              y="66"
              fill={isDarkMode ? '#e2e8f0' : '#334155'}
              fontSize="10"
              fontWeight="600"
            >
              {poros.user.name} &amp; {poros.spouse.name}
            </text>
          </g>

          {/* 5. Orbit Planetary Nodes (Anggota Silsilah) */}
          <g className="orbit-nodes">
            {visibleNodes.map(node => {
              if (node.x === undefined || node.y === undefined) return null;
              const quadConfig = QUADRANT_CONFIGS[node.quadrant as Exclude<OrbitQuadrant, 'poros'>] || QUADRANT_CONFIGS.ayah_user;
              const isSelected = selectedNode?.id === node.id;
              const isFilteredRoot = activeDrilldownId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer interactive-node group"
                >
                  {/* Planetary Orbit Ring Effect */}
                  <circle
                    r={isSelected || isFilteredRoot ? 26 : 22}
                    fill={isDarkMode ? '#0f172a' : '#ffffff'}
                    stroke={quadConfig.colorHex}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    className="transition-all duration-200 group-hover:scale-115"
                  />

                  {/* Node Avatar Photo or Initials */}
                  {node.photo ? (
                    <image
                      href={node.photo}
                      x="-18"
                      y="-18"
                      width="36"
                      height="36"
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#clip_${node.id})`}
                    />
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={quadConfig.colorHex}
                      fontSize="10"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {node.nickname?.slice(0, 2).toUpperCase() || node.name.slice(0, 2).toUpperCase()}
                    </text>
                  )}

                  {/* Status Indicator Dot (Hidup = Hijau, Almarhum = Abu-abu) */}
                  <circle
                    cx="14"
                    cy="-14"
                    r="4.5"
                    fill={node.status === 'Almarhum' ? '#64748b' : '#22c55e'}
                    stroke={isDarkMode ? '#0f172a' : '#ffffff'}
                    strokeWidth="1.5"
                  />

                  {/* Node Name Tag Card */}
                  <g transform="translate(0, 28)">
                    <rect
                      x="-55"
                      y="0"
                      width="110"
                      height="26"
                      rx="6"
                      fill={isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)'}
                      stroke={quadConfig.colorHex}
                      strokeWidth="1"
                      className="shadow-md"
                    />
                    <text
                      textAnchor="middle"
                      y="12"
                      fill={isDarkMode ? '#f8fafc' : '#0f172a'}
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y="21"
                      fill={isDarkMode ? '#94a3b8' : '#64748b'}
                      fontSize="7.5"
                      className="font-mono"
                    >
                      {node.birthYear || '?'} {node.status === 'Almarhum' ? '✝' : ''}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Node Inspector Modal */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-30 max-w-sm mx-auto bg-slate-900/95 text-white rounded-2xl p-4 shadow-2xl border border-sky-400/40 backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-start pb-2.5 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white overflow-hidden shadow-md"
                style={{
                  backgroundColor: QUADRANT_CONFIGS[selectedNode.quadrant as Exclude<OrbitQuadrant, 'poros'>]?.colorHex || '#38bdf8'
                }}
              >
                {selectedNode.photo ? (
                  <img src={selectedNode.photo} alt={selectedNode.name} className="w-full h-full object-cover" />
                ) : (
                  selectedNode.nickname?.slice(0, 2).toUpperCase() || selectedNode.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{selectedNode.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      selectedNode.status === 'Almarhum' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-900 text-emerald-300'
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </h4>
                <p className="text-xs text-sky-300 font-mono">
                  {selectedNode.binBinti || GENERATION_LABELS[selectedNode.generation]?.title || 'Anggota'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {QUADRANT_CONFIGS[selectedNode.quadrant as Exclude<OrbitQuadrant, 'poros'>]?.label} •{' '}
                  {GENERATION_LABELS[selectedNode.generation]?.orbitName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5 text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Tahun Lahir / Wafat:</span>
              <span className="font-mono font-bold text-white">
                {selectedNode.birthYear || '?'} {selectedNode.deathYear ? `— ${selectedNode.deathYear}` : ''}
              </span>
            </div>
            {selectedNode.origin && (
              <div className="flex justify-between">
                <span className="text-slate-400">Asal Wilayah:</span>
                <span className="font-medium text-white">{selectedNode.origin}</span>
              </div>
            )}
            {selectedNode.notes && (
              <div className="text-[11px] text-slate-400 italic bg-slate-800/60 p-2 rounded-lg border border-slate-700">
                "{selectedNode.notes}"
              </div>
            )}
          </div>

          {/* Action Buttons: Filter Keturunan ala Excel, Tambah Anak, Edit, Hapus */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                setActiveDrilldownId(selectedNode.id);
                setSelectedNode(null);
              }}
              className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[10px] font-bold py-2 rounded-xl flex flex-col items-center gap-0.5"
              title="Saring Tampilan Hanya Keturunan Tokoh Ini"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Saring</span>
            </button>
            <button
              onClick={() => {
                onAddChildToNode(selectedNode);
                setSelectedNode(null);
              }}
              className="bg-sky-800/80 hover:bg-sky-700 text-sky-100 text-[10px] font-bold py-2 rounded-xl flex flex-col items-center gap-0.5"
              title="Tambah Keturunan / Anak"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Anak</span>
            </button>
            <button
              onClick={() => {
                onEditNode(selectedNode);
                setSelectedNode(null);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2 rounded-xl flex flex-col items-center gap-0.5"
              title="Edit Data Anggota"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                onDeleteNode(selectedNode.id);
                setSelectedNode(null);
              }}
              className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[10px] font-bold py-2 rounded-xl flex flex-col items-center gap-0.5"
              title="Hapus Node dari Silsilah"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
