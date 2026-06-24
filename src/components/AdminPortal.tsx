import { useState, useMemo } from 'react';
import {
  FileText, CheckCircle, Clock, Search, Eye, ShieldAlert, BadgeCheck, X, Check,
  Users, BarChart2, PieChart as PieIcon, TrendingUp, ShieldCheck, UserCheck, ShieldAlert as AlertIcon,
  ToggleLeft, ToggleRight, FileCheck, Landmark, BarChart3, Trash2
} from 'lucide-react';
import { ServiceApplication, ServiceStatus, DAFTAR_PELAYANAN, UserAccount } from '../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

interface AdminPortalProps {
  applications: ServiceApplication[];
  onUpdateStatus: (id: string, status: ServiceStatus, comment: string) => void;
  onViewDetails: (app: ServiceApplication) => void;
  registeredUsers: UserAccount[];
  onUpdateUser: (updatedUser: UserAccount) => void;
  onRegisterUser?: (newUser: UserAccount) => void;
  onAddApplication?: (newApp: ServiceApplication) => void;
  onDeleteUser?: (id: string) => void;
}

export default function AdminPortal({
  applications,
  onUpdateStatus,
  onViewDetails,
  registeredUsers,
  onUpdateUser,
  onRegisterUser,
  onAddApplication,
  onDeleteUser
}: AdminPortalProps) {
  // Main admin visual tabs: 'accounts' (Default, per prompt request), 'applications' (verifikasi), 'reports' (laporan)
  const [adminTab, setAdminTab] = useState<'accounts' | 'applications' | 'reports'>('accounts');

  // New creation modals states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [selectedUserOption, setSelectedUserOption] = useState('manual');
  const [newAppServiceType, setNewAppServiceType] = useState<string>(DAFTAR_PELAYANAN[0]?.id || 'kk_baru');
  const [newAppUploadedFiles, setNewAppUploadedFiles] = useState<{ [key: string]: string }>({});

  // State for new user registration documents (KTP & Pasfoto)
  const [newUserKtpUrl, setNewUserKtpUrl] = useState('');
  const [newUserKtpName, setNewUserKtpName] = useState('');
  const [newUserPasfotoUrl, setNewUserPasfotoUrl] = useState('');
  const [newUserPasfotoName, setNewUserPasfotoName] = useState('');

  // Applications management states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceStatus>('all');
  const [activeReviewApp, setActiveReviewApp] = useState<ServiceApplication | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Accounts management search state
  const [accountSearch, setAccountSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [reportTimeframe, setReportTimeframe] = useState<'semua' | 'hari_ini' | 'kemarin' | 'bulan_ini' | 'tahun_ini'>('semua');

  // Selected user for viewing documents modal
  const [selectedDocsUser, setSelectedDocsUser] = useState<UserAccount | null>(null);

  // Selected requirement document for previewing inside Review modal
  const [previewingDoc, setPreviewingDoc] = useState<{
    reqName: string;
    fileName: string;
    app: ServiceApplication;
  } | null>(null);

  // Status mapping
  function appStatusClass(status: string): ServiceStatus {
    return status as ServiceStatus;
  }

  // Filter applications for reports based on timeframe
  const reportFilteredApplications = useMemo(() => {
    if (reportTimeframe === 'semua') return applications;
    
    const now = new Date();
    const yyyy_mm_dd = now.toISOString().split('T')[0]; // Format User
    const dd_mm_yyyy = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'); // Format Admin
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterday_yyyy_mm_dd = yesterday.toISOString().split('T')[0];
    const yesterday_dd_mm_yyyy = yesterday.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

    const yyyy_mm = yyyy_mm_dd.substring(0, 7); // YYYY-MM
    const mm_yyyy = dd_mm_yyyy.substring(3); // MM-YYYY
    const yyyy = yyyy_mm_dd.substring(0, 4); // YYYY

    return applications.filter(app => {
      if (!app.tanggalPengajuan) return true;
      
      if (reportTimeframe === 'hari_ini') {
        return app.tanggalPengajuan === yyyy_mm_dd || app.tanggalPengajuan === dd_mm_yyyy;
      } else if (reportTimeframe === 'kemarin') {
        return app.tanggalPengajuan === yesterday_yyyy_mm_dd || app.tanggalPengajuan === yesterday_dd_mm_yyyy;
      } else if (reportTimeframe === 'bulan_ini') {
        return app.tanggalPengajuan.startsWith(yyyy_mm) || app.tanggalPengajuan.endsWith(mm_yyyy);
      } else if (reportTimeframe === 'tahun_ini') {
        return app.tanggalPengajuan.startsWith(yyyy) || app.tanggalPengajuan.endsWith(yyyy);
      }
      return true;
    });
  }, [applications, reportTimeframe]);

  // Count apps stats based on report filter
  const totalApps = reportFilteredApplications.length;
  const pendingApps = reportFilteredApplications.filter(a => appStatusClass(a.status) === 'pending').length;
  const processingApps = reportFilteredApplications.filter(a => appStatusClass(a.status) === 'diproses').length;
  const completedApps = reportFilteredApplications.filter(a => appStatusClass(a.status) === 'selesai').length;
  const rejectedApps = reportFilteredApplications.filter(a => appStatusClass(a.status) === 'ditolak').length;
  const pendingUsersCount = registeredUsers.filter(u => u.role === 'user' && u.status === 'tidak aktif').length;

  // Pie chart data for Application Statuses
  const statusChartData = [
    { name: 'Menunggu', value: pendingApps, color: '#3b82f6' },
    { name: 'Diproses', value: processingApps, color: '#f59e0b' },
    { name: 'Selesai', value: completedApps, color: '#10b981' },
    { name: 'Ditolak', value: rejectedApps, color: '#ef4444' }
  ];

  // Bar chart data for popular services
  const popularServicesData = DAFTAR_PELAYANAN.map(srv => {
    const count = reportFilteredApplications.filter(a => a.jenisPelayanan === srv.id).length;
    return {
      slug: srv.id,
      name: srv.title.replace('PERSYARATAN', 'PERSYARATAN').slice(0, 15) + '...',
      jumlah: count
    };
  }).sort((a, b) => b.jumlah - a.jumlah).slice(0, 7); // Show top 7 services based on actual usage

  // Area chart data (trend of service requests over recent dates)
  const trendData = [
    { tanggal: '06/10', pengajuan: 4, selesai: 2 },
    { tanggal: '06/11', pengajuan: 6, selesai: 4 },
    { tanggal: '06/12', pengajuan: 3, selesai: 3 },
    { tanggal: '06/13', pengajuan: 8, selesai: 5 },
    { tanggal: '06/14', pengajuan: 5, selesai: 4 },
    { tanggal: '06/15', pengajuan: 10, selesai: 8 },
    { tanggal: '06/16', pengajuan: applications.length, selesai: completedApps }
  ];

  // Filtering users
  const filteredUsers = registeredUsers.filter(user => {
    const query = accountSearch.toLowerCase();
    return (
      user.nama.toLowerCase().includes(query) ||
      user.nik.includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }).sort((a, b) => a.nama.localeCompare(b.nama));

  // Filtering applications
  const filteredApps = applications.filter(app => {
    const service = DAFTAR_PELAYANAN.find(s => s.id === app.jenisPelayanan);
    const title = service ? service.title : '';
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.nik.includes(searchTerm) ||
      title.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && app.status === statusFilter;
  }).sort((a, b) => a.nama.localeCompare(b.nama));

  // Handle account changes
  const handleToggleRole = (user: UserAccount) => {
    const updatedUser: UserAccount = {
      ...user,
      role: user.role === 'admin' ? 'user' : 'admin'
    };
    onUpdateUser(updatedUser);
  };

  const handleToggleStatus = (user: UserAccount) => {
    const updatedUser: UserAccount = {
      ...user,
      status: user.status === 'aktif' ? 'tidak aktif' : 'aktif'
    };
    onUpdateUser(updatedUser);
  };

  // Process applications
  const handleOpenReview = (app: ServiceApplication) => {
    setActiveReviewApp(app);
    setCommentInput(app.keterangan || '');
  };

  const handleSaveReview = (status: ServiceStatus) => {
    if (!activeReviewApp) return;

    let finalComment = commentInput.trim();
    if (!finalComment) {
      if (status === 'selesai') {
        finalComment = 'Berkas Anda telah selesai diverifikasi secara sah oleh Lurah Trajeng. Silakan datangi langsung Loket Pelayanan Umum Kelurahan Trajeng guna mengambil cetakan berkas resmi yang bertanda tangan basah dan stempel kelurahan.';
      } else if (status === 'diproses') {
        finalComment = 'Berkas sedang diverifikasi administratif oleh staf petugas Kelurahan Trajeng.';
      } else if (status === 'ditolak') {
        finalComment = 'Maaf, berkas ditolak karena ketidaksesuaian dokumen lampiran. Silakan ajukan ulang dengan berkas valid.';
      }
    }

    onUpdateStatus(activeReviewApp.id, status, finalComment);
    setActiveReviewApp(null);
  };

  const handleDownloadPDFLaporan = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon aktifkan pop-up browser untuk mencetak laporan.');
      return;
    }

    const srvStats = DAFTAR_PELAYANAN.map(srv => {
      const count = applications.filter(a => a.jenisPelayanan === srv.id).length;
      return `<tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: 500;">${srv.title}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #059669;">${count} Berkas</td>
      </tr>`;
    }).join('');

    const appRows = applications.map((app, idx) => {
      const srv = DAFTAR_PELAYANAN.find(s => s.id === app.jenisPelayanan);
      return `<tr>
        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; font-family: monospace;">${app.id}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${app.nama}</td>
        <td style="padding: 8px; border: 1px solid #ccc; font-family: monospace;">${app.nik}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${srv ? srv.title : app.jenisPelayanan}</td>
        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 8pt; font-weight: bold; text-transform: uppercase; ${app.status === 'selesai' ? 'background-color: #d1fae5; color: #065f46;' :
          app.status === 'diproses' ? 'background-color: #fef3c7; color: #92400e;' :
            app.status === 'ditolak' ? 'background-color: #fee2e2; color: #991b1b;' :
              'background-color: #dbeafe; color: #1e40af;'
        }">${app.status}</span>
        </td>
        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${app.tanggalPengajuan}</td>
      </tr>`;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>LAPORAN_STATISTIK_PELAYANAN_TRAJENG</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #222; font-size: 10pt; line-height: 1.4; }
            .header-table { width: 100%; border-bottom: 3.5px double #000; padding-bottom: 8px; margin-bottom: 20px; }
            .header-logo { width: 65px; height: auto; }
            .header-text { text-align: center; }
            .title { text-align: center; text-transform: uppercase; font-weight: 800; font-size: 13pt; margin-top: 15px; margin-bottom: 20px; text-decoration: underline; letter-spacing: 0.5px; }
            .meta-info { margin-bottom: 20px; font-size: 9.5pt; font-weight: 500; background-color: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 9pt; }
            .data-table th { background-color: #f3f4f6; font-weight: 700; padding: 10px; border: 1px solid #6b7280; text-align: left; text-transform: uppercase; }
            .data-table td { padding: 8px; border: 1px solid #9ca3af; }
            .summary-cards-grid { display: grid; grid-template-cols: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; background-color: #fafafa; text-align: center; }
            .card-title { font-size: 7.5pt; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
            .card-val { font-size: 15pt; font-weight: 800; color: #0f172a; }
            .footer-sign { width: 100%; margin-top: 45px; }
            @media print {
              .no-print { display: none; }
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 12px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 9.5pt; font-weight: 600; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <span>Dokumen Cetak Laporan Kependudukan Kelurahan Trajeng Pasuruan. Klik untuk Cetak/Simpan langsung sebagai File PDF.</span>
            <button onclick="window.print();" style="background: #10b981; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 9pt; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">Cetak/Simpan PDF</button>
          </div>

          <!-- KOP SURAT INDONESIA -->
          <table class="header-table">
            <tr>
              <td style="width: 15%; text-align: center;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_Kota_Pasuruan.svg" class="header-logo" />
              </td>
              <td style="width: 85%;" class="header-text">
                <div style="font-size: 13pt; font-weight: 700; letter-spacing: 0.5px; color: #1e293b;">PEMERINTAH KOTA PASURUAN</div>
                <div style="font-size: 11pt; font-weight: 700; color: #334155;">KECAMATAN PANGGUNGREJO</div>
                <div style="font-size: 15pt; font-weight: 800; letter-spacing: 1px; color: #0f172a; margin-top: 2px;">KELURAHAN TRAJENG</div>
                <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px; font-family: monospace;">Jl. Kolonel Sugiono No.87, Trajeng, Kecamatan Panggungrejo, Kota Pasuruan | Email: kelurahan.trajeng@pasuruankota.go.id</div>
              </td>
            </tr>
          </table>

          <div class="title">LAPORAN DIKLASIFIKASI &amp; STATISTIK PELAYANAN MANDIRI</div>
          
          <div class="meta-info">
            <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
              <tr>
                <td style="width: 30%; border: none; padding: 2px 0;"><strong>Tanggal Efektif Laporan</strong></td>
                <td style="width: 70%; border: none; padding: 2px 0;">: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="border: none; padding: 2px 0;"><strong>Operator Administrator</strong></td>
                <td style="border: none; padding: 2px 0;">: Staff Petugas SIAK Kelurahan Trajeng (SIM Penduduk)</td>
              </tr>
              <tr>
                <td style="border: none; padding: 2px 0;"><strong>Total Akun Warga Terdaftar</strong></td>
                <td style="border: none; padding: 2px 0;">: ${registeredUsers.length} Pemohon Aktif</td>
              </tr>
            </table>
          </div>

          <!-- SUMMARY CARDS METRICS -->
          <div class="summary-cards-grid">
            <div class="card" style="border-top: 3.5px solid #64748b;">
              <div class="card-title">TOTAL PENGAJUAN</div>
              <div class="card-val">${totalApps}</div>
            </div>
            <div class="card" style="border-top: 3.5px solid #3b82f6;">
              <div class="card-title" style="color: #3b82f6;">MENUNGGU</div>
              <div class="card-val" style="color: #1d4ed8;">${pendingApps}</div>
            </div>
            <div class="card" style="border-top: 3.5px solid #eab308;">
              <div class="card-title" style="color: #eab308;">DIPROSES</div>
              <div class="card-val" style="color: #a16207;">${processingApps}</div>
            </div>
            <div class="card" style="border-top: 3.5px solid #10b981;">
              <div class="card-title" style="color: #10b981;">SELESAI</div>
              <div class="card-val" style="color: #047857;">${completedApps}</div>
            </div>
            <div class="card" style="border-top: 3.5px solid #ef4444;">
              <div class="card-title" style="color: #ef4444;">DITOLAK</div>
              <div class="card-val" style="color: #b91c1c;">${rejectedApps}</div>
            </div>
          </div>

          <!-- DISTRIBUSI LAYANAN -->
          <h3 style="margin-top: 25px; font-size: 10.5pt; font-weight: 700; border-bottom: 1.5px solid #000; padding-bottom: 4px; text-transform: uppercase; color: #0f172a;">I. Volume Pemisahan Dokumen Berdasarkan Jenis Pelayanan</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70%;">Pilihan Layanan / Dokumen Persyaratan</th>
                <th style="width: 30%; text-align: center;">Jumlah Kumulatif Berkas</th>
              </tr>
            </thead>
            <tbody>
              ${srvStats}
            </tbody>
          </table>

          <div style="page-break-before: always; margin-top:20px;"></div>

          <!-- DAFTAR RINCIAN TRANSAKSI PENGAJUAN -->
          <h3 style="margin-top: 10px; font-size: 10.5pt; font-weight: 700; border-bottom: 1.5px solid #000; padding-bottom: 4px; text-transform: uppercase; color: #0f172a;">II. Daftar Rincian Seluruh Transaksi Pengajuan Masuk</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 15%;">No. Registrasi</th>
                <th style="width: 20%;">Nama Pengaju</th>
                <th style="width: 15%;">NIK Identitas</th>
                <th style="width: 25%;">Kategori Pelayanan</th>
                <th style="width: 10%; text-align: center;">Status</th>
                <th style="width: 10%; text-align: center;">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${appRows || `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 20px;">Belum ada antrean pengajuan surat kependudukan di sistem.</td></tr>`}
            </tbody>
          </table>
          </table>

          <script>
            // Automatically launch printable utility
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Dynamic Status Widgets moved to top */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="stats-widget-grid">
        <div className="bg-white border border-gray-150 rounded-2xl p-4.5 shadow-xs text-left">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Pengajuan</div>
          <div className="text-3xl font-bold font-sans text-gray-900 mt-2">{totalApps}</div>
          <div className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Seluruh Berkas</div>
        </div>
        <div className="bg-white border border-blue-150 rounded-2xl p-4.5 shadow-xs text-left">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">Menunggu Review</div>
          <div className="text-3xl font-bold font-sans text-blue-700 mt-2">{pendingApps}</div>
          <div className="text-[10px] text-blue-500 mt-1 uppercase font-semibold">Perlu Tindakan</div>
        </div>
        <div className="bg-white border border-amber-150 rounded-2xl p-4.5 shadow-xs text-left">
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none">Diproses</div>
          <div className="text-3xl font-bold font-sans text-amber-600 mt-2">{processingApps}</div>
          <div className="text-[10px] text-amber-500 mt-1 uppercase font-semibold">Tahap Verifikasi</div>
        </div>
        <div className="bg-white border border-emerald-150 rounded-2xl p-4.5 shadow-xs text-left">
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Disetujui / Selesai</div>
          <div className="text-3xl font-bold font-sans text-emerald-700 mt-2">{completedApps}</div>
          <div className="text-[10px] text-emerald-500 mt-1 uppercase font-semibold">Telah Dicetak</div>
        </div>
        <div className="bg-white border border-red-150 rounded-2xl p-4.5 shadow-xs text-left">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">Ditolak</div>
          <div className="text-3xl font-bold font-sans text-red-700 mt-2">{rejectedApps}</div>
          <div className="text-[10px] text-red-500 mt-1 uppercase font-semibold">Berkas Gugur</div>
        </div>
        <div className="bg-white border border-purple-150 rounded-2xl p-4.5 shadow-xs text-left cursor-pointer hover:bg-purple-50/35 hover:scale-[1.02] transform transition-all duration-200" onClick={() => setAdminTab('accounts')}>
          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest leading-none">Menunggu Verifikasi User</div>
          <div className="text-3xl font-bold font-sans text-purple-700 mt-2">{pendingUsersCount}</div>
          <div className="text-[10px] text-purple-500 mt-1 uppercase font-semibold">Antrean Akun</div>
        </div>
      </div>

      {/* Upper Navigation Tabs - Replacing old setup */}
      <div className="bg-white border border-gray-150 p-2 rounded-2xl flex flex-wrap gap-2 shadow-xs" id="admin-main-navigation-tabs">
        <button
          onClick={() => setAdminTab('accounts')}
          className={`flex-1 min-w-[150px] py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${adminTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          id="tab-btn-accounts"
        >
          <Users className="h-4.5 w-4.5" />
          <span>Manajemen Akun</span>
          {pendingUsersCount > 0 && (
            <span className={`ml-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full ${adminTab === 'accounts'
                ? 'bg-white text-emerald-700'
                : 'bg-red-500 text-white shadow-sm'
              }`}>
              {pendingUsersCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('applications')}
          className={`flex-1 min-w-[150px] py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${adminTab === 'applications'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          id="tab-btn-applications"
        >
          <FileCheck className="h-4.5 w-4.5" />
          <span>Verifikasi Berkas Pengajuan</span>
          {pendingApps > 0 && (
            <span className={`ml-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full animate-pulse ${adminTab === 'applications'
                ? 'bg-white text-emerald-700'
                : 'bg-blue-600 text-white shadow-sm'
              }`}>
              {pendingApps}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('reports')}
          className={`flex-1 min-w-[150px] py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${adminTab === 'reports'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          id="tab-btn-reports"
        >
          <BarChart3 className="h-4.5 w-4.5" />
          <span>Laporan &amp; Statistik</span>
        </button>
      </div>

      {/* VIEW 1: MANAJEMEN AKUN (PRIMARY / REPLACED Monitor Pengajuan Warga) */}
      {adminTab === 'accounts' && (
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 text-left animate-fade-in" id="admin-accounts-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 uppercase">Manajemen Akun Warga &amp; Petugas</h3>
              <p className="text-[11px] text-gray-400 font-mono uppercase tracking-wider font-semibold mt-0.5">Edit kewenangan peranan (Role) dan kelayakan status akun warga</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                Total Akun: {registeredUsers.length} Terdaftar
              </span>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md border-2 border-emerald-500 transition-all cursor-pointer ring-2 ring-emerald-100 flex items-center gap-1"
                id="btn-add-new-user-modal"
              >
                <span>➕</span>
                <span>TAMBAH USER BARU (REGISTRASI AKUN)</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari akun warga berdasarkan Nama, NIK, Username, atau Kewenangan..."
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-150">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-[#FAFBFB] text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Nama &amp; Username</th>
                  <th className="px-6 py-4 text-left">Identitas NIK</th>
                  <th className="px-6 py-4 text-left">Kewenangan / Role</th>
                  <th className="px-6 py-4 text-left">Status Akun</th>
                  <th className="px-6 py-4 text-left">Dokumen Unggahan</th>
                  <th className="px-6 py-4 text-right">Tindakan Cepat</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-150 font-medium text-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <ShieldAlert className="h-10 w-10 mx-auto opacity-30 mb-2" />
                      <p className="font-bold">Tidak ada akun warga yang ditemukan.</p>
                      <p className="text-[11px]">Silakan periksa kembali kata kunci pencarian Anda.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-800' : 'bg-emerald-50 text-emerald-800'
                            }`}>
                            {user.nama.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-gray-900 block font-bold">{user.nama}</strong>
                            <span className="text-[10px] text-gray-400 font-mono tracking-wide">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-mono text-[11px] tracking-wide">
                        {user.nik}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-120'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                          {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.status === 'ditolak'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-[#FEF3C7] text-[#92400E] border border-amber-300 animate-pulse'
                          }`}>
                          {user.status === 'aktif' ? 'Aktif / Terverifikasi' : user.status === 'ditolak' ? 'Ditolak / Dihapus' : 'Menunggu Verifikasi'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        {user.ktpPhotoUrl || user.pasfotoUrl ? (
                          <button
                            onClick={() => setSelectedDocsUser(user)}
                            className="bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 border border-gray-200 hover:border-emerald-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Lihat Foto ({user.ktpPhotoUrl ? 1 : 0} KTP, {user.pasfotoUrl ? 1 : 0} Foto)
                          </button>
                        ) : (
                          <span className="text-gray-405 font-mono text-[10px]">TIDAK ADA UNGGAHAN</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <form className="inline-flex flex-col sm:flex-row items-center gap-2.5 justify-end" onSubmit={(e) => e.preventDefault()}>
                          {/* Kewenangan / Role Dropdown */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 font-bold uppercase font-mono">Role:</span>
                            <select
                              value={user.role}
                              onChange={(e) => {
                                const newRole = e.target.value as 'admin' | 'user';
                                onUpdateUser({ ...user, role: newRole });
                              }}
                              className="bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                              <option value="user">User (Warga)</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          {/* Status Kelayakan Dropdown */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 font-bold uppercase font-mono">Status:</span>
                            <select
                              value={user.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as 'aktif' | 'tidak aktif' | 'ditolak';
                                onUpdateUser({ ...user, status: newStatus });
                              }}
                              className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${user.status === 'aktif'
                                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                                  : user.status === 'ditolak'
                                    ? 'bg-red-50 border-red-250 text-red-800 opacity-70 cursor-not-allowed'
                                    : 'bg-amber-50 border-amber-250 text-amber-800'
                                }`}
                            >
                              {user.status !== 'ditolak' && <option value="aktif">Aktif</option>}
                              {user.status !== 'ditolak' && <option value="tidak aktif">Tidak Aktif</option>}
                              <option value="ditolak" disabled>Ditolak</option>
                            </select>
                          </div>

                          {/* Delete Account Button */}
                          <div className="flex flex-col items-end gap-1 pl-0.5 mt-2 sm:mt-0 w-full sm:w-auto">
                            {confirmDeleteId === user.id ? (
                              <div className="flex flex-col gap-1.5 bg-red-50 border border-red-200 p-2 rounded-lg animate-fade-in w-full min-w-[200px]">
                                <span className="text-[9px] text-red-700 font-extrabold uppercase tracking-tight font-mono mb-1">Hapus/Tolak Akun</span>
                                <select
                                  value={rejectReasonText}
                                  onChange={(e) => setRejectReasonText(e.target.value)}
                                  className="w-full text-[10px] px-2 py-1.5 rounded border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-500 mb-1"
                                >
                                  <option value="">Pilih alasan penolakan...</option>
                                  <option value="Dokumen tidak jelas/buram">Dokumen tidak jelas/buram</option>
                                  <option value="NIK tidak cocok dengan KTP">NIK tidak cocok dengan KTP</option>
                                  <option value="Lainnya">Lainnya...</option>
                                </select>
                                {rejectReasonText === 'Lainnya' && (
                                  <input
                                    type="text"
                                    id={`rejectReasonInput-${user.id}`}
                                    placeholder="Tulis alasan spesifik..."
                                    className="w-full text-[10px] px-2 py-1.5 rounded border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-500 mb-1"
                                  />
                                )}
                                <div className="flex gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      let finalReason = rejectReasonText;
                                      if (rejectReasonText === 'Lainnya') {
                                        const inputEl = document.getElementById(`rejectReasonInput-${user.id}`) as HTMLInputElement;
                                        if (inputEl && inputEl.value.trim() !== '') {
                                          finalReason = inputEl.value.trim();
                                        } else {
                                          alert('Silakan tulis alasan penolakan secara spesifik.');
                                          return;
                                        }
                                      } else if (rejectReasonText === '') {
                                        alert('Silakan pilih alasan penolakan.');
                                        return;
                                      }
                                      onUpdateUser({ ...user, status: 'ditolak', rejectionReason: finalReason });
                                      setConfirmDeleteId(null);
                                      setRejectReasonText('');
                                    }}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded-md text-[9px] font-bold transition-colors cursor-pointer"
                                    title="Ubah status akun menjadi Ditolak"
                                  >
                                    Tolak Akun
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('PERINGATAN: Akun ini akan dihapus secara permanen dari database. Anda yakin?')) {
                                        if (onDeleteUser) onDeleteUser(user.id);
                                        setConfirmDeleteId(null);
                                      }
                                    }}
                                    className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded-md text-[9px] font-bold transition-colors cursor-pointer"
                                    title="Hapus akun permanen dari sistem"
                                  >
                                    Hapus Permanen
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmDeleteId(null);
                                      setRejectReasonText('');
                                    }}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-md text-[9px] font-bold transition-colors cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(user.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center animate-fade-in"
                                title="Hapus / Tolak akun"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: VERIFIKASI BERKAS PENGAJUAN (Applications Review workflow) */}
      {adminTab === 'applications' && (
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 text-left animate-fade-in" id="admin-apps-tab">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase">Tinjau Dokumen Pemohon</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserOption('manual');
                      setShowAddAppModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                    id="btn-add-new-app"
                  >
                    + Buat Pengajuan Baru
                  </button>
                </div>
                <p className="text-[10px] text-gray-450 uppercase tracking-wide font-mono mt-0.5">Uji keabsahan bukti isian permohonan digital</p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-1">
                {(['all', 'pending', 'diproses', 'selesai', 'ditolak'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${statusFilter === filter
                        ? 'bg-gray-950 text-white border-gray-950 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
                      }`}
                  >
                    {filter === 'all' ? 'Semua' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari NIK warga, nama warga, ID pengajuan, atau judul layanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Application records list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApps.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <ShieldAlert className="h-10 w-10 mx-auto opacity-40 mb-2" />
                  <p className="text-xs font-bold">Tidak ada pengajuan berkas yang cocok.</p>
                </div>
              ) : (
                filteredApps.map((app) => {
                  const service = DAFTAR_PELAYANAN.find(s => s.id === app.jenisPelayanan) || DAFTAR_PELAYANAN[0];
                  return (
                    <div
                      key={app.id}
                      className="bg-white border border-gray-150 hover:border-gray-250 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:bg-gray-50/20 shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="bg-emerald-50 text-[9px] text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">{service.title.replace('PERSYARATAN', 'PERSYARATAN').slice(0, 35)}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold">#{app.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 block">{app.nama}</h4>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span>NIK: {app.nik}</span>
                          <span>Tanggal: {app.tanggalPengajuan}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ${app.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'diproses' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              app.status === 'ditolak' ? 'bg-red-50 text-red-700' :
                                'bg-blue-100 text-blue-800'
                          }`}>
                          {app.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenReview(app)}
                            id={`review-btn-${app.id}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Tinjau Berkas
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: LAPORAN & STATISTIK (RECHARTS GRAPHS) */}
      {adminTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-gray-150 p-6 space-y-8 text-left animate-fade-in" id="admin-reports-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 uppercase">Analisis Laporan &amp; Statistik Pelayanan</h3>
              <p className="text-[11px] text-gray-400 font-mono uppercase tracking-wider font-semibold mt-0.5">Laporan sirkulasi penerbitan dokumen resmi berkala</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={reportTimeframe}
                onChange={(e) => setReportTimeframe(e.target.value as any)}
                className="bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-wider"
              >
                <option value="semua">Semua Waktu</option>
                <option value="hari_ini">Hari Ini</option>
                <option value="kemarin">Kemarin</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="tahun_ini">Tahun Ini</option>
              </select>
              <button
                onClick={handleDownloadPDFLaporan}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md active:scale-95 border border-emerald-600"
              >
                <FileText className="h-4.5 w-4.5" />
                Unduh PDF Laporan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">

            {/* Chart 1: Bar Chart of Service distribution */}
            <div className="col-span-12 lg:col-span-7 bg-white border border-gray-150 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Distribusi Volume Berkas per Jenis Layanan</h4>
                <p className="text-[10px] text-gray-400 font-medium">BANYAK BERKAS YANG DIFAKTURKAN OLEH WARGA SECARA MANDIRI</p>
              </div>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularServicesData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="slug" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip wrapperStyle={{ fontFamily: 'Inter, sans-serif', fontSize: '11px' }} />
                    <Bar dataKey="jumlah" fill="#059669" radius={[4, 4, 0, 0]}>
                      {popularServicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#059669' : '#14b8a6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Pie Chart of Statuses */}
            <div className="col-span-12 lg:col-span-5 bg-white border border-gray-150 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Prosentase Kelulusan Status Berkas</h4>
                <p className="text-[10px] text-gray-400 font-medium">DISTRIBUSI STATUS SURAT TTE DAN REVIEW DIGITAL</p>
              </div>
              <div className="h-64 w-full flex flex-col justify-between text-xs">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Berkas`, 'Jumlah']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold border-t border-gray-100 pt-3">
                  {statusChartData.map((st) => (
                    <div key={st.name} className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-md shrink-0" style={{ backgroundColor: st.color }} />
                      <span className="text-gray-500 whitespace-nowrap">{st.name}: {st.value} Berkas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* MODAL: Review Application Berkas Detail */}
      {activeReviewApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans" id="admin-review-modal">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">

            <div className="bg-gray-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-left">Tinjau &amp; Sahkan Dokumen Berkas</h3>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider text-left">No. Pengajuan: {activeReviewApp.id}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveReviewApp(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-left leading-normal">

              {/* Bio */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">Biodata Lengkap Pemohon</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-800">
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Nama Lengkap</span>
                    <span className="block mt-0.5">{activeReviewApp.nama}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">NIK Kependudukan</span>
                    <span className="block font-mono mt-0.5">{activeReviewApp.nik}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Layanan Keterangan Surat</span>
                    <span className="block mt-0.5 text-emerald-700">
                      {DAFTAR_PELAYANAN.find(s => s.id === activeReviewApp.jenisPelayanan)?.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statement details */}
              {activeReviewApp.pernyataanData && (
                <div className="space-y-2 bg-amber-50/20 border border-amber-200/50 rounded-xl p-4 text-xs">
                  <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-widest pb-1 border-b border-amber-200/30">Butir Pernyataan Warga (Meterai 10.000)</h4>
                  <div className="space-y-2 text-gray-700 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-semibold">
                    {activeReviewApp.pernyataanData.judulPernyataan && <p className="col-span-2"><strong>Judul:</strong> {activeReviewApp.pernyataanData.judulPernyataan}</p>}
                    {activeReviewApp.pernyataanData.detailPernyataan && <p className="col-span-2"><strong>Rincian Surat:</strong> {activeReviewApp.pernyataanData.detailPernyataan}</p>}
                    {activeReviewApp.pernyataanData.barangHilang && <p><strong>Barang Hilang:</strong> {activeReviewApp.pernyataanData.barangHilang}</p>}
                    {activeReviewApp.pernyataanData.tempatKehilangan && <p><strong>Tempat Kejadian:</strong> {activeReviewApp.pernyataanData.tempatKehilangan}</p>}
                    {activeReviewApp.pernyataanData.tanggalKehilangan && <p><strong>Tanggal Kejadian:</strong> {activeReviewApp.pernyataanData.tanggalKehilangan}</p>}
                    {activeReviewApp.pernyataanData.namaSaksi1 && <p><strong>Saksi 1:</strong> {activeReviewApp.pernyataanData.namaSaksi1}</p>}
                    {activeReviewApp.pernyataanData.namaSaksi2 && <p><strong>Saksi 2:</strong> {activeReviewApp.pernyataanData.namaSaksi2}</p>}
                  </div>
                </div>
              )}

              {/* Uploaded requirements document list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100 font-mono">
                  Daftar Dokumen Persyaratan Unggahan Pemohon
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    const srv = DAFTAR_PELAYANAN.find(s => s.id === activeReviewApp.jenisPelayanan);
                    const requirements = srv ? srv.persyaratan : ['Pengantar RT/RW', 'Fotopi KTP & KK'];
                    return requirements.map((req, idx) => {
                      // Check if uploadedFiles dictionary exists
                      const hasUploadedFilesDict = !!activeReviewApp.uploadedFiles;
                      // Check if files map has the specific file
                      const fileInDict = activeReviewApp.uploadedFiles && activeReviewApp.uploadedFiles[req];

                      let isUploaded = false;
                      let fileName = '';
                      let statusBadge = null;
                      let isButtonDisabled = false;

                      if (hasUploadedFilesDict) {
                        if (fileInDict) {
                          isUploaded = true;
                          fileName = fileInDict;
                          statusBadge = (
                            <span className="bg-emerald-55 text-emerald-800 border border-emerald-150 px-1.5 py-0.5 rounded text-[8px] font-bold">
                              TERUNGGAH
                            </span>
                          );
                        } else {
                          isUploaded = false;
                          fileName = 'Belum diunggah / Berkas tidak tersedia';
                          statusBadge = (
                            <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                              BELUM DIUNGGAH
                            </span>
                          );
                          isButtonDisabled = true;
                        }
                      } else {
                        // Backwards compatibility fallback for legacy applications that have no uploadedFiles dict at all
                        isUploaded = true;
                        fileName = `${req.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_digital.pdf`;
                        statusBadge = (
                          <span className="bg-sky-50 text-sky-850 border border-sky-200 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">
                            ARSIP DIGITAL
                          </span>
                        );
                      }

                      return (
                        <div key={idx} className="bg-gray-55 border border-gray-200 rounded-xl p-3 flex flex-col justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-mono font-bold text-gray-400 block tracking-wider truncate mb-1">DOKUMEN #{idx + 1}</span>
                            <strong className="text-gray-900 block text-[11.5px] truncate" title={req}>{req}</strong>
                            <span className={`text-[10px] ${isUploaded ? 'text-emerald-700 font-semibold' : 'text-gray-400 font-medium italic'} block truncate mt-1`}>
                              📄 {fileName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {statusBadge}
                            <button
                              type="button"
                              disabled={isButtonDisabled}
                              onClick={() => {
                                setPreviewingDoc({
                                  reqName: req,
                                  fileName: fileName,
                                  app: activeReviewApp
                                });
                              }}
                              className={`text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer transition ml-auto border ${isButtonDisabled
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200'
                                }`}
                            >
                              {isButtonDisabled ? 'Kosong' : 'Buka File'}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* IDENTITAS PENGUNGGAH */}
                {(() => {
                  const appUser = registeredUsers.find(u => u.nik === activeReviewApp.nik);
                  if (!appUser) return null;
                  return (
                    <div className="space-y-3 pt-3 mt-3 border-t border-gray-150">
                      <h4 className="font-extrabold text-[10px] text-gray-700 uppercase tracking-widest flex items-center gap-1">
                        <span>👤</span> Dokumen Identitas Pendaftar
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gray-55 border border-gray-200 rounded-xl p-3 flex flex-col justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-mono font-bold text-gray-400 block tracking-wider truncate mb-1">DOKUMEN DASAR</span>
                            <strong className="text-gray-900 block text-[11.5px] truncate">KTP Pemohon Asli</strong>
                            <span className={`text-[10px] ${appUser.ktpPhotoUrl ? 'text-emerald-700 font-semibold' : 'text-gray-400 font-medium italic'} block truncate mt-1`}>
                              📄 {appUser.ktpPhotoUrl ? 'ktp_pemohon.jpg' : 'Belum diunggah'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {appUser.ktpPhotoUrl ? (
                              <>
                                <span className="bg-emerald-55 text-emerald-800 border border-emerald-150 px-1.5 py-0.5 rounded text-[8px] font-bold">TERUNGGAH</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isPdf = typeof appUser.ktpPhotoUrl === 'string' && appUser.ktpPhotoUrl.includes('application/pdf');
                                    setPreviewingDoc({
                                      reqName: 'KTP Asli',
                                      fileName: isPdf ? 'ktp_pemohon.pdf' : 'ktp_pemohon.jpg',
                                      app: {
                                        ...activeReviewApp,
                                        fileContents: {
                                          'KTP Asli': appUser.ktpPhotoUrl as string
                                        }
                                      }
                                    });
                                  }}
                                  className="text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer transition ml-auto border text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200"
                                >
                                  Buka File
                                </button>
                              </>
                            ) : (
                              <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">BELUM DIUNGGAH</span>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-55 border border-gray-200 rounded-xl p-3 flex flex-col justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-mono font-bold text-gray-400 block tracking-wider truncate mb-1">DOKUMEN DASAR</span>
                            <strong className="text-gray-900 block text-[11.5px] truncate">Pasfoto Terbaru</strong>
                            <span className={`text-[10px] ${appUser.pasfotoUrl ? 'text-emerald-700 font-semibold' : 'text-gray-400 font-medium italic'} block truncate mt-1`}>
                              📄 {appUser.pasfotoUrl ? (appUser.pasfotoUrl.includes('application/pdf') ? 'pasfoto_pemohon.pdf' : 'pasfoto_pemohon.jpg') : 'Belum diunggah'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {appUser.pasfotoUrl ? (
                              <>
                                <span className="bg-emerald-55 text-emerald-800 border border-emerald-150 px-1.5 py-0.5 rounded text-[8px] font-bold">TERUNGGAH</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isPdf = typeof appUser.pasfotoUrl === 'string' && appUser.pasfotoUrl.includes('application/pdf');
                                    setPreviewingDoc({
                                      reqName: 'Pasfoto Terbaru',
                                      fileName: isPdf ? 'pasfoto_pemohon.pdf' : 'pasfoto_pemohon.jpg',
                                      app: {
                                        ...activeReviewApp,
                                        fileContents: {
                                          'Pasfoto Terbaru': appUser.pasfotoUrl as string
                                        }
                                      }
                                    });
                                  }}
                                  className="text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer transition ml-auto border text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200"
                                >
                                  Buka File
                                </button>
                              </>
                            ) : (
                              <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">BELUM DIUNGGAH</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Quick Preset Templates for Comments */}
              <div className="space-y-3 pt-2 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Pilihan Cepat Alasan Penolakan</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCommentInput('Maaf, pengajuan ditolak karena dokumen persyaratan yang diupload Kurang Lengkap. Harap periksa kembali berkas-berkas lampiran Anda dan ajukan permohonan baru.')}
                      className="bg-white hover:bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                    >
                      🚫 Kurang Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentInput('Maaf, dokumen persyaratan tidak jelas, buram, atau tidak dapat terbaca secara administratif. Silakan unggah foto dokumen yang lebih tajam dan jelas.')}
                      className="bg-white hover:bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                    >
                      🔍 Dokumen Tidak Jelas
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentInput('Maaf, pengisian identitas NIK kependudukan atau biodata formulir tidak sesuai dengan kesahihan database Kelurahan Trajeng. Silakan periksa kembali.')}
                      className="bg-white hover:bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                    >
                      👤 Identitas Salah
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment text block */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100 font-mono">Keputusan TTE &amp; Memo Dinas</h4>
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-gray-50 text-xs font-semibold rounded-xl border border-gray-250 p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-850"
                  placeholder="Isi memo petunjuk pengambilan atau alasan ditolak..."
                />
              </div>

            </div>

            <div className="bg-gray-50 p-4.5 border-t border-gray-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setCommentInput('')}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 transition"
              >
                Reset Memo
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveReview('ditolak')}
                  className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-4 w-4" /> Tolak Berkas
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReview('diproses')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="h-4 w-4" /> Proses
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReview('selesai')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Sahkan &amp; Selesai
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Previewing Document of active Review Application */}
      {previewingDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60] font-sans animate-fade-in" id="document-file-preview-modal">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-left">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide">Pratinjau Dokumen Persyaratan</h3>
                  <p className="text-[10px] text-gray-300 font-mono truncate max-w-[280px]">{previewingDoc.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingDoc(null)}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 bg-gray-100 overflow-y-auto flex-1 flex flex-col items-center">
              {/* Actual Document Sheet simulation */}
              <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-full max-w-md text-xs leading-relaxed text-gray-850 relative overflow-hidden text-left" id="paper-doc-preview">
                {/* Accent Watermark */}
                <div className="absolute inset-0 flex items-center justify-center rotate-[30deg] opacity-[0.03] select-none pointer-events-none">
                  <div className="text-gray-900 border-[15px] border-double border-gray-900 p-8 rounded-full text-5xl font-black text-center">
                    TRAJENG
                  </div>
                </div>

                {/* Switch Document Style */}
                {(() => {
                  const contentData = previewingDoc.app.fileContents?.[previewingDoc.reqName];
                  if (contentData) {
                    const fileNameLower = previewingDoc.fileName.toLowerCase();
                    const isImg = contentData.startsWith('data:image/') ||
                      fileNameLower.endsWith('.jpg') ||
                      fileNameLower.endsWith('.jpeg') ||
                      fileNameLower.endsWith('.png') ||
                      fileNameLower.endsWith('.webp') ||
                      fileNameLower.endsWith('.gif') ||
                      fileNameLower.endsWith('.bmp');
                    const isPdfCur = contentData.includes('application/pdf') ||
                      fileNameLower.endsWith('.pdf');
                    const isWord = fileNameLower.endsWith('.doc') ||
                      fileNameLower.endsWith('.docx') ||
                      contentData.includes('application/msword') ||
                      contentData.includes('application/vnd.openxml');

                    if (isImg) {
                      return (
                        <div className="space-y-3.5 w-full">
                          <div className="border-b border-gray-300 pb-2 flex items-center justify-between">
                            <h4 className="font-extrabold text-gray-950 text-[10px] uppercase">BERKAS UNGGAHAN WARGA</h4>
                            <span className="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded-sm">GAMBAR</span>
                          </div>
                          <div className="flex justify-center bg-gray-50 border border-gray-150 p-2 rounded-xl">
                            <img
                              src={contentData}
                              alt={previewingDoc.fileName}
                              className="w-full h-auto max-h-[50vh] object-contain rounded-lg shadow-sm"
                            />
                          </div>
                        </div>
                      );
                    } else if (isPdfCur) {
                      return (
                        <div className="space-y-3.5 w-full">
                          <div className="border-b border-gray-300 pb-2 flex items-center justify-between">
                            <h4 className="font-extrabold text-gray-950 text-[10px] uppercase font-sans">BERKAS UNGGAHAN WARGA</h4>
                            <span className="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded-sm">
                              PDF DOKUMEN
                            </span>
                          </div>
                          <iframe
                            src={contentData}
                            title={previewingDoc.fileName}
                            className="w-full h-[50vh] min-h-[400px] rounded-xl border border-gray-255 shadow-inner bg-white"
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-3 text-center py-4 w-full">
                          <div className="text-4xl text-gray-400 mx-auto w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full font-sans">📄</div>
                          <h4 className="font-sans font-bold text-gray-950 text-[10px] truncate max-w-full">{previewingDoc.fileName}</h4>
                          <p className="text-[10px] text-gray-500 font-sans max-w-sm mx-auto">
                            Format dokumen Word (.doc/.docx) dan format lainnya tidak didukung untuk ditampilkan (pratinjau langsung) di dalam peramban. Sistem menahan unduhan otomatis demi kenyamanan Anda.
                          </p>
                          <a
                            href={contentData}
                            download={previewingDoc.fileName}
                            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-emerald-750 transition justify-center font-sans mt-2"
                          >
                            Unduh Dokumen Secara Manual
                          </a>
                        </div>
                      );
                    }
                  }

                  const reqLower = previewingDoc.reqName.toLowerCase();

                  if (reqLower.includes('ktp') || reqLower.includes('kk')) {
                    // Render E-KTP style
                    return (
                      <div className="space-y-4">
                        <div className="border-b border-gray-300 pb-2 flex items-center justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-gray-950 text-[10px] tracking-wide uppercase">PROVINSI JAWA TIMUR</h4>
                            <h5 className="font-extrabold text-gray-900 text-[10px] tracking-tight uppercase">KOTA PASURUAN</h5>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 border border-emerald-100 rounded">E-KTP DIGITAL</span>
                        </div>

                        <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-gray-800">
                          <div className="col-span-12 font-mono font-bold text-xs text-gray-950 tracking-wider">
                            NIK : {previewingDoc.app.nik || '3575021208940003'}
                          </div>

                          <div className="col-span-8 space-y-1.5">
                            <div>
                              <span className="text-gray-400 font-medium block text-[8px] uppercase font-mono">Nama</span>
                              <span className="block font-bold">{previewingDoc.app.nama}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-medium block text-[8px] uppercase font-mono">Tempat/Tgl Lahir</span>
                              <span className="block font-bold">PASURUAN, 23-04-1995</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-medium block text-[8px] uppercase font-mono">Alamat</span>
                              <span className="block font-bold">JL. HANGTUAH NO. 25, RT.03/RW.02</span>
                            </div>
                            <div className="pl-3 grid grid-cols-2 gap-1 text-[9px] text-gray-700">
                              <div><span className="text-gray-400 font-medium text-[8px] font-mono">Kecamatan</span> GADINGREJO</div>
                              <div><span className="text-gray-400 font-medium text-[8px] font-mono">Kelurahan</span> TRAJENG</div>
                            </div>
                            <div>
                              <span className="text-gray-400 font-medium block text-[8px] uppercase font-mono">Status Perkawinan</span>
                              <span className="block font-bold">{previewingDoc.app.jenisPelayanan === 'belum_menikah' ? 'BELUM KAWIN' : 'KAWIN'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-medium block text-[8px] uppercase font-mono">Kewarganegaraan</span>
                              <span className="block font-bold">WNI</span>
                            </div>
                          </div>

                          <div className="col-span-4 flex flex-col items-center justify-between border border-dashed border-gray-250 bg-sky-50/50 p-2 rounded-xl h-36">
                            <span className="text-[7px] text-sky-800 uppercase font-bold tracking-wider font-mono">PASFOTO</span>
                            <div className="h-16 w-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl border shadow-inner">
                              👤
                            </div>
                            <span className="text-[6px] text-gray-400 text-center uppercase font-mono leading-tight">Dukcapil Pasuruan</span>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (reqLower.includes('pengantar') || reqLower.includes('rt/rw')) {
                    // Render Surat Pengantar RT/RW style
                    return (
                      <div className="space-y-4 font-serif">
                        <div className="text-center space-y-0.5 border-b-2 border-gray-900 pb-3">
                          <h4 className="font-bold text-[11px] uppercase tracking-wide">PENGURUS RUKUN TETANGGA 03 / RUKUN WARGA 02</h4>
                          <h5 className="font-semibold text-[10px] uppercase">KELURAHAN TRAJENG - KOTA PASURUAN</h5>
                          <p className="text-[8px] font-sans text-gray-500 font-normal">Sekretariat: Jl. Hangtuah Gang II No. 14 Pasuruan</p>
                        </div>

                        <div className="text-center pt-2">
                          <h5 className="font-bold text-[10.5px] uppercase tracking-wide leading-none underline">SURAT PENGANTAR RT/RW</h5>
                          <span className="text-[8.5px] font-mono text-gray-500 block mt-0.5">Nomor: 145/RT.03/RW.02/VI/2026</span>
                        </div>

                        <div className="space-y-2 text-[10px] leading-relaxed">
                          <p className="indent-6">
                            Yang bertanda tangan di bawah ini Ketua Rukun Tetangga (RT) 03 Rukun Warga (RW) 02 Kelurahan Trajeng Kecamatan Panggungrejo Kota Pasuruan, dengan ini menerangkan bahwa:
                          </p>

                          <table className="w-full text-[10px] font-semibold my-2 ml-4">
                            <tbody>
                              <tr>
                                <td className="w-1/3 py-0.5 text-gray-550 font-sans">Nama Lengkap</td>
                                <td className="w-2/3 py-0.5 text-gray-900 font-sans">: {previewingDoc.app.nama}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 text-gray-550 font-sans">NIK Kependudukan</td>
                                <td className="py-0.5 font-mono text-gray-900">: {previewingDoc.app.nik}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 text-gray-550 font-sans">Alamat Rumah</td>
                                <td className="py-0.5 text-gray-900 font-sans">: RT.03 / RW.02, Kelurahan Trajeng</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 text-gray-550 font-sans font-medium">Kategori Permohonan</td>
                                <td className="py-0.5 text-emerald-800 font-sans font-bold">: {DAFTAR_PELAYANAN.find(s => s.id === previewingDoc.app.jenisPelayanan)?.title}</td>
                              </tr>
                            </tbody>
                          </table>

                          <p className="indent-6 text-justify">
                            Adalah benar-benar warga domisili rukun warga kami, berkelakuan baik, dan sejauh pengetahuan kami permohonan bersangkutan di atas adalah sah dan benar adanya. Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 text-[9px] pt-4 font-sans text-center">
                          <div>
                            <span className="block text-gray-400">Mengetahui,</span>
                            <strong className="block text-gray-700 uppercase mt-0.5">Ketua RW 02</strong>
                            <div className="h-10"></div>
                            <span className="font-bold underline uppercase">( SUHARMANTO )</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Pasuruan, {previewingDoc.app.tanggalPengajuan}</span>
                            <strong className="block text-gray-700 uppercase mt-0.5">Ketua RT 03</strong>
                            <div className="h-8 flex items-center justify-center">
                              <span className="border border-emerald-300 text-emerald-800 bg-emerald-50 text-[7px] font-bold tracking-wider uppercase px-2 py-0.5 rounded transform rotate-3">TERVALIDASI RT</span>
                            </div>
                            <span className="font-bold underline uppercase">( M. JEFRI )</span>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (reqLower.includes('pernyataan') || reqLower.includes('materai')) {
                    // Render Surat Pernyataan Bermaterai style
                    return (
                      <div className="space-y-4">
                        <div className="text-center space-y-1 pb-2 border-b border-gray-150">
                          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-900 underline">SURAT PERNYATAAN / REKONSILIASI MANDIRI</h4>
                          <span className="text-[8px] font-mono text-gray-400 block uppercase">KEABSAHAN DATA KEPENDUDUKAN KELURAHAN TRAJENG</span>
                        </div>

                        <div className="space-y-3 text-[10px] leading-relaxed">
                          <p>Saya yang bertandatangan di bawah ini selaku warga pemohon:</p>

                          <div className="bg-gray-55 border border-gray-150 rounded-xl p-3 space-y-1.5 font-sans">
                            <div><span className="text-gray-400 font-medium text-[8px] uppercase font-mono">NAMA LENGKAP:</span> <strong className="text-gray-900 text-[10.5px] block">{previewingDoc.app.nama}</strong></div>
                            <div><span className="text-gray-400 font-medium text-[8px] uppercase font-mono">NIK IDENTITAS:</span> <strong className="text-gray-955 text-[10.5px] font-mono block">{previewingDoc.app.nik}</strong></div>
                            {previewingDoc.app.pernyataanData?.barangHilang && (
                              <div><span className="text-gray-400 font-medium text-[8px] uppercase font-mono">OBYEK KEHILANGAN:</span> <medium className="text-red-700 font-bold block">{previewingDoc.app.pernyataanData.barangHilang}</medium></div>
                            )}
                          </div>

                          <div className="italic text-gray-750 border-l-3 border-emerald-500 pl-3 leading-relaxed text-[9.5px] space-y-1">
                            {previewingDoc.app.pernyataanData?.detailPernyataan ? (
                              <p className="text-justify font-sans">"{previewingDoc.app.pernyataanData.detailPernyataan}"</p>
                            ) : (
                              <p className="text-justify font-sans">"Menyatakan dengan sesungguhnya bahwa seluruh data formulir, kelengkapan berkas fisik, dan lampiran digital yang saya sertakan pada sistem SIM Kependudukan Trajeng ini adalah sah, benar, dan dapat dipertanggungjawabkan di hadapan hukum."</p>
                            )}
                          </div>

                          <p className="text-justify text-[9.5px]">
                            Apabila di kemudian hari ditemukan kepalsuan atau manipulasi, saya bersedia dituntut sesuai hukum pidana yang berlaku di Negara Indonesia.
                          </p>
                        </div>

                        <div className="pt-4 flex items-center justify-between text-[9px] text-gray-700">
                          <div className="border-[2px] border-emerald-600/30 text-emerald-800 bg-emerald-50/50 p-2 rounded-lg text-center transform -rotate-6 w-24">
                            <span className="block text-[6.5px] uppercase font-bold text-emerald-550 leading-tight font-mono">METERAI</span>
                            <span className="block text-[11px] font-black my-1 text-emerald-700">10.000</span>
                            <span className="block text-[6px] tracking-tight uppercase font-mono">DIGITAL TRAJENG</span>
                          </div>

                          <div className="text-center font-sans">
                            <span className="block text-gray-450 text-[8px]">Pasuruan, {previewingDoc.app.tanggalPengajuan}</span>
                            <span className="block text-gray-500 font-semibold text-[8.5px]">Pemohon,</span>
                            <div className="h-6 flex items-center justify-center my-0.5">
                              <span className="font-mono text-[9px] text-gray-450 italic underline transform -rotate-1">Firma: {previewingDoc.app.nama.split(' ')[0]}</span>
                            </div>
                            <strong className="block text-gray-900 border-t border-gray-150 pt-1 mt-1 uppercase text-[9.5px]">{previewingDoc.app.nama}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // General other files preview
                    return (
                      <div className="space-y-4">
                        <div className="text-center space-y-1 pb-2 border-b border-gray-150">
                          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-900">{previewingDoc.reqName}</h4>
                          <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-150 rounded inline-block uppercase font-bold">DOKUMEN ABSAH KEPENDUDUKAN</span>
                        </div>

                        <div className="space-y-4 font-mono text-[9.5px] text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-150">
                          <div>
                            <strong className="block text-gray-900 uppercase text-[9.5px] font-sans font-bold">Pernyataan Pemeriksaan Sistem</strong>
                            <p className="mt-1 font-sans text-[11px] leading-relaxed text-gray-600">Dokumen ini merupakan file digital legal penunjang permohonan administrasi sipil di database Kelurahan Trajeng.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[8.5px] border-t border-gray-150 pt-3 font-semibold">
                            <div>
                              <span className="text-gray-400 block uppercase">NAMA PEMOHON</span>
                              <span className="text-gray-900 block mt-0.5">{previewingDoc.app.nama}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block uppercase">NIK PEMOHON</span>
                              <span className="text-gray-900 block mt-0.5">{previewingDoc.app.nik}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block uppercase font-mono">WAKTU UNGGAL</span>
                              <span className="text-gray-900 block mt-0.5">{previewingDoc.app.tanggalPengajuan}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block uppercase">STATUS</span>
                              <span className="text-emerald-700 block mt-0.5 font-bold">✔ DITERIMA SISTEM</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center pt-2">
                          <span className="inline-flex items-center gap-1.5 text-[8.5px] font-bold text-gray-500 bg-gray-100 border px-3 py-1 rounded-full uppercase tracking-wider">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Berkas Lolos Enkripsi TTE RI
                          </span>
                        </div>
                      </div>
                    );
                  }
                })()}

              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-gray-400 font-mono">MD5: F3A18CE4D28864748B</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`SUKSES:\n\nBerkas "${previewingDoc.fileName}" berhasil disinkronkan ke local directory penyimpanan SIAK Kelurahan Trajeng.`);
                  }}
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold px-4 py-2 cursor-pointer transition-all"
                >
                  Download Asli
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewingDoc(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-5 py-2 cursor-pointer transition-all shadow-xs"
                >
                  Selesai Tinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View UserUploaded Proof documents */}
      {selectedDocsUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans" id="user-docs-modal">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
            <div className="bg-gray-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-left">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm">Dokumen Unggahan Berkas Warga</h3>
                  <p className="text-[10px] text-gray-400 tracking-wider">Pemohon: {selectedDocsUser.nama} (NIK: {selectedDocsUser.nik})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocsUser(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* KTP Picture */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">Foto KTP Elektronik</h4>
                  <div className="border border-gray-150 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center min-h-[180px] overflow-hidden">
                    {selectedDocsUser.ktpPhotoUrl ? (
                      selectedDocsUser.ktpPhotoUrl.startsWith('data:application/pdf') ? (
                        <div className="text-center space-y-2">
                          <span className="block text-2xl">📄</span>
                          <span className="text-[10px] font-bold text-red-600 block">DOKUMEN KTP (PDF FORMAT)</span>
                          <a href={selectedDocsUser.ktpPhotoUrl} download={`ktp_${selectedDocsUser.username}.pdf`} className="text-[10px] font-bold text-emerald-600 underline">Unduh Berkas PDF</a>
                        </div>
                      ) : (
                        <img
                          src={selectedDocsUser.ktpPhotoUrl}
                          alt="Foto KTP Warga"
                          referrerPolicy="no-referrer"
                          className="max-h-40 w-auto object-contain rounded shadow-xs"
                        />
                      )
                    ) : (
                      <span className="text-xs text-gray-400 font-mono">Belum Mengunggah Foto KTP</span>
                    )}
                  </div>
                </div>

                {/* Pasfoto Picture */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">Pasfoto Terbaru (3x4 / 4x6)</h4>
                  <div className="border border-gray-150 bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center min-h-[180px] overflow-hidden">
                    {selectedDocsUser.pasfotoUrl ? (
                      <img
                        src={selectedDocsUser.pasfotoUrl}
                        alt="Pasfoto Warga"
                        referrerPolicy="no-referrer"
                        className="max-h-40 w-32 object-cover rounded shadow-xs border border-gray-200"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 font-mono">Belum Mengunggah Pasfoto</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 text-right">
              <button
                onClick={() => setSelectedDocsUser(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-2.5 px-6 shadow-xs cursor-pointer transition-all"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah User Baru */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60] font-sans animate-fade-in" id="add-user-modal">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide">Tambah Akun Baru</h3>
                  <p className="text-[10px] text-gray-300">Registrasikan administrator atau pemohon baru</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const target = e.currentTarget;
              const nama = (target.elements.namedItem('fullName') as HTMLInputElement).value.trim();
              const nik = (target.elements.namedItem('nik') as HTMLInputElement).value.trim();
              const username = (target.elements.namedItem('userName') as HTMLInputElement).value.trim().toLowerCase();
              const password = (target.elements.namedItem('passWord') as HTMLInputElement).value;
              const role = (target.elements.namedItem('roleValue') as HTMLSelectElement).value as 'admin' | 'user';
              const status = (target.elements.namedItem('statusValue') as HTMLSelectElement).value as 'aktif' | 'tidak aktif';

              if (!nama || !nik || !username || !password) {
                alert('Semua bidang wajib diisi!');
                return;
              }
              if (nik.length !== 16 || isNaN(Number(nik))) {
                alert('NIK harus terdiri dari tepat 16 digit angka!');
                return;
              }
              if (registeredUsers.some(u => u.username === username)) {
                alert('Username sudah digunakan! Cari nama lain.');
                return;
              }

              const newAcc: UserAccount = {
                id: 'usr_' + Date.now().toString(36),
                nama,
                nik,
                username,
                password,
                role,
                status,
                ktpPhotoUrl: newUserKtpUrl,
                pasfotoUrl: newUserPasfotoUrl
              };

              if (onRegisterUser) {
                onRegisterUser(newAcc);
              }
              setShowAddUserModal(false);
              setNewUserKtpUrl('');
              setNewUserKtpName('');
              setNewUserPasfotoUrl('');
              setNewUserPasfotoName('');
            }} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase text-left">Nama Lengkap</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Ketik nama lengkap sesuai dokumen identitas"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700 uppercase font-mono text-left">Nomor Induk Kependudukan (NIK)</label>
                <input
                  name="nik"
                  type="text"
                  maxLength={16}
                  required
                  placeholder="Masukkan 16 digit angka NIK"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase">Username</label>
                  <input
                    name="userName"
                    type="text"
                    required
                    placeholder="Contoh nama pengguna"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase">Sandi</label>
                  <input
                    name="passWord"
                    type="password"
                    required
                    placeholder="Masukkan sandi rahasia"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* STATUS KEWENANGAN DAN STATUS AKUN */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase">Kewenangan / Peran (Role)</label>
                  <select
                    name="roleValue"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-0 focus:border-emerald-500 font-bold text-gray-700 text-xs"
                  >
                    <option value="user">Warga Pemohon (Role: user)</option>
                    <option value="admin">Administrator Staff (Role: admin)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700 uppercase">Status Kelayakan Akun</label>
                  <select
                    name="statusValue"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-0 focus:border-emerald-500 font-bold text-gray-700 text-xs"
                  >
                    <option value="aktif">Aktif (Dapat Mengajukan Berkas)</option>
                    <option value="tidak aktif">Non-Aktif / Ditangguhkan</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD BERKAS IDENTITAS KTP & PASFOTO BESERTA FORMATNYA */}
              <div className="space-y-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-left">
                <h4 className="font-extrabold text-[10px] text-indigo-950 uppercase tracking-widest flex items-center gap-1">
                  <span>📂</span> Lampiran Identitas Penduduk Terkait
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* FOTO KTP */}
                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-gray-200 flex flex-col justify-between">
                    <div>
                      <span className="block font-sans font-bold text-gray-800 text-[10px] uppercase">Foto KTP Asli</span>
                      <span className="text-[8px] text-gray-400 block mt-0.5">Format: JPG, JPEG, PNG (Maks. 2MB)</span>
                    </div>
                    {newUserKtpUrl && (
                      <div className="flex flex-col items-center justify-center p-1 border border-dashed border-gray-200 rounded bg-gray-50 mb-2 mt-1">
                        <img src={newUserKtpUrl} className="h-12 w-auto object-contain rounded" />
                        <span className="text-[8px] text-gray-500 truncate w-full text-center mt-1">{newUserKtpName}</span>
                      </div>
                    )}
                    <div className="mt-auto">
                      <label className="inline-block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] px-2 py-1.5 rounded-md cursor-pointer transition-all border border-indigo-200 text-center w-full">
                        {newUserKtpUrl ? '📁 Ganti Berkas KTP' : '📁 Pilih Berkas KTP'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewUserKtpName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => setNewUserKtpUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* PASFOTO */}
                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-gray-200 flex flex-col justify-between">
                    <div>
                      <span className="block font-sans font-bold text-gray-800 text-[10px] uppercase">Pasfoto Pribadi</span>
                      <span className="text-[8px] text-gray-400 block mt-0.5">Format: JPG, JPEG, PNG (Maks. 2MB)</span>
                    </div>
                    {newUserPasfotoUrl && (
                      <div className="flex flex-col items-center justify-center p-1 border border-dashed border-gray-200 rounded bg-gray-50 mb-2 mt-1">
                        <img src={newUserPasfotoUrl} className="h-12 w-auto object-contain rounded" />
                        <span className="text-[8px] text-gray-500 truncate w-full text-center mt-1">{newUserPasfotoName}</span>
                      </div>
                    )}
                    <div className="mt-auto">
                      <label className="inline-block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] px-2 py-1.5 rounded-md cursor-pointer transition-all border border-indigo-200 text-center w-full">
                        {newUserPasfotoUrl ? '📷 Ganti Pasfoto' : '📷 Pilih Pasfoto 3x4'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewUserPasfotoName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => setNewUserPasfotoUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* KETENTUAN FORMATNYA */}
                <div className="text-[8.5px] text-indigo-950 bg-indigo-100/30 p-2.5 rounded-lg leading-relaxed border-l-3 border-indigo-500 font-medium space-y-1">
                  <div className="font-bold uppercase tracking-wider text-indigo-950">Syarat Ketentuan Unggahan Berkas:</div>
                  <ul className="list-disc pl-3 mt-1.5 space-y-1 text-[8px] text-gray-600 font-semibold">
                    <li>DOKUMEN HARUS MERUPAKAN FOTO TERBARU (6 BULAN TERAKHIR).</li>
                    <li>SISI INFORMASI KTP HARUS TERLIHAT UTUH, TERBACA JELAS TANPA BLUR ATAU PANTULAN CAHAYA.</li>
                    <li>PASFOTO WAJIB BERPOLA TEGAK DENGAN BACKGROUND POLOS UNTUK KEPERLUAN DOKUMEN SIAK.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold py-3 cursor-pointer transition-all uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-3 cursor-pointer transition-all shadow-xs uppercase tracking-wide"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Pengajuan Baru */}
      {showAddAppModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60] font-sans animate-fade-in" id="add-app-modal">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide">Buat Pengajuan Baru</h3>
                  <p className="text-[10px] text-gray-300">Daftarkan surat permohonan baru secara manual</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAppModal(false)}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="h-4.5 w-4.5 text-white" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const target = e.currentTarget;
              const selectUserIndex = (target.elements.namedItem('userIdx') as HTMLSelectElement).value;
              let nama = '';
              let nik = '';

              if (selectUserIndex === 'manual') {
                nama = (target.elements.namedItem('manualName') as HTMLInputElement).value.trim();
                nik = (target.elements.namedItem('manualNik') as HTMLInputElement).value.trim();
              } else {
                const u = registeredUsers[Number(selectUserIndex)];
                nama = u.nama;
                nik = u.nik;
              }

              const jenisPelayanan = (target.elements.namedItem('servType') as HTMLSelectElement).value as any;
              const keterangan = (target.elements.namedItem('details') as HTMLTextAreaElement).value.trim();
              const initialStatus = (target.elements.namedItem('initStatus') as HTMLSelectElement).value as any;

              if (!nama || !nik || !keterangan) {
                alert('Semua bidang wajib diisi!');
                return;
              }
              if (nik.length !== 16 || isNaN(Number(nik))) {
                alert('NIK harus terdiri dari tepat 16 digit angka!');
                return;
              }

              // Create files template mapping based on service selected, integrating any uploaded documents
              const srv = DAFTAR_PELAYANAN.find(s => s.id === jenisPelayanan);
              const mockFiles: { [key: string]: string } = {};
              if (srv) {
                srv.persyaratan.forEach(p => {
                  if (newAppUploadedFiles[p]) {
                    mockFiles[p] = newAppUploadedFiles[p];
                  } else {
                    mockFiles[p] = `${p.split(' ').slice(0, 2).join('_').toLowerCase()}_${nik}_asli.pdf`;
                  }
                });
              }

              const newApp: ServiceApplication = {
                id: 'TRJ-' + Math.floor(100000 + Math.random() * 900000).toString(),
                nik,
                nama,
                jenisPelayanan,
                tanggalPengajuan: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
                status: initialStatus,
                keterangan,
                hasPernyataan: srv?.persyaratan.some(p => p.toLowerCase().includes('pernyataan')) || false,
                uploadedFiles: mockFiles,
                pernyataanData: {
                  detailPernyataan: `Menyatakan dengan sesungguhnya bahwa data atas nama ${nama} untuk pengajuan ${srv?.title || jenisPelayanan} adalah sah dan benar.`
                }
              };

              if (onAddApplication) {
                onAddApplication(newApp);
              }
              setNewAppUploadedFiles({});
              setShowAddAppModal(false);
            }} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">

              {/* Selector for citizens */}
              <div className="space-y-1 text-left">
                <label className="block font-bold text-gray-700 uppercase">Pilih Warga Pemohon</label>
                <select
                  name="userIdx"
                  value={selectedUserOption}
                  onChange={(e) => setSelectedUserOption(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-0 focus:border-emerald-500 font-bold text-gray-700"
                >
                  <option value="manual">Tulis manual (Warga belum terdaftar)</option>
                  {registeredUsers.map((u, i) => (
                    u.role !== 'admin' && (
                      <option key={u.id} value={i}>{u.nama} ({u.nik})</option>
                    )
                  ))}
                </select>
              </div>

              {selectedUserOption === 'manual' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-left">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 uppercase text-[9px]">Nama Lengkap Pemohon</label>
                    <input
                      name="manualName"
                      type="text"
                      placeholder="Nama Lengkap sesuai KTP"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 uppercase text-[9px] font-mono">NIK Pemohon</label>
                    <input
                      name="manualNik"
                      type="text"
                      maxLength={16}
                      placeholder="NIK 16 digit"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-gray-800"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="block font-bold text-gray-700 uppercase">Jenis Pelayanan</label>
                <select
                  name="servType"
                  value={newAppServiceType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setNewAppServiceType(type);
                    setNewAppUploadedFiles({});
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-0 focus:border-emerald-500 font-bold text-gray-700"
                >
                  {DAFTAR_PELAYANAN.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* DYNAMIC DOCUMENTS REQUIREMENTS UPLOAD BOXES */}
              {(() => {
                const srv = DAFTAR_PELAYANAN.find(s => s.id === newAppServiceType);
                if (!srv) return null;
                return (
                  <div className="space-y-2.5 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-150 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-[10px] text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📂</span> Berkas Persyaratan Pemohon
                      </h4>
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Wajib diunggah / otomatis</span>
                    </div>

                    <div className="space-y-2 mt-2">
                      {srv.persyaratan.map((req, i) => {
                        const hasFile = !!newAppUploadedFiles[req];
                        const fileName = newAppUploadedFiles[req];
                        return (
                          <div key={i} className="bg-white p-2.5 rounded-xl border border-gray-150 flex items-center justify-between gap-3 shadow-xs">
                            <div className="min-w-0 flex-1">
                              <span className="block font-sans font-semibold text-gray-800 text-[10.5px] leading-tight truncate">
                                {i + 1}. {req}
                              </span>
                              {hasFile ? (
                                <span className="text-[9px] text-emerald-600 font-bold block mt-1 truncate">
                                  ✅ {fileName}
                                </span>
                              ) : (
                                <span className="text-[8px] text-gray-400 block mt-0.5">Uraian: PDF, JPG, PNG (Maks 5MB)</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <label className="inline-block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border border-indigo-200 whitespace-nowrap shadow-xs">
                                📤 Pilih File
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setNewAppUploadedFiles(prev => ({
                                        ...prev,
                                        [req]: file.name
                                      }));
                                    }
                                  }}
                                />
                              </label>

                              {hasFile && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewAppUploadedFiles(prev => {
                                      const copy = { ...prev };
                                      delete copy[req];
                                      return copy;
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all border border-red-200 shadow-xs"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}


              <div className="space-y-1 text-left">
                <label className="block font-bold text-gray-700 uppercase">Status Awal Pengajuan</label>
                <select
                  name="initStatus"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-0 focus:border-emerald-500 font-bold text-gray-700"
                >
                  <option value="pending">MENUNGGU VERIFIKASI (pending)</option>
                  <option value="diproses">SEDANG DIPROSES (diproses)</option>
                  <option value="selesai">SELESAI &amp; SAH (selesai)</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="block font-bold text-gray-700 uppercase">Maksud / Keperluan Pengajuan</label>
                <textarea
                  name="details"
                  required
                  rows={3}
                  placeholder="Contoh: Mengurus kehilangan KTP asli guna penggantian baru di Disdukcapil Pasuruan."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-800"
                />
              </div>

              <div className="pt-4 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="flex-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold py-3 cursor-pointer transition-all uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-3 cursor-pointer transition-all shadow-xs uppercase tracking-wide"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
