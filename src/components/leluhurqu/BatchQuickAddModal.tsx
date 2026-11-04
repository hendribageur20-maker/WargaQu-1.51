import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  GitFork,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  CornerDownRight,
  UserPlus,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FamilyMember } from './LeluhurQuView';

interface BatchSubChildInput {
  tempId: string;
  subNo: string; // e.g. "2.1", "2.2"
  name: string;
  nickname?: string;
  gender: 'L' | 'P';
  status: 'Hidup' | 'Almarhum';
  birthYear?: string;
}

interface BatchChildInput {
  tempId: string;
  childIndex: number; // 1, 2, 3...
  name: string;
  nickname?: string;
  gender: 'L' | 'P';
  status: 'Hidup' | 'Almarhum';
  birthYear?: string;
  subChildren: BatchSubChildInput[];
  isSubOpen?: boolean;
}

interface BatchQuickAddModalProps {
  existingMembers: FamilyMember[];
  onClose: () => void;
  onSaveBatch: (newMembers: FamilyMember[]) => void;
  showNotification: (msg: string) => void;
}

export const BatchQuickAddModal: React.FC<BatchQuickAddModalProps> = ({
  existingMembers,
  onClose,
  onSaveBatch,
  showNotification
}) => {
  // Mode Tokoh Utama: Pilih yang ada atau buat baru
  const [rootMode, setRootMode] = useState<'create_new' | 'select_existing'>('create_new');
  const [selectedRootId, setSelectedRootId] = useState<string>(existingMembers[0]?.id || '');

  // Form Tokoh Utama Baru
  const [rootName, setRootName] = useState('Uyut Kartawidjaja');
  const [rootTitle, setRootTitle] = useState('Uyut / Leluhur Utama');
  const [rootGender, setRootGender] = useState<'L' | 'P'>('L');
  const [rootTrah, setRootTrah] = useState<FamilyMember['trah']>('ayah');
  const [rootStatus, setRootStatus] = useState<'Hidup' | 'Almarhum'>('Almarhum');
  const [rootBirthYear, setRootBirthYear] = useState('1920');

  // Mode Layout Silsilah untuk Batch ini
  const [batchLayoutMode, setBatchLayoutMode] = useState<'seri' | 'paralel'>('paralel');

  // State Daftar Anak
  const [childrenList, setChildrenList] = useState<BatchChildInput[]>([
    {
      tempId: 'c_1',
      childIndex: 1,
      name: 'Anak Pertama',
      nickname: 'Sulung',
      gender: 'L',
      status: 'Hidup',
      birthYear: '1950',
      subChildren: [],
      isSubOpen: false
    },
    {
      tempId: 'c_2',
      childIndex: 2,
      name: 'Anak Kedua',
      nickname: 'Tengah',
      gender: 'P',
      status: 'Hidup',
      birthYear: '1954',
      subChildren: [
        {
          tempId: 'sc_2_1',
          subNo: '2.1',
          name: 'Cucu Pertama (2.1)',
          nickname: 'Cucu 1',
          gender: 'L',
          status: 'Hidup',
          birthYear: '1980'
        },
        {
          tempId: 'sc_2_2',
          subNo: '2.2',
          name: 'Cucu Kedua (2.2)',
          nickname: 'Cucu 2',
          gender: 'P',
          status: 'Hidup',
          birthYear: '1984'
        }
      ],
      isSubOpen: true
    },
    {
      tempId: 'c_3',
      childIndex: 3,
      name: 'Anak Ketiga',
      nickname: 'Bungsu',
      gender: 'L',
      status: 'Hidup',
      birthYear: '1960',
      subChildren: [],
      isSubOpen: false
    }
  ]);

  // Tambah Baris Anak Baru
  const handleAddChild = () => {
    const nextIdx = childrenList.length + 1;
    setChildrenList(prev => [
      ...prev,
      {
        tempId: `c_${Date.now()}_${nextIdx}`,
        childIndex: nextIdx,
        name: `Anak ke-${nextIdx}`,
        gender: nextIdx % 2 === 1 ? 'L' : 'P',
        status: 'Hidup',
        birthYear: '',
        subChildren: [],
        isSubOpen: false
      }
    ]);
  };

  // Preset Jumlah Anak Cepat (misal 3, 5, 7)
  const handleSetQuickCount = (count: number) => {
    const newList: BatchChildInput[] = [];
    for (let i = 1; i <= count; i++) {
      const existing = childrenList[i - 1];
      newList.push({
        tempId: existing ? existing.tempId : `c_${Date.now()}_${i}`,
        childIndex: i,
        name: existing ? existing.name : `Anak ke-${i}`,
        nickname: existing ? existing.nickname : '',
        gender: existing ? existing.gender : (i % 2 === 1 ? 'L' : 'P'),
        status: existing ? existing.status : 'Hidup',
        birthYear: existing ? existing.birthYear : '',
        subChildren: existing ? existing.subChildren : [],
        isSubOpen: existing ? existing.isSubOpen : false
      });
    }
    setChildrenList(newList);
  };

  // Hapus Anak
  const handleRemoveChild = (index: number) => {
    setChildrenList(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      // Re-index remaining children
      return filtered.map((c, i) => {
        const newIdx = i + 1;
        const updatedSubs = c.subChildren.map((s, si) => ({
          ...s,
          subNo: `${newIdx}.${si + 1}`
        }));
        return {
          ...c,
          childIndex: newIdx,
          subChildren: updatedSubs
        };
      });
    });
  };

  // Update Data Anak
  const handleUpdateChild = (index: number, field: keyof BatchChildInput, value: any) => {
    setChildrenList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Tambah Sub-Anak (Cucu, misal 2.1, 2.2, 2.3)
  const handleAddSubChild = (childIdx: number) => {
    setChildrenList(prev => {
      const next = [...prev];
      const targetChild = next[childIdx];
      const nextSubIndex = targetChild.subChildren.length + 1;
      const subNo = `${targetChild.childIndex}.${nextSubIndex}`;

      const newSub: BatchSubChildInput = {
        tempId: `sc_${Date.now()}_${subNo}`,
        subNo,
        name: `Cucu (${subNo})`,
        gender: nextSubIndex % 2 === 1 ? 'L' : 'P',
        status: 'Hidup',
        birthYear: ''
      };

      targetChild.subChildren = [...targetChild.subChildren, newSub];
      targetChild.isSubOpen = true;
      return next;
    });
  };

  // Hapus Sub-Anak
  const handleRemoveSubChild = (childIdx: number, subIdx: number) => {
    setChildrenList(prev => {
      const next = [...prev];
      const target = next[childIdx];
      const filteredSubs = target.subChildren.filter((_, si) => si !== subIdx);
      target.subChildren = filteredSubs.map((s, si) => ({
        ...s,
        subNo: `${target.childIndex}.${si + 1}`
      }));
      return next;
    });
  };

  // Update Sub-Anak
  const handleUpdateSubChild = (childIdx: number, subIdx: number, field: keyof BatchSubChildInput, value: any) => {
    setChildrenList(prev => {
      const next = [...prev];
      const target = next[childIdx];
      const sub = [...target.subChildren];
      sub[subIdx] = { ...sub[subIdx], [field]: value };
      target.subChildren = sub;
      return next;
    });
  };

  // Simpan Batch ke Silsilah
  const handleSaveAll = () => {
    let parentMember: FamilyMember;
    const newMembersToInsert: FamilyMember[] = [];

    const effectiveTrah = rootMode === 'create_new' ? rootTrah : (existingMembers.find(m => m.id === selectedRootId)?.trah || 'ayah');

    // 1. Tentukan atau buat Tokoh Utama
    if (rootMode === 'create_new') {
      if (!rootName.trim()) {
        showNotification('Nama tokoh utama/leluhur tidak boleh kosong');
        return;
      }

      parentMember = {
        id: `batch_root_${Date.now()}`,
        name: rootName.trim(),
        role: rootTitle.trim() || 'Tokoh Utama',
        kinshipTitle: rootTitle.trim(),
        relation: 'buyut',
        trah: effectiveTrah,
        gender: rootGender,
        birthYear: rootBirthYear || '1920',
        status: rootStatus,
        memberNo: '01',
        canvasX: 700,
        canvasY: 80
      };
      newMembersToInsert.push(parentMember);
    } else {
      const found = existingMembers.find(m => m.id === selectedRootId);
      if (!found) {
        showNotification('Silakan pilih tokoh silsilah yang sudah ada');
        return;
      }
      parentMember = found;
    }

    const startX = parentMember.canvasX ?? 600;
    const startY = parentMember.canvasY ?? 100;

    const CARD_W = 270;
    const GAP_X = 50;
    const GAP_Y = 120;

    // 2. Buat Anak-Anak & Sub-Anak dengan koordinat otomatis
    const totalChildren = childrenList.length;
    const totalRowWidth = totalChildren * CARD_W + (totalChildren - 1) * GAP_X;
    const rowStartX = Math.max(40, startX - Math.floor(totalRowWidth / 2) + Math.floor(CARD_W / 2));

    childrenList.forEach((child, cIdx) => {
      if (!child.name.trim()) return;

      const childId = `batch_child_${Date.now()}_${cIdx + 1}`;
      let childCanvasX = 40;
      let childCanvasY = startY + CARD_W * 0.7 + GAP_Y;

      if (batchLayoutMode === 'seri') {
        // Tata Seri: Horisontal urutan 1, 2, 3, 4, 5
        childCanvasX = rowStartX + cIdx * (CARD_W + GAP_X);
        childCanvasY = startY + GAP_Y + 120;
      } else {
        // Tata Paralel: Berkolom per cabang anak
        childCanvasX = rowStartX + cIdx * (CARD_W + GAP_X + 20);
        childCanvasY = startY + GAP_Y + 110;
      }

      const childMember: FamilyMember = {
        id: childId,
        parentId: parentMember.id,
        name: child.name.trim(),
        nickname: child.nickname?.trim() || undefined,
        role: `Anak ke-${child.childIndex}`,
        kinshipTitle: `Anak ke-${child.childIndex}`,
        relation: 'anak',
        trah: effectiveTrah,
        gender: child.gender,
        birthYear: child.birthYear?.trim() || '1960',
        status: child.status,
        memberNo: `${child.childIndex}`,
        canvasX: childCanvasX,
        canvasY: childCanvasY
      };

      newMembersToInsert.push(childMember);

      // Buat Sub-Anak (Cucu: 2.1, 2.2, 2.3...)
      child.subChildren.forEach((sub, sIdx) => {
        if (!sub.name.trim()) return;

        const subId = `batch_sub_${Date.now()}_${cIdx + 1}_${sIdx + 1}`;
        let subX = childCanvasX;
        let subY = childCanvasY + (sIdx + 1) * (185 + 40);

        if (batchLayoutMode === 'seri') {
          // Pada Seri: Sub-anak berjejer di bawah
          subX = childCanvasX + sIdx * 60;
          subY = childCanvasY + 185 + 50;
        } else {
          // Pada Paralel: Sub-anak tersusun rapi bertingkat di dalam kolom yang sama
          subX = childCanvasX;
          subY = childCanvasY + (sIdx + 1) * (185 + 45);
        }

        const subMember: FamilyMember = {
          id: subId,
          parentId: childId,
          name: sub.name.trim(),
          nickname: sub.nickname?.trim() || undefined,
          role: `Cucu (Anak ${sub.subNo})`,
          kinshipTitle: `Cucu (${sub.subNo})`,
          relation: 'cucu',
          trah: effectiveTrah,
          gender: sub.gender,
          birthYear: sub.birthYear?.trim() || '1985',
          status: sub.status,
          memberNo: sub.subNo,
          canvasX: subX,
          canvasY: subY
        };

        newMembersToInsert.push(subMember);
      });
    });

    if (newMembersToInsert.length === 0) {
      showNotification('Tidak ada anggota yang diisi');
      return;
    }

    onSaveBatch(newMembersToInsert);
    showNotification(`Sukses! ${newMembersToInsert.length} anggota silsilah berhasil ditambahkan dan tampil di kanvas!`);
    onClose();
  };

  const totalCalculated = (rootMode === 'create_new' ? 1 : 0) +
    childrenList.filter(c => c.name.trim()).length +
    childrenList.reduce((acc, c) => acc + c.subChildren.filter(s => s.name.trim()).length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl relative border-2 border-emerald-300 text-slate-800 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Sparkles className="w-5 h-5 text-[#5eead4]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <span>Batch Isi Cepat Silsilah</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-black uppercase">
                  Multi-Child &amp; Cucu
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Isi Uyut &rarr; Anak ke (1, 2, 3...) &rarr; Cucu (2.1, 2.2...) sekali simpan, auto tampil di pohon kanvas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3.5 space-y-4">
          {/* STEP 1: PILIH / BUAT TOKOH UTAMA (ROOT) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Tokoh Induk / Leluhur (Uyut / Kakek)
                </span>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-white rounded-xl p-0.5 border border-emerald-200 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setRootMode('create_new')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    rootMode === 'create_new'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800'
                  }`}
                >
                  Buat Tokoh Baru
                </button>
                <button
                  type="button"
                  onClick={() => setRootMode('select_existing')}
                  disabled={existingMembers.length === 0}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    rootMode === 'select_existing'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800 disabled:opacity-40'
                  }`}
                >
                  Pilih Dari Yang Ada
                </button>
              </div>
            </div>

            {rootMode === 'create_new' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Nama Tokoh / Uyut *
                  </label>
                  <input
                    type="text"
                    value={rootName}
                    onChange={e => setRootName(e.target.value)}
                    placeholder="misal: Uyut Kartawijaya"
                    className="w-full bg-white border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Sebutan / Peran
                  </label>
                  <input
                    type="text"
                    value={rootTitle}
                    onChange={e => setRootTitle(e.target.value)}
                    placeholder="Uyut / Sesepuh Trah"
                    className="w-full bg-white border border-emerald-200 rounded-xl p-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Jalur Trah
                    </label>
                    <select
                      value={rootTrah}
                      onChange={e => setRootTrah(e.target.value as any)}
                      className="w-full bg-white border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold focus:outline-none"
                    >
                      <option value="ayah">Trah Ayah</option>
                      <option value="ibu">Trah Ibu</option>
                      <option value="inti">Keluarga Inti</option>
                      <option value="pasangan">Trah Pasangan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Gender &amp; Status
                    </label>
                    <div className="flex gap-1">
                      <select
                        value={rootGender}
                        onChange={e => setRootGender(e.target.value as any)}
                        className="w-1/2 bg-white border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold text-xs"
                      >
                        <option value="L">L</option>
                        <option value="P">P</option>
                      </select>
                      <select
                        value={rootStatus}
                        onChange={e => setRootStatus(e.target.value as any)}
                        className="w-1/2 bg-white border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold text-xs"
                      >
                        <option value="Almarhum">Wafat</option>
                        <option value="Hidup">Hidup</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Pilih Tokoh Induk Sebagai Sumber Cabang:
                </label>
                <select
                  value={selectedRootId}
                  onChange={e => setSelectedRootId(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-600"
                >
                  {existingMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.kinshipTitle || m.role} • Trah {m.trah})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* STEP 2: PILIHAN POLA TATA LETAK & CEPAT GENERATE */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Format Tata Letak Pohon
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-300 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBatchLayoutMode('paralel')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    batchLayoutMode === 'paralel'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Paralel: Anak 1, 2, 3 berjejer, sub-anak (2.1, 2.2) bersusun vertikal di kolom anak masing-masing"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Paralel (Cabang Kolom 2.1, 2.2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBatchLayoutMode('seri')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    batchLayoutMode === 'seri'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Seri: Anak 1, 2, 3 sejajar mendatar berurutan"
                >
                  <GitFork className="w-3.5 h-3.5 rotate-90" />
                  <span>Seri (Mendatar 1, 2, 3, 4, 5)</span>
                </button>
              </div>

              {/* Preset Tombol Jumlah Anak */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Preset:</span>
                {[3, 5, 7].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetQuickCount(num)}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold active:scale-95 transition"
                  >
                    {num} Anak
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: DAFTAR ANAK & SUB-ANAK HIERARKIS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Daftar Anak ke (1, 2, 3...) &amp; Lanjut Sub-Anak (2.1, 2.2, 2.3...)
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddChild}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris Anak</span>
              </button>
            </div>

            {/* List Kartu Anak */}
            <div className="space-y-3">
              {childrenList.map((child, cIdx) => (
                <div
                  key={child.tempId}
                  className="bg-white border-2 border-emerald-200/90 rounded-2xl p-3 shadow-xs hover:border-emerald-400 transition"
                >
                  {/* Row Anak Utama */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                        {child.childIndex}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-950">
                        Anak ke-{child.childIndex}
                      </span>
                      {child.subChildren.length > 0 && (
                        <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                          {child.subChildren.length} Cucu Terdaftar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddSubChild(cIdx)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition active:scale-95"
                        title={`Tambah cucu untuk anak nomor ${child.childIndex} (misal ${child.childIndex}.1, ${child.childIndex}.2)`}
                      >
                        <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                        <span>+ Cucu ({child.childIndex}.1, {child.childIndex}.2)</span>
                      </button>

                      {childrenList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChild(cIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus baris anak ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input Data Anak Utama */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2.5 text-xs">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={child.name}
                        onChange={e => handleUpdateChild(cIdx, 'name', e.target.value)}
                        placeholder={`Nama Lengkap Anak ke-${child.childIndex}`}
                        className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={child.nickname || ''}
                        onChange={e => handleUpdateChild(cIdx, 'nickname', e.target.value)}
                        placeholder="Panggilan"
                        className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={child.gender}
                        onChange={e => handleUpdateChild(cIdx, 'gender', e.target.value)}
                        className="w-1/2 bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold text-xs"
                      >
                        <option value="L">L</option>
                        <option value="P">P</option>
                      </select>
                      <select
                        value={child.status}
                        onChange={e => handleUpdateChild(cIdx, 'status', e.target.value)}
                        className="w-1/2 bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 font-bold text-xs"
                      >
                        <option value="Hidup">Hidup</option>
                        <option value="Almarhum">Wafat</option>
                      </select>
                    </div>
                  </div>

                  {/* DAFTAR SUB-ANAK (CUCU: 2.1, 2.2, 2.3...) */}
                  {child.subChildren.length > 0 && (
                    <div className="mt-3 pl-3 sm:pl-6 border-l-2 border-teal-300 space-y-2 bg-teal-50/40 p-2.5 rounded-r-2xl">
                      <div className="flex items-center justify-between text-teal-900 text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <CornerDownRight className="w-4 h-4 text-teal-600" />
                          <span>Cabang Keturunan Anak ke-{child.childIndex}:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSubChild(cIdx)}
                          className="text-[10px] text-teal-700 hover:text-teal-900 underline font-bold"
                        >
                          + Tambah Lagi ({child.childIndex}.{child.subChildren.length + 1})
                        </button>
                      </div>

                      {child.subChildren.map((sub, sIdx) => (
                        <div
                          key={sub.tempId}
                          className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-teal-200 shadow-2xs text-xs"
                        >
                          <span className="font-mono text-xs font-black bg-teal-700 text-white px-2 py-0.5 rounded-lg shadow-2xs">
                            {sub.subNo}
                          </span>
                          <input
                            type="text"
                            value={sub.name}
                            onChange={e => handleUpdateSubChild(cIdx, sIdx, 'name', e.target.value)}
                            placeholder={`Nama Cucu (${sub.subNo})`}
                            className="flex-1 min-w-[130px] bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold text-xs focus:outline-none focus:border-teal-600"
                          />
                          <input
                            type="text"
                            value={sub.nickname || ''}
                            onChange={e => handleUpdateSubChild(cIdx, sIdx, 'nickname', e.target.value)}
                            placeholder="Panggilan"
                            className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 text-xs focus:outline-none"
                          />
                          <select
                            value={sub.gender}
                            onChange={e => handleUpdateSubChild(cIdx, sIdx, 'gender', e.target.value)}
                            className="w-14 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold text-xs"
                          >
                            <option value="L">L</option>
                            <option value="P">P</option>
                          </select>
                          <select
                            value={sub.status}
                            onChange={e => handleUpdateSubChild(cIdx, sIdx, 'status', e.target.value)}
                            className="w-18 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold text-xs"
                          >
                            <option value="Hidup">Hidup</option>
                            <option value="Almarhum">Wafat</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubChild(cIdx, sIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Hapus sub-anak ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-600">
            Total yang akan ditambahkan:{' '}
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {totalCalculated} Orang
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-700/20 active:scale-98 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#5eead4]" />
              <span>Simpan &amp; Tampilkan di Kanvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
