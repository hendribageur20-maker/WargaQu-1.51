import React, { useState } from 'react';
import {
  OrbitNode,
  DualBridgePoros,
  OrbitQuadrant,
  OrbitGeneration,
  ConnectorStyle,
  QUADRANT_CONFIGS,
  GENERATION_LABELS
} from './orbitTypes';
import {
  X,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Camera,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface OrbitQuBatchModalProps {
  currentNodes: OrbitNode[];
  poros: DualBridgePoros;
  onSavePermanently: (updatedNodes: OrbitNode[]) => void;
  onClose: () => void;
  showNotification: (msg: string) => void;
  onImportFromLeluhurQu?: () => void;
}

export const OrbitQuBatchModal: React.FC<OrbitQuBatchModalProps> = ({
  currentNodes,
  poros,
  onSavePermanently,
  onClose,
  showNotification,
  onImportFromLeluhurQu
}) => {
  // Sistem Draft Murni (Clean Slate):
  // User starts with current permanent nodes in an editable draft list, or can clear to empty draft
  const [draftNodes, setDraftNodes] = useState<OrbitNode[]>(() => {
    // Clone nodes for draft editing
    return JSON.parse(JSON.stringify(currentNodes));
  });

  // Filter ala Excel dalam tabel draft
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuadrant, setFilterQuadrant] = useState<OrbitQuadrant | 'all'>('all');
  const [filterGeneration, setFilterGeneration] = useState<OrbitGeneration | 'all'>('all');

  // New Draft Row Input Form
  const [newRow, setNewRow] = useState<Partial<OrbitNode>>({
    name: '',
    nickname: '',
    binBinti: '',
    gender: 'L',
    generation: 1,
    quadrant: 'ayah_user',
    birthYear: '2015',
    status: 'Hidup',
    connectorStyle: 'divergent'
  });

  const handleAddDraftRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.name?.trim()) {
      showNotification('Nama anggota tidak boleh kosong.');
      return;
    }

    const createdNode: OrbitNode = {
      id: 'node_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: newRow.name.trim(),
      nickname: newRow.nickname?.trim() || undefined,
      binBinti: newRow.binBinti?.trim() || undefined,
      gender: newRow.gender || 'L',
      generation: (Number(newRow.generation) as OrbitGeneration) || 1,
      quadrant: newRow.quadrant || 'ayah_user',
      parentId: newRow.parentId || undefined,
      birthYear: newRow.birthYear?.trim() || undefined,
      deathYear: newRow.status === 'Almarhum' ? (newRow.deathYear?.trim() || undefined) : undefined,
      status: newRow.status || 'Hidup',
      origin: newRow.origin?.trim() || undefined,
      notes: newRow.notes?.trim() || undefined,
      connectorStyle: (newRow.connectorStyle as ConnectorStyle) || 'divergent'
    };

    setDraftNodes(prev => [createdNode, ...prev]);
    setNewRow({
      name: '',
      nickname: '',
      binBinti: '',
      gender: 'L',
      generation: 1,
      quadrant: newRow.quadrant,
      birthYear: '2015',
      status: 'Hidup',
      connectorStyle: 'divergent'
    });

    showNotification(`Baris draft "${createdNode.name}" berhasil ditambahkan.`);
  };

  const handleUpdateDraftField = (id: string, field: keyof OrbitNode, val: any) => {
    setDraftNodes(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleDeleteDraftRow = (id: string) => {
    setDraftNodes(prev => prev.filter(item => item.id !== id));
    showNotification('Baris draft dihapus.');
  };

  const handleClearDraftToEmpty = () => {
    setDraftNodes([]);
    showNotification('Lembar kerja draft dikosongkan (Clean Slate).');
  };

  const handleSaveDraftPermanently = () => {
    onSavePermanently(draftNodes);
    showNotification(`Berhasil menyimpan ${draftNodes.length} anggota secara permanen ke OrbitQu!`);
    onClose();
  };

  // Excel-like Filtered Rows
  const filteredDraftNodes = draftNodes.filter(node => {
    const matchesSearch =
      !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.nickname && node.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (node.binBinti && node.binBinti.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesQuad = filterQuadrant === 'all' || node.quadrant === filterQuadrant;
    const matchesGen = filterGeneration === 'all' || node.generation === filterGeneration;

    return matchesSearch && matchesQuad && matchesGen;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full p-4 space-y-3.5 shadow-2xl relative border border-sky-500/40 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-400/40 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Manajemen Data Batch &amp; Lembar Kerja Draft</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full font-mono">
                  Clean Start • {draftNodes.length} Anggota
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Susun data di lembar kerja draft, lalu tekan "Simpan Permanen" untuk merender kanvas orbit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar Form untuk Tambah Cepat ke Draft */}
        <form
          onSubmit={handleAddDraftRow}
          className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-2 shrink-0"
        >
          <div className="flex items-center justify-between text-xs font-bold text-sky-300">
            <span>+ Tambah Baris Anggota Baru ke Draft:</span>
            <span className="text-[10px] text-slate-400 font-normal">Belum tersimpan sampai Anda klik Simpan Permanen</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={newRow.name}
                onChange={e => setNewRow({ ...newRow, name: e.target.value })}
                placeholder="Nama Lengkap *"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <input
                type="text"
                value={newRow.binBinti}
                onChange={e => setNewRow({ ...newRow, binBinti: e.target.value })}
                placeholder="bin / binti..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={newRow.quadrant}
                onChange={e => setNewRow({ ...newRow, quadrant: e.target.value as OrbitQuadrant })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-medium focus:border-sky-500 focus:outline-none"
              >
                <option value="ayah_user">Trah Ayah (Q1)</option>
                <option value="ibu_user">Trah Ibu (Q2)</option>
                <option value="ayah_pasangan">Ayah Pasangan (Q3)</option>
                <option value="ibu_pasangan">Ibu Pasangan (Q4)</option>
              </select>
            </div>

            <div>
              <select
                value={newRow.generation}
                onChange={e => setNewRow({ ...newRow, generation: Number(e.target.value) as OrbitGeneration })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-medium focus:border-sky-500 focus:outline-none"
              >
                <option value={-3}>Uyut / Moyang (-3)</option>
                <option value={-2}>Kakek / Nenek (-2)</option>
                <option value={-1}>Orang Tua (-1)</option>
                <option value={1}>Anak (+1)</option>
                <option value={2}>Cucu (+2)</option>
                <option value={3}>Cicit (+3)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </form>

        {/* Toolbar Filter ala Excel (Search + Kuadran + Generasi) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama anggota, panggilan, atau bin..."
              className="bg-transparent border-none text-white text-xs focus:outline-none w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterQuadrant}
              onChange={e => setFilterQuadrant(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">Semua Kuadran</option>
              <option value="ayah_user">Trah Ayah (Q1)</option>
              <option value="ibu_user">Trah Ibu (Q2)</option>
              <option value="ayah_pasangan">Ayah Pasangan (Q3)</option>
              <option value="ibu_pasangan">Ibu Pasangan (Q4)</option>
            </select>

            <select
              value={filterGeneration}
              onChange={e => setFilterGeneration(e.target.value === 'all' ? 'all' : (Number(e.target.value) as any))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">Semua Orbit</option>
              <option value={-3}>Orbit Uyut (-3)</option>
              <option value={-2}>Orbit Kakek (-2)</option>
              <option value={-1}>Orbit Ortu (-1)</option>
              <option value={1}>Orbit Anak (1)</option>
              <option value={2}>Orbit Cucu (2)</option>
              <option value={3}>Orbit Cicit (3)</option>
            </select>

            <button
              onClick={handleClearDraftToEmpty}
              className="text-slate-400 hover:text-rose-400 text-[11px] px-2 py-1 rounded border border-slate-700 transition"
              title="Kosongkan draft agar mulai dari nol"
            >
              Kosongkan Draft
            </button>
          </div>
        </div>

        {/* Tabel Interaktif ala Excel */}
        <div className="flex-1 overflow-y-auto no-scrollbar border border-slate-800 rounded-xl bg-slate-950/40">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-2.5">No</th>
                <th className="p-2.5">Nama Lengkap</th>
                <th className="p-2.5">Bin / Binti</th>
                <th className="p-2.5">Kuadran Trah</th>
                <th className="p-2.5">Tingkat Generasi</th>
                <th className="p-2.5">Th. Lahir</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredDraftNodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <p className="font-medium text-xs">Lembar kerja draft kosong.</p>
                    <p className="text-[10px] mt-1">
                      Ketik anggota baru pada formulir di atas untuk mulai menyusun silsilah secara murni.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDraftNodes.map((node, index) => {
                  const quadConfig = QUADRANT_CONFIGS[node.quadrant as Exclude<OrbitQuadrant, 'poros'>] || QUADRANT_CONFIGS.ayah_user;

                  return (
                    <tr key={node.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-2.5 font-mono text-slate-500 text-[10px]">{index + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={node.name}
                          onChange={e => handleUpdateDraftField(node.id, 'name', e.target.value)}
                          className="bg-transparent font-bold text-white border-b border-transparent hover:border-slate-600 focus:border-sky-500 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={node.binBinti || ''}
                          onChange={e => handleUpdateDraftField(node.id, 'binBinti', e.target.value)}
                          placeholder="bin / binti"
                          className="bg-transparent text-slate-400 border-b border-transparent hover:border-slate-600 focus:border-sky-500 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={node.quadrant}
                          onChange={e => handleUpdateDraftField(node.id, 'quadrant', e.target.value)}
                          className="bg-slate-900 text-xs font-semibold rounded px-1.5 py-0.5 border border-slate-700"
                          style={{ color: quadConfig.colorHex }}
                        >
                          <option value="ayah_user">Trah Ayah (Q1)</option>
                          <option value="ibu_user">Trah Ibu (Q2)</option>
                          <option value="ayah_pasangan">Ayah Pasangan (Q3)</option>
                          <option value="ibu_pasangan">Ibu Pasangan (Q4)</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <select
                          value={node.generation}
                          onChange={e => handleUpdateDraftField(node.id, 'generation', Number(e.target.value))}
                          className="bg-slate-900 text-xs rounded px-1.5 py-0.5 border border-slate-700 text-slate-300"
                        >
                          <option value={-3}>Uyut (-3)</option>
                          <option value={-2}>Kakek/Nenek (-2)</option>
                          <option value={-1}>Orang Tua (-1)</option>
                          <option value={1}>Anak (1)</option>
                          <option value={2}>Cucu (2)</option>
                          <option value={3}>Cicit (3)</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={node.birthYear || ''}
                          onChange={e => handleUpdateDraftField(node.id, 'birthYear', e.target.value)}
                          placeholder="Tahun"
                          className="bg-transparent font-mono text-slate-300 border-b border-transparent hover:border-slate-600 focus:border-sky-500 focus:outline-none w-14"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={node.status}
                          onChange={e => handleUpdateDraftField(node.id, 'status', e.target.value)}
                          className="bg-slate-900 text-[10px] font-bold rounded px-1.5 py-0.5 border border-slate-700 text-slate-300"
                        >
                          <option value="Hidup">Hidup</option>
                          <option value="Almarhum">Almarhum</option>
                        </select>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleDeleteDraftRow(node.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                          title="Hapus baris draft ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer: Simpan Permanen (Permanent Save Action) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0">
          <div className="text-[11px] text-slate-400">
            Total Draft: <strong className="text-white">{draftNodes.length}</strong> anggota terdaftar
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveDraftPermanently}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Permanen &amp; Render Kanvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
