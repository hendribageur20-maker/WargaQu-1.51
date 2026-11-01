import React, { useState } from 'react';
import {
  Bell,
  Headphones,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Receipt,
  ChevronRight,
  Sparkles,
  Home,
  Siren,
  ShoppingBag,
  MapPin,
  HeartHandshake,
  MessageSquare,
  Settings,
  QrCode,
  Newspaper,
  History,
  UserCheck,
  SlidersHorizontal,
  Info,
  Download,
  Mic,
  Store,
  CreditCard,
  GitFork
} from 'lucide-react';
import { PWAInstallBanner } from '../pwa/PWAInstallBanner';

interface WargaDashboardProps {
  onOpenLeluhurQu: () => void;
  onOpenRtQu: () => void;
  onOpenSiagaQu: () => void;
  onOpenUsahaQu: () => void;
  onOpenModularQu: () => void;
  onOpenBantuan: () => void;
  onOpenChatQu: () => void;
  onOpenMuamalahQu: () => void;
  onOpenAreaQu: () => void;
  onOpenEmptyModule: (moduleId: string) => void;
  activeOrderCount?: number;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  onOpenLeluhurQu,
  onOpenRtQu,
  onOpenSiagaQu,
  onOpenUsahaQu,
  onOpenModularQu,
  onOpenBantuan,
  onOpenChatQu,
  onOpenMuamalahQu,
  onOpenAreaQu,
  onOpenEmptyModule,
  activeOrderCount = 0,
}) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2500);
  };

  const realBalance = '2.450.000';
  const maskedBalance = '••••••••';

  return (
    <div className="w-full h-full bg-[#f0fdf4] overflow-hidden flex flex-col relative no-scrollbar select-none">
      {/* TOP APP BAR & HEADER CONTAINER (Emerald Green #047857 to #059669) */}
      <div className="bg-gradient-to-b from-[#047857] via-[#059669] to-[#059669] pt-5 px-5 pb-16 rounded-b-[32px] relative text-white shrink-0 shadow-md">
        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-3">
          {/* Logo / Title with Mint Accent */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold italic tracking-tight text-white">
              warga<span className="text-[#5eead4] font-black drop-shadow-xs">Qu</span>
            </span>
            <span className="text-[10px] bg-emerald-950/30 border border-emerald-300/40 px-2 py-0.5 rounded-full font-bold text-[#5eead4]">
              RT 03
            </span>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
              onClick={() => showToast('Notifikasi: Tidak ada pesan baru')}
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-300 rounded-full ring-2 ring-emerald-800"></span>
            </button>
            <button
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
              onClick={onOpenBantuan}
              title="Pusat Bantuan UsahaQu & WargaQu"
            >
              <Headphones className="w-5 h-5 text-[#5eead4]" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
              onClick={() => onOpenEmptyModule('akun')}
              title="Pengaturan Profil"
            >
              <User className="w-5 h-5 text-emerald-100" />
            </button>
          </div>
        </div>

        {/* Greeting User */}
        <div className="mt-1 mb-1">
          <p className="text-xs text-emerald-200 tracking-wider uppercase font-medium">Halo,</p>
          <h1 className="text-lg font-bold text-white tracking-wide">HENDRIANA</h1>
        </div>
      </div>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 -mt-12 pb-24 space-y-3.5">
        {/* PWA Direct Mobile Install Banner */}
        <PWAInstallBanner showToast={showToast} />

        {/* MAIN CARD WIDGET: TOTAL IURAN */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/90 relative overflow-hidden">
          {/* Top ID Badge Row */}
          <div className="flex justify-between items-center pb-3 border-b border-emerald-50">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ID WARGA: RT 03 / RW 05</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Blok A No. 12</span>
          </div>

          {/* Primary Metric Display */}
          <div className="pt-3 pb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">
                Total Iuran Masuk (Awal - Sekarang)
              </span>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="text-emerald-700 hover:text-emerald-900 transition p-1 active:scale-95"
                title="Sembunyikan / Tampilkan Saldo"
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm font-bold text-emerald-700">IDR</span>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight font-mono">
                {isBalanceHidden ? maskedBalance : realBalance}
              </span>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="pt-2 border-t border-emerald-50 flex justify-between items-center text-xs font-semibold text-emerald-700">
            <button
              onClick={() => onOpenEmptyModule('riwayat_iuran')}
              className="flex items-center gap-1.5 hover:text-emerald-800 hover:underline active:opacity-80"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Lihat Riwayat Pembayaran</span>
            </button>
            <ChevronRight className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* MENU UTAMA (MODULE GRID) - LAYER & POSISI SEJAJAR DENGAN LELUHURQU */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/90 relative z-10">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Menu Utama</h3>
            <button
              onClick={() => showToast('Mode Atur Menu Utama')}
              className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Atur
            </button>
          </div>

          {/* Grid Items (Menu Utama): Baris 1: LeluhurQu, RtQu, MuamalahQu, AreaQu (Sejajar) */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {/* 1. LeluhurQu */}
            <button
              onClick={onOpenLeluhurQu}
              className="flex flex-col items-center group relative active:scale-95 transition"
              title="Buka Modul LeluhurQu (Silsilah & Medsos Keluarga)"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition shadow-xs">
                <GitFork className="w-6 h-6 rotate-180 text-emerald-700" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                LeluhurQu
              </span>
            </button>

            {/* 2. RtQu */}
            <button
              onClick={onOpenRtQu}
              className="flex flex-col items-center group active:scale-95 transition"
              title="Buka Modul RtQu"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition shadow-xs">
                <Home className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                RtQu
              </span>
            </button>

            {/* 3. MuamalahQu */}
            <button
              onClick={onOpenMuamalahQu}
              className="flex flex-col items-center group active:scale-95 transition"
              title="Buka Modul MuamalahQu"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                MuamalahQu
              </span>
            </button>

            {/* 4. AreaQu */}
            <button
              onClick={onOpenAreaQu}
              className="flex flex-col items-center group active:scale-95 transition"
              title="Buka Modul AreaQu"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                AreaQu
              </span>
            </button>

            {/* 5. SiagaQu (Panic Button) */}
            <button
              onClick={onOpenSiagaQu}
              className="flex flex-col items-center group relative active:scale-95 transition"
              title="Buka Modul SiagaQu (Panic Button)"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-105 transition shadow-xs">
                <Siren className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold px-1 rounded-full">
                SOS
              </span>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                SiagaQu
              </span>
            </button>

            {/* 6. UsahaQu (BAKSO QU POS SYSTEM) */}
            <button
              onClick={onOpenUsahaQu}
              className="flex flex-col items-center group relative active:scale-95 transition"
              title="Buka POS Kasir Bakso Qu"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 border-2 border-emerald-500 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition shadow-md shadow-emerald-200/50">
                <ShoppingBag className="w-6 h-6 text-emerald-700" />
              </div>
              {/* Highlight badge for Bakso Qu */}
              <span className="absolute -top-1.5 -right-1 bg-emerald-700 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-tight">
                POS
              </span>
              {activeOrderCount > 0 && (
                <span className="absolute -top-1.5 -left-1 bg-rose-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {activeOrderCount}
                </span>
              )}
              <span className="text-[11px] font-bold text-emerald-900 mt-1.5 text-center leading-tight flex items-center gap-0.5">
                UsahaQu
              </span>
              <span className="text-[9px] text-emerald-600 font-semibold leading-none">
                Bakso Qu
              </span>
            </button>

            {/* 7. POS ModularQu (MODULAR VOICE POS SYSTEM) */}
            <button
              onClick={onOpenModularQu}
              className="flex flex-col items-center group relative active:scale-95 transition"
              title="Buka POS ModularQu (Voice AI Kasir)"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 via-emerald-100 to-emerald-200 border-2 border-emerald-500 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition shadow-md shadow-emerald-200/50">
                <Store className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="absolute -top-1.5 -right-1 bg-teal-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-tight">
                MODULAR
              </span>
              <span className="text-[11px] font-bold text-emerald-900 mt-1.5 text-center leading-tight flex items-center gap-0.5">
                ModularQu
              </span>
              <span className="text-[9px] text-teal-600 font-semibold leading-none">
                Voice POS
              </span>
            </button>

            {/* 8. ChatQu */}
            <button
              onClick={onOpenChatQu}
              className="flex flex-col items-center group relative active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-105 transition shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-full">
                3
              </span>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                ChatQu
              </span>
            </button>

            {/* 9. Setting */}
            <button
              onClick={() => onOpenEmptyModule('setting')}
              className="flex flex-col items-center group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-105 transition shadow-xs">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center leading-tight">
                Setting
              </span>
            </button>
          </div>

          {/* Indicator dots */}
          <div className="flex justify-center items-center gap-1.5 mt-5">
            <span className="w-5 h-1.5 bg-emerald-600 rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-emerald-200 rounded-full"></span>
          </div>
        </div>

        {/* FOKUS USAHAQU: SPOTLIGHT CARD (BAKSO QU + MODULARQU) */}
        <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] rounded-2xl p-3.5 text-white shadow-md border border-emerald-400/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                Fokus UsahaQu • POS Kasir Cerdas
              </span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-[#5eead4] border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
              Resto & Multi-Usaha
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 1. Bakso Qu Resto Card */}
            <button
              onClick={onOpenUsahaQu}
              className="bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-500/30 rounded-xl p-2.5 text-left flex flex-col justify-between active:scale-98 transition group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-[8px] bg-emerald-500 text-zinc-950 font-black px-1.5 py-0.5 rounded uppercase">
                    Meja
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  Bakso Qu Resto
                </h4>
                <p className="text-[10px] text-emerald-200/80 leading-tight mt-0.5">
                  POS Dine-in, denah meja & dapur
                </p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <span>Buka Resto</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>

            {/* 2. POS ModularQu Card */}
            <button
              onClick={onOpenModularQu}
              className="bg-emerald-950/70 hover:bg-emerald-950/90 border border-teal-400/40 rounded-xl p-2.5 text-left flex flex-col justify-between active:scale-98 transition group relative shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4 text-teal-300" />
                  </div>
                  <span className="text-[8px] bg-teal-400 text-zinc-950 font-black px-1.5 py-0.5 rounded uppercase">
                    Voice AI
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                  POS ModularQu
                </h4>
                <p className="text-[10px] text-emerald-200/80 leading-tight mt-0.5">
                  Voice Kasir, 4 format struk & omset
                </p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-teal-300 flex items-center gap-1">
                <span>Buka Modular</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* ANNOUNCEMENT / BANNER CAROUSEL */}
        <div
          onClick={() => showToast('Detail Kegiatan: Gotong Royong Minggu Pagi jam 07:00')}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl p-3.5 text-white shadow-sm flex items-center justify-between cursor-pointer hover:opacity-95 active:scale-[0.99] transition border border-emerald-500/30"
        >
          <div className="space-y-0.5">
            <div className="inline-block bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
              Kegiatan Warga
            </div>
            <h4 className="text-xs font-bold leading-tight">Gotong Royong Minggu Ini!</h4>
            <p className="text-[11px] text-emerald-100">Dapatkan Poin Keaktifan Warga &gt;</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
        </div>

        {/* EXTRA FEATURE STRIP (NFC / QUICK BAYAR BANNER) */}
        <div
          onClick={() => onOpenEmptyModule('qris')}
          className="bg-white rounded-xl p-3 border border-emerald-100/90 flex items-center justify-between shadow-xs cursor-pointer hover:bg-emerald-50/50 active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800">Bayar Iuran via WargaPay</h5>
              <p className="text-[10px] text-slate-500">Scan QRIS atau Transfer Otomatis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600" />
        </div>

        {/* PUSAT BANTUAN & AUTO-FIX CS STRIP */}
        <div
          onClick={onOpenBantuan}
          className="bg-slate-900 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-800 active:scale-[0.99] transition text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
              <Headphones className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h5 className="text-xs font-bold text-white">UsahaQu Smart Care</h5>
                <span className="bg-emerald-900/80 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-500/30">
                  AI Auto-Fix
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Pusat Bantuan &amp; Prompt Engine Konsol CS</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400" />
        </div>

        {/* LATEST NEWS / COMMUNITY INFO */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/90 space-y-3">
          <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
            Kabar RT 03
          </h3>
          <div
            onClick={() => showToast('Membuka pengumuman: Jadwal Ronda Malam')}
            className="flex gap-3 items-center cursor-pointer hover:opacity-85 transition"
          >
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0 flex items-center justify-center text-emerald-700">
              <Newspaper className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                Jadwal Ronda Malam Bulan Ini Telah Diperbarui
              </p>
              <p className="text-[10px] text-slate-400">2 Jam yang lalu • Pengurus RT</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR WITH FLOATING QRIS BUTTON */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-3 py-2 flex justify-around items-end z-40 shadow-lg">
        {/* Beranda */}
        <button
          className="flex flex-col items-center gap-0.5 text-emerald-700 active:scale-95 transition"
          onClick={() => showToast('Anda sedang di Beranda WargaQu')}
        >
          <Home className="w-5 h-5 text-emerald-700" />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>

        {/* Aktivitas */}
        <button
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-emerald-700 active:scale-95 transition"
          onClick={() => onOpenEmptyModule('aktivitas')}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Aktivitas</span>
        </button>

        {/* CENTER FLOATING WargaPay / QRIS BUTTON */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => onOpenEmptyModule('qris')}
            className="w-14 h-14 bg-gradient-to-tr from-[#047857] via-[#059669] to-[#2dd4bf] rounded-full p-0.5 shadow-lg shadow-emerald-700/30 flex items-center justify-center text-white border-4 border-[#f0fdf4] pulse-animation active:scale-95 transition"
            title="Scan QRIS WargaQu"
          >
            <div className="w-full h-full rounded-full flex flex-col items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </button>
          <span className="text-[10px] font-extrabold text-emerald-700 mt-0.5">QRIS</span>
        </div>

        {/* Untukmu */}
        <button
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-emerald-700 relative active:scale-95 transition"
          onClick={() => onOpenEmptyModule('untukmu')}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">Untukmu</span>
          <span className="absolute top-0 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
        </button>

        {/* Akun Saya */}
        <button
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-emerald-700 active:scale-95 transition"
          onClick={() => onOpenEmptyModule('akun')}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium">Akun Saya</span>
        </button>
      </div>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div
        className={`absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-950/95 text-[#5eead4] border border-emerald-500/50 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md shadow-xl z-50 flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <Info className="w-4 h-4 text-[#5eead4]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
