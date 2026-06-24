import { useState } from 'react';
import { 
  FileText, CheckCircle, Clock, Clipboard, AlertTriangle, 
  Search, Eye, Printer, Award, ExternalLink 
} from 'lucide-react';
import { ServiceApplication, DAFTAR_PELAYANAN } from '../types';

interface HistoryListProps {
  applications: ServiceApplication[];
  onAddNew: () => void;
  onViewDetails: (app: ServiceApplication) => void;
}

export default function HistoryList({ applications, onAddNew, onViewDetails }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredApps = applications.filter(app => {
    const service = DAFTAR_PELAYANAN.find(s => s.id === app.jenisPelayanan);
    const title = service ? service.title : '';
    return (
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: ServiceApplication['status']) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="h-4 w-4 stroke-emerald-600" />
            Selesai
          </span>
        );
      case 'diproses':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm animate-pulse">
            <Clock className="h-4 w-4 stroke-amber-600" />
            Diproses
          </span>
        );
      case 'ditolak':
        return (
          <span className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="h-4 w-4 stroke-red-600" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Clipboard className="h-4 w-4 stroke-blue-600" />
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner introducing Citizen services */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6" id="welcome-citizen-banner">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6 shrink-0 pointer-events-none">
          <FileText className="h-64 w-64" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-bold font-sans tracking-tight">Selamat Datang di Portal Warga Trajeng</h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-xl font-sans">
            Ajukan permohonan surat administrasi kelurahan secara digital. Isilah dokumen Surat Pernyataan Kehilangan langsung dari sistem dan pantau status pemrosesan secara berkala.
          </p>
        </div>
        <button
          onClick={onAddNew}
          id="new-service-btn"
          className="bg-white hover:bg-emerald-50 text-gray-900 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 shrink-0 self-start md:self-center"
        >
          + Buat Pengajuan Baru
        </button>
      </div>

      {/* Header filter list */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">Daftar Pengajuan Surat Pelayanan</h3>
          <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">RIWAYAT PERMOHONAN ARSIP PRIBADI ANDA</p>
        </div>
        
        {/* Search input field */}
        <div className="relative max-w-md w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="search-history-input"
            type="text"
            placeholder="Cari nomor pengajuan atau status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-xs font-semibold rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-700 shadow-sm"
          />
        </div>
      </div>

      {/* Grid of cards */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-150 text-center space-y-4" id="empty-history-container">
          <Clipboard className="h-12 w-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-800">Tidak ada pengajuan ditemukan</h4>
            <p className="text-xs text-gray-500">Anda belum pernah mengajukan berkas baru atau tidak ada kata kunci yang cocok.</p>
          </div>
          <button
            onClick={onAddNew}
            id="blank-create-btn"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
          >
            Mulai Pengajuan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="history-grid">
          {filteredApps.map((app) => {
            const service = DAFTAR_PELAYANAN.find(s => s.id === app.jenisPelayanan) || DAFTAR_PELAYANAN[0];
            return (
              <div 
                key={app.id} 
                className="bg-white rounded-2xl border border-gray-150 hover:border-gray-300 shadow-sm hover:shadow transition-all p-5 flex flex-col justify-between gap-4 font-sans"
              >
                <div className="space-y-3">
                  {/* Card Main line */}
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                      ID: {app.id}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                      {app.tanggalPengajuan}
                    </span>
                  </div>

                  {/* Service type title */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0 mt-0.5">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">{service.title}</h4>
                      <p className="text-xs text-gray-500 font-medium">Pemohon: {app.nama}</p>
                    </div>
                  </div>

                  {/* Keterangan comment details bubble */}
                  {app.keterangan && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-700 leading-normal italic">
                      <strong className="text-gray-900 block not-italic font-bold text-[10px] uppercase tracking-wider mb-0.5">Catatan Kelurahan:</strong>
                      "{app.keterangan}"
                    </div>
                  )}
                </div>

                {/* Bottom line: status badge & detail action */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100 mt-2">
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <button
                    onClick={() => onViewDetails(app)}
                    id={`view-details-${app.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline border-none bg-transparent"
                  >
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
