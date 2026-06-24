import { useState } from 'react';
import { FileText, ArrowRight, ClipboardCheck, Info, LogIn } from 'lucide-react';
import { DAFTAR_PELAYANAN, ServiceType } from '../types';

interface ServiceCatalogBoxProps {
  onStartService: (type: ServiceType) => void;
  isLoggedIn: boolean;
  onRedirectToLogin: () => void;
}

export default function ServiceCatalogBox({
  onStartService,
  isLoggedIn,
  onRedirectToLogin
}: ServiceCatalogBoxProps) {
  const [selectedId, setSelectedId] = useState<ServiceType>('domisili_tinggal');

  const selectedService = DAFTAR_PELAYANAN.find(s => s.id === selectedId) || DAFTAR_PELAYANAN[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-6 text-left" id="service-selector-box-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            Kotak Syarat &amp; Pengajuan Layanan Mandiri
          </h3>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mt-0.5">Satu kotak sirkulasi persyaratan kependudukan trajeng</p>
        </div>
        <div className="w-full md:w-80">
          <label htmlFor="service-select" className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-mono">Pilih Jenis Pelayanan Surat:</label>
          <select
            id="service-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value as ServiceType)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            {DAFTAR_PELAYANAN.map((srv) => (
              <option key={srv.id} value={srv.id} className="font-sans font-semibold py-1">
                {srv.title.replace('PERSYARATAN', 'PERSYARATAN').replace('SURAT KETERANGAN', 'SURAT KET.')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left Col: Service Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-12 w-12 text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center font-bold shadow-xs">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-md font-extrabold text-gray-900 tracking-tight leading-snug">{selectedService.title}</h4>
            <span className="inline-block bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Kategori: {selectedService.kategori.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-650 leading-relaxed font-medium">
            {selectedService.deskripsi}
          </p>
        </div>

        {/* Right Col: Persyaratan list & Submission button */}
        <div className="lg:col-span-7 bg-emerald-50/20 border border-emerald-100 rounded-2xl p-6 space-y-5">
          <div>
            <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-emerald-600 shrink-0" />
              Kelengkapan Dokumen yang Wajib Disiapkan:
            </h5>
            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">PERIKSA DOKUMEN BERIKUT SEBELUM MEMULAI PENGISIAN</p>
          </div>

          <ul className="space-y-2.5">
            {selectedService.persyaratan.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-emerald-950 font-medium font-sans">
                <span className="h-4.5 w-4.5 rounded-md bg-emerald-100/80 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="leading-normal">{req}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-emerald-150/50">
            {isLoggedIn ? (
              <button
                id="submit-selected-service-btn"
                onClick={() => onStartService(selectedService.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-3.5 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Mulai Isi Berkas Pengajuan
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-amber-800 font-medium bg-amber-50 border border-amber-100 rounded-xl p-3 text-center leading-normal">
                  ⚠️ Silakan masuk (login) atau daftar akun warga mandiri terlebih dahulu untuk mengunggah berkas pengisian surat ini.
                </p>
                <button
                  id="redirect-login-btn"
                  onClick={onRedirectToLogin}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-3 transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <LogIn className="h-4 w-4" />
                  Masuk Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
