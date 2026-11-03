import React, { useState, useEffect } from 'react';
import {
  OrbitNode,
  DualBridgePoros,
  VisualTheme,
  OrbitQuadrant,
  OrbitQuadrantClan,
  ConnectorStyle,
  OrbitQuDataset,
  QUADRANT_CONFIGS,
  GENERATION_LABELS,
  THEME_CONFIGS
} from './orbitTypes';
import {
  loadOrbitQuData,
  saveOrbitQuData,
  DEFAULT_POROS
} from './orbitUtils';
import { OrbitQuCanvas } from './OrbitQuCanvas';
import { OrbitQuBatchModal } from './OrbitQuBatchModal';
import {
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Share2,
  Download,
  Upload,
  Plus,
  Compass,
  Eye,
  EyeOff,
  GitBranch,
  Network,
  Atom,
  Trees,
  Check,
  Copy,
  X,
  Edit2,
  RefreshCw,
  FolderSync
} from 'lucide-react';

interface OrbitQuViewProps {
  onBackToLeluhurQu: () => void;
  showNotification: (msg: string) => void;
}

export const OrbitQuView: React.FC<OrbitQuViewProps> = ({
  onBackToLeluhurQu,
  showNotification
}) => {
  // 1. Core State
  const [dataset, setDataset] = useState<OrbitQuDataset>(() => loadOrbitQuData());
  const [theme, setTheme] = useState<VisualTheme>('cosmic');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default Dark Mode as requested
  const [showOrbitLines, setShowOrbitLines] = useState<boolean>(true);
  const [connectorStyle, setConnectorStyle] = useState<ConnectorStyle>('divergent');
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] = useState<OrbitQuadrant | 'all'>('all');

  // 2. Modals
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showImportExportModal, setShowImportExportModal] = useState<boolean>(false);
  const [showEditNodeModal, setShowEditNodeModal] = useState<OrbitNode | null>(null);
  const [showEditPorosModal, setShowEditPorosModal] = useState<boolean>(false);
  const [showAddChildModal, setShowAddChildModal] = useState<OrbitNode | null>(null);

  // Read URL query/hash on load for Dynamic Share Link:
  // e.g. #orbitqu?trah=ayah_user
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.includes('trah=')) {
        const match = hash.match(/trah=([a-z_]+)/);
        if (match && match[1]) {
          const quadKey = match[1] as OrbitQuadrantClan;
          if (quadKey in QUADRANT_CONFIGS) {
            setSelectedQuadrantFilter(quadKey);
            showNotification(`Membuka fokus ${QUADRANT_CONFIGS[quadKey].label}`);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to LocalStorage whenever dataset changes
  const updateDataset = (updater: (prev: OrbitQuDataset) => OrbitQuDataset) => {
    setDataset(prev => {
      const next = updater(prev);
      saveOrbitQuData(next);
      return next;
    });
  };

  // Node Management Handlers
  const handleSavePermanently = (newNodes: OrbitNode[]) => {
    updateDataset(prev => ({
      ...prev,
      nodes: newNodes,
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleDeleteNode = (nodeId: string) => {
    updateDataset(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId && n.parentId !== nodeId),
      lastUpdated: new Date().toISOString()
    }));
    showNotification('Anggota silsilah berhasil dihapus dari OrbitQu.');
  };

  const handleUpdateNode = (updated: OrbitNode) => {
    updateDataset(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === updated.id ? updated : n)),
      lastUpdated: new Date().toISOString()
    }));
    setShowEditNodeModal(null);
    showNotification(`Data ${updated.name} berhasil diperbarui.`);
  };

  const handleAddChildSubmit = (childData: Partial<OrbitNode>) => {
    if (!showAddChildModal || !childData.name?.trim()) return;

    const parent = showAddChildModal;
    const nextGen = (parent.generation > 0 ? parent.generation + 1 : 1) as any;

    const newNode: OrbitNode = {
      id: 'node_' + Date.now(),
      name: childData.name.trim(),
      nickname: childData.nickname?.trim() || undefined,
      binBinti: childData.binBinti?.trim() || (parent.gender === 'L' ? `bin ${parent.name}` : `binti ${parent.name}`),
      gender: childData.gender || 'L',
      generation: nextGen,
      quadrant: parent.quadrant,
      parentId: parent.id,
      birthYear: childData.birthYear || '2020',
      status: childData.status || 'Hidup',
      origin: parent.origin,
      connectorStyle: 'divergent'
    };

    updateDataset(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      lastUpdated: new Date().toISOString()
    }));

    setShowAddChildModal(null);
    showNotification(`Keturunan baru ${newNode.name} berhasil ditambahkan ke silsilah!`);
  };

  // Sync / Import from LeluhurQu LocalStorage
  const handleSyncFromLeluhurQu = () => {
    try {
      const raw = localStorage.getItem('wargaqu_leluhur_members_v4');
      if (!raw) {
        showNotification('Belum ada data anggota di modul LeluhurQu.');
        return;
      }
      const leluhurMembers = JSON.parse(raw);
      if (!Array.isArray(leluhurMembers) || leluhurMembers.length === 0) {
        showNotification('Modul LeluhurQu masih dalam keadaan bersih (0 anggota).');
        return;
      }

      // Convert LeluhurQu members into OrbitNodes
      const converted: OrbitNode[] = leluhurMembers
        .filter(m => m.trah !== 'inti') // Poros is core
        .map(m => {
          let quad: OrbitQuadrant = 'ayah_user';
          if (m.trah === 'ibu') quad = 'ibu_user';

          let gen: any = -1;
          if (m.relation === 'buyut') gen = -3;
          else if (m.relation === 'kakek' || m.relation === 'nenek') gen = -2;
          else if (m.relation === 'ayah' || m.relation === 'ibu') gen = -1;
          else if (m.relation === 'anak') gen = 1;
          else if (m.relation === 'cucu') gen = 2;

          return {
            id: m.id,
            name: m.name,
            nickname: m.nickname,
            binBinti: m.binBinti,
            gender: m.gender,
            generation: gen,
            quadrant: quad,
            birthYear: m.birthYear,
            deathYear: m.deathYear,
            status: m.status,
            origin: m.origin,
            notes: m.notes,
            photo: m.photo
          };
        });

      updateDataset(prev => ({
        ...prev,
        nodes: converted,
        lastUpdated: new Date().toISOString()
      }));

      showNotification(`Sinkronisasi berhasil! ${converted.length} anggota diimpor dari LeluhurQu.`);
    } catch (e) {
      showNotification('Gagal menyinkronkan data dari LeluhurQu.');
    }
  };

  // Share Link Generation
  const getDynamicShareLink = (quad?: OrbitQuadrant | 'all') => {
    const baseUrl = window.location.origin + window.location.pathname;
    const targetQuad = quad || selectedQuadrantFilter;
    if (targetQuad === 'all') {
      return `${baseUrl}#orbitqu`;
    }
    return `${baseUrl}#orbitqu?trah=${targetQuad}`;
  };

  const handleCopyShareLink = () => {
    const link = getDynamicShareLink();
    navigator.clipboard?.writeText(link);
    showNotification('Tautan undangan fokus trah berhasil disalin!');
  };

  const handleShareToWhatsApp = () => {
    const quadConfig =
      selectedQuadrantFilter !== 'all' && selectedQuadrantFilter !== 'poros'
        ? QUADRANT_CONFIGS[selectedQuadrantFilter]
        : null;
    const clanTitle = quadConfig ? `${quadConfig.label} (${quadConfig.clanName})` : 'Keluarga Besar (4 Kuadran)';
    const text = `Assalamu'alaikum wr. wb. Mengajak keluarga besar untuk melihat silsilah digital tata surya *OrbitQu* khusus *${clanTitle}*. Buka melalui tautan: ${getDynamicShareLink()}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(dataset, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OrbitQu_Silsilah_TataSurya_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('File cadangan silsilah OrbitQu (.json) berhasil diunduh!');
  };

  // Import JSON with Merge Support
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>, mergeMode: 'replace' | 'merge') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          if (mergeMode === 'replace') {
            setDataset(parsed);
            saveOrbitQuData(parsed);
            showNotification('Data silsilah OrbitQu berhasil ditimpa dengan file cadangan!');
          } else {
            // MERGE: Combine nodes without duplicate ids
            const existingIds = new Set(dataset.nodes.map(n => n.id));
            const newNodes = parsed.nodes.filter((n: OrbitNode) => !existingIds.has(n.id));
            const mergedDataset: OrbitQuDataset = {
              ...dataset,
              nodes: [...dataset.nodes, ...newNodes],
              lastUpdated: new Date().toISOString()
            };
            setDataset(mergedDataset);
            saveOrbitQuData(mergedDataset);
            showNotification(`Berhasil menggabungkan (merge) ${newNodes.length} anggota baru ke dalam sistem!`);
          }
          setShowImportExportModal(false);
        } else {
          showNotification('Format berkas tidak sesuai spesifikasi OrbitQu.');
        }
      } catch {
        showNotification('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`w-full h-full flex flex-col relative select-none overflow-hidden ${isDarkMode ? 'bg-[#030712] text-white' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* 1. TOP HEADER BAR: OrbitQu Tata Surya */}
      <header className={`px-3 py-2.5 flex justify-between items-center z-30 shrink-0 border-b backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/95 border-emerald-100 text-slate-900 shadow-xs'}`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onBackToLeluhurQu}
            className={`p-1.5 -ml-1 rounded-xl transition active:scale-95 ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-emerald-50 text-emerald-800'}`}
            title="Kembali ke LeluhurQu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm tracking-wide">
                Orbit<span className="text-amber-400">Qu</span>
              </h1>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-mono font-bold">
                Tata Surya
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              Silsilah Konsentris 6 Orbit • 4 Kuadran
            </p>
          </div>
        </div>

        {/* Action Controls: Batch, Share, Backup */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowBatchModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow transition active:scale-95"
            title="Buka Lembar Kerja Draft & Manajemen Batch"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Data</span> Batch
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className={`p-1.5 rounded-xl border transition active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
            title="Bagikan Tautan Undangan Trah"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowImportExportModal(true)}
            className={`p-1.5 rounded-xl border transition active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            title="Impor / Ekspor & Merge Cadangan JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. SUB-TOOLBAR: THEME SWITCHER, DARK/LIGHT MODE, FOCUS TRAH, TOGGLE ORBIT LINES */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar border-b text-xs shrink-0 ${isDarkMode ? 'bg-slate-950/70 border-slate-800/80 text-slate-300' : 'bg-slate-50/90 border-slate-200 text-slate-700'}`}>
        {/* Left: 4 Kuadran Focus Selector */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Fokus:</span>
          <button
            onClick={() => setSelectedQuadrantFilter('all')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${selectedQuadrantFilter === 'all' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-white/10 text-slate-400'}`}
          >
            Semua (4 Kuadran)
          </button>
          {Object.entries(QUADRANT_CONFIGS).map(([k, q]) => (
            <button
              key={k}
              onClick={() => setSelectedQuadrantFilter(k as OrbitQuadrant)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${selectedQuadrantFilter === k ? 'text-white shadow-xs' : 'hover:bg-white/10 text-slate-400'}`}
              style={{
                backgroundColor: selectedQuadrantFilter === k ? q.colorHex : 'transparent'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: q.colorHex }}></span>
              <span>{q.subLabel}</span>
            </button>
          ))}
        </div>

        {/* Right: Graphic Theme, Dark/Light Mode, Orbit Toggle, Connector Style */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Visual Theme Selector (4 Tema) */}
          <select
            value={theme}
            onChange={e => setTheme(e.target.value as VisualTheme)}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
            title="Pilih Variasi Tema Visual"
          >
            <option value="cosmic">🪐 Tata Surya Cosmic</option>
            <option value="neural">🧠 Urat Syaraf (Neural)</option>
            <option value="atom">⚛️ Struktur Atom (Quantum)</option>
            <option value="roots">🌱 Akar Organik (Roots)</option>
          </select>

          {/* Connector Style (Linear, Divergen, Hibrid) */}
          <select
            value={connectorStyle}
            onChange={e => setConnectorStyle(e.target.value as ConnectorStyle)}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
            title="Gaya Garis Konektor Silsilah"
          >
            <option value="divergent">Kipas Divergen</option>
            <option value="linear">Garis Linear</option>
            <option value="hybrid">Hibrid Auto</option>
          </select>

          {/* Toggle Garis Orbit (Clean View) */}
          <button
            onClick={() => setShowOrbitLines(!showOrbitLines)}
            className={`p-1 rounded-lg border transition ${showOrbitLines ? 'text-sky-400 border-sky-500/50' : 'text-slate-500 border-slate-700'}`}
            title={showOrbitLines ? 'Sembunyikan Garis Orbit (Clean View)' : 'Tampilkan Garis Orbit'}
          >
            {showOrbitLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1 rounded-lg border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-white border-slate-300 text-slate-700'}`}
            title={isDarkMode ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3. MAIN CANVAS VIEW */}
      <div className="flex-1 relative overflow-hidden">
        {dataset.nodes.length === 0 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 max-w-sm w-[90%] bg-slate-900/90 text-white border border-sky-500/40 p-3.5 rounded-2xl shadow-xl backdrop-blur-md text-center space-y-2">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="font-bold text-xs text-white">Orbit Silsilah Siap Diisi</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mulai dengan menyusun anggota keluarga di lembar kerja draft atau sinkronkan data dari LeluhurQu.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowBatchModal(true)}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] py-2 rounded-xl transition"
              >
                + Buka Lembar Kerja Draft
              </button>
              <button
                onClick={handleSyncFromLeluhurQu}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] px-3 py-2 rounded-xl flex items-center gap-1 transition"
                title="Tarik data keluarga yang sudah dibuat di LeluhurQu"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Sinkron</span>
              </button>
            </div>
          </div>
        )}

        <OrbitQuCanvas
          poros={dataset.poros}
          nodes={dataset.nodes}
          theme={theme}
          isDarkMode={isDarkMode}
          showOrbitLines={showOrbitLines}
          globalConnectorStyle={connectorStyle}
          selectedQuadrantFilter={selectedQuadrantFilter}
          onEditNode={node => setShowEditNodeModal(node)}
          onDeleteNode={handleDeleteNode}
          onAddChildToNode={parent => setShowAddChildModal(parent)}
          onEditPoros={() => setShowEditPorosModal(true)}
        />
      </div>

      {/* 4. MODALS */}

      {/* MODAL 1: BATCH EDITOR & DRAFT WORKSPACE */}
      {showBatchModal && (
        <OrbitQuBatchModal
          currentNodes={dataset.nodes}
          poros={dataset.poros}
          onSavePermanently={handleSavePermanently}
          onClose={() => setShowBatchModal(false)}
          showNotification={showNotification}
          onImportFromLeluhurQu={handleSyncFromLeluhurQu}
        />
      )}

      {/* MODAL 2: SHARE & DYNAMIC LINK */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-sky-400/40">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-400/30 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Bagikan Silsilah OrbitQu</h3>
                <p className="text-[10px] text-sky-300 font-mono">Dynamic Multi-Clan Share Link</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Fokus Kuadran untuk Tautan Undangan:
              </label>
              <select
                value={selectedQuadrantFilter}
                onChange={e => setSelectedQuadrantFilter(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="all">Semua Kuadran (Full Ecosystem)</option>
                <option value="ayah_user">Kuadran I: Trah Ayah (Kuningan)</option>
                <option value="ibu_user">Kuadran II: Trah Ibu (Bogor)</option>
                <option value="ayah_pasangan">Kuadran III: Trah Ayah Pasangan</option>
                <option value="ibu_pasangan">Kuadran IV: Trah Ibu Pasangan</option>
              </select>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono break-all text-slate-300 flex items-center justify-between">
                <span>{getDynamicShareLink()}</span>
                <button
                  onClick={handleCopyShareLink}
                  className="p-1 hover:text-sky-300 ml-2 shrink-0"
                  title="Salin Tautan"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleShareToWhatsApp}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke WhatsApp</span>
              </button>
              <button
                onClick={handleCopyShareLink}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT / EXPORT & MERGE CADANGAN JSON */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full p-4 space-y-3.5 shadow-2xl relative border border-sky-400/40">
            <button
              onClick={() => setShowImportExportModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-400/30 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Cadangan &amp; Penggabungan Akun (Merge)</h3>
                <p className="text-[10px] text-slate-400">Offline-First JSON Data Sovereignty</p>
              </div>
            </div>

            {/* Export */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
              <span className="text-xs font-bold text-sky-300 block">1. Unduh Cadangan Lokal (JSON):</span>
              <p className="text-[11px] text-slate-400">
                Simpan berkas cadangan data OrbitQu ke penyimpanan perangkat Anda.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan OrbitQu (.json)</span>
              </button>
            </div>

            {/* Import: Pilihan Gabung (Merge) atau Timpa (Replace) */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-emerald-300 block">2. Impor &amp; Gabungkan Silsilah (Merge):</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Anda dapat menggabungkan silsilah dari akun kerabat lain (misal rumpun Uyut 1 dan Uyut 2) tanpa menghapus data yang sudah ada, atau memilih untuk menimpa seluruh data.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-center shadow">
                  <Upload className="w-4 h-4" />
                  <span>Gabung (Merge)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={e => handleImportJSON(e, 'merge')}
                    className="hidden"
                  />
                </label>

                <label className="bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-center border border-slate-600">
                  <Upload className="w-4 h-4" />
                  <span>Timpa Total</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={e => handleImportJSON(e, 'replace')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT POROS TENGAH (USER & PASANGAN) */}
      {showEditPorosModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-amber-400/40">
            <button
              onClick={() => setShowEditPorosModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Edit Poros Utama (Dual-Bridge)</h3>
                <p className="text-[10px] text-amber-300">Inti Poros Silsilah Keluarga</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  Identitas Suami (Ego User):
                </span>
                <input
                  type="text"
                  value={dataset.poros.user.name}
                  onChange={e =>
                    updateDataset(prev => ({
                      ...prev,
                      poros: {
                        ...prev.poros,
                        user: { ...prev.poros.user, name: e.target.value }
                      }
                    }))
                  }
                  placeholder="Nama Suami"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-2">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                  Identitas Istri (Pasangan):
                </span>
                <input
                  type="text"
                  value={dataset.poros.spouse.name}
                  onChange={e =>
                    updateDataset(prev => ({
                      ...prev,
                      poros: {
                        ...prev.poros,
                        spouse: { ...prev.poros.spouse, name: e.target.value }
                      }
                    }))
                  }
                  placeholder="Nama Istri"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowEditPorosModal(false);
                  showNotification('Poros utama diperbarui!');
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TAMBAH ANAK / KETURUNAN */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-sky-400/40">
            <button
              onClick={() => setShowAddChildModal(null)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Tambah Keturunan / Anak</h3>
                <p className="text-[10px] text-slate-400">
                  Orang Tua: <strong className="text-sky-300">{showAddChildModal.name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Nama Lengkap Anak *
                </label>
                <input
                  type="text"
                  id="newChildName"
                  placeholder="Contoh: Muhammad Rayhan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    id="newChildGender"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Tahun Lahir
                  </label>
                  <input
                    type="number"
                    id="newChildBirthYear"
                    defaultValue="2020"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const nameEl = document.getElementById('newChildName') as HTMLInputElement;
                  const genderEl = document.getElementById('newChildGender') as HTMLSelectElement;
                  const yearEl = document.getElementById('newChildBirthYear') as HTMLInputElement;
                  handleAddChildSubmit({
                    name: nameEl?.value,
                    gender: (genderEl?.value as any) || 'L',
                    birthYear: yearEl?.value || '2020'
                  });
                }}
                className="flex-1 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow transition"
              >
                Simpan Keturunan
              </button>
              <button
                type="button"
                onClick={() => setShowAddChildModal(null)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT NODE ANGGOTA */}
      {showEditNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative border border-sky-400/40">
            <button
              onClick={() => setShowEditNodeModal(null)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center font-bold">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Edit Anggota Silsilah</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {showEditNodeModal.id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={showEditNodeModal.name}
                  onChange={e => setShowEditNodeModal({ ...showEditNodeModal, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Bin / Binti</label>
                  <input
                    type="text"
                    value={showEditNodeModal.binBinti || ''}
                    onChange={e => setShowEditNodeModal({ ...showEditNodeModal, binBinti: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Tahun Lahir</label>
                  <input
                    type="text"
                    value={showEditNodeModal.birthYear || ''}
                    onChange={e => setShowEditNodeModal({ ...showEditNodeModal, birthYear: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Kuadran</label>
                  <select
                    value={showEditNodeModal.quadrant}
                    onChange={e => setShowEditNodeModal({ ...showEditNodeModal, quadrant: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold"
                  >
                    <option value="ayah_user">Trah Ayah (Q1)</option>
                    <option value="ibu_user">Trah Ibu (Q2)</option>
                    <option value="ayah_pasangan">Ayah Pasangan (Q3)</option>
                    <option value="ibu_pasangan">Ibu Pasangan (Q4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status</label>
                  <select
                    value={showEditNodeModal.status}
                    onChange={e => setShowEditNodeModal({ ...showEditNodeModal, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-bold"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleUpdateNode(showEditNodeModal)}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2.5 rounded-xl shadow transition"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => setShowEditNodeModal(null)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
