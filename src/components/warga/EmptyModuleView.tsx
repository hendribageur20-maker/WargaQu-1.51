import React from 'react';
import {
  ArrowLeft,
  Home,
  Siren,
  ShoppingBag,
  MapPin,
  HeartHandshake,
  MessageSquare,
  Settings,
  History,
  QrCode,
  Sparkles,
  UserCheck,
  Receipt,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface EmptyModuleViewProps {
  moduleId: string;
  onBack: () => void;
  onOpenUsahaQu: () => void;
}

interface ModuleInfo {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}

const MODULE_DATA: Record<string, ModuleInfo> = {
  rtqu: {
    title: 'RtQu',
    subtitle: 'Administrasi & Data Rukun Tetangga',
    icon: Home,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Menu data kependudukan dan administrasi RT 03 masih kosong.',
  },
  siagaqu: {
    title: 'SiagaQu',
    subtitle: 'Layanan Tanggap Darurat & SOS',
    icon: Siren,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200',
    description: 'Daftar panggilan darurat dan laporan keamanan saat ini kosong.',
  },
  areaqu: {
    title: 'AreaQu',
    subtitle: 'Fasilitas & Denah Kawasan Warga',
    icon: MapPin,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
    description: 'Daftar reservasi fasilitas balai warga dan taman masih kosong.',
  },
  muamalahqu: {
    title: 'MuamalahQu',
    subtitle: 'Laporan Kas, Zakat & Donasi',
    icon: HeartHandshake,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Data kas sosial, infaq, dan donasi kegiatan warga masih kosong.',
  },
  chatqu: {
    title: 'ChatQu',
    subtitle: 'Forum Diskusi & Pesan Warga',
    icon: MessageSquare,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50 border-sky-200',
    description: 'Ruang obrolan warga RT 03 saat ini belum memiliki pesan baru.',
  },
  setting: {
    title: 'Setting',
    subtitle: 'Pengaturan Akun & Aplikasi',
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 border-slate-200',
    description: 'Pengaturan profil warga dan preferensi notifikasi.',
  },
  aktivitas: {
    title: 'Aktivitas',
    subtitle: 'Riwayat Transaksi & Kegiatan',
    icon: History,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Belum ada riwayat aktivitas terbaru yang tercatat.',
  },
  qris: {
    title: 'WargaPay QRIS',
    subtitle: 'Scan & Pembayaran Cepat',
    icon: QrCode,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Kamera scanner QRIS pembayaran iuran warga belum aktif.',
  },
  untukmu: {
    title: 'Untukmu',
    subtitle: 'Rekomendasi & Promo Lingkungan',
    icon: Sparkles,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Belum ada promo atau rekomendasi khusus untuk Anda.',
  },
  akun: {
    title: 'Akun Saya',
    subtitle: 'Biodata Warga & Kartu Keluarga',
    icon: UserCheck,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Detail biodata warga (Hendriana - RT 03/RW 05).',
  },
  riwayat_iuran: {
    title: 'Riwayat Iuran',
    subtitle: 'Catatan Pembayaran Kas & Kebersihan',
    icon: Receipt,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Daftar riwayat pembayaran iuran warga Anda masih kosong.',
  },
};

export const EmptyModuleView: React.FC<EmptyModuleViewProps> = ({
  moduleId,
  onBack,
  onOpenUsahaQu,
}) => {
  const current = MODULE_DATA[moduleId] || {
    title: moduleId.toUpperCase(),
    subtitle: 'Modul Aplikasi WargaQu',
    icon: AlertCircle,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 border-slate-200',
    description: 'Modul ini saat ini masih kosong.',
  };

  const Icon = current.icon;

  return (
    <div className="flex-1 flex flex-col bg-[#f0fdf4] overflow-hidden text-slate-800">
      {/* Top Header Bar (Emerald Green #047857 to #059669) */}
      <div className="bg-gradient-to-r from-[#047857] via-[#059669] to-[#047857] pt-5 pb-4 px-4 text-white shadow-md flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition text-xs font-semibold text-emerald-100 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white tracking-wide">{current.title}</h2>
          <p className="text-[10px] text-[#5eead4]">{current.subtitle}</p>
        </div>

        <div className="w-16"></div>
      </div>

      {/* Content Area - Clean Empty State */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center text-center">
        <div
          className={`w-20 h-20 rounded-3xl ${current.bgColor} border flex items-center justify-center ${current.color} shadow-sm mb-4`}
        >
          <Icon className="w-10 h-10" />
        </div>

        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Menu {current.title} Masih Kosong
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
          {current.description}
        </p>

        {/* Informative notification box */}
        <div className="mt-6 w-full max-w-xs p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-xs text-left">
          <div className="flex items-start gap-2.5">
            <Inbox className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Status Modul:</span> Sesuai instruksi, menu ini dibiarkan kosong. Modul aktif dengan sistem POS & Kasir lengkap tersedia di <span className="font-bold text-emerald-700">UsahaQu (Bakso Qu)</span>.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
          <button
            onClick={onOpenUsahaQu}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#065f46] hover:to-[#047857] text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#5eead4]" />
            <span>Buka UsahaQu (Bakso Qu)</span>
          </button>

          <button
            onClick={onBack}
            className="w-full py-2 px-4 rounded-xl bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-50/50 font-semibold text-xs active:scale-98 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};
