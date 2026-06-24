import { X, Printer, Landmark, CheckCircle, Clock, AlertTriangle, FileText, BadgeCheck } from 'lucide-react';
import { ServiceApplication, DAFTAR_PELAYANAN } from '../types';

interface ApplicationDetailsProps {
  app: ServiceApplication;
  onClose: () => void;
}

export default function ApplicationDetails({ app, onClose }: ApplicationDetailsProps) {
  const service = DAFTAR_PELAYANAN.find(s => s.id === app.jenisPelayanan) || DAFTAR_PELAYANAN[0];

  const handlePrintOfficialLetter = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izin pop-up diperlukan untuk membuka halaman cetak.');
      return;
    }

    const docSource = `
      <html>
      <head>
        <title>SURAT KETERANGAN KELURAHAN TRAJENG</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            padding: 40px;
            font-size: 11pt;
            line-height: 1.5;
            color: #000000;
          }
          .logo-placeholder {
            width: 70px;
            height: 70px;
            border: 2px solid #000;
            text-align: center;
            font-size: 8pt;
            font-family: Arial, sans-serif;
            font-weight: bold;
            display: inline-block;
            vertical-align: middle;
            margin-right: 15px;
            padding-top: 15px;
          }
          .kop-header {
            text-align: center;
            display: inline-block;
            vertical-align: middle;
            width: 80%;
          }
          .kop-1 { font-size: 14pt; font-weight: bold; margin: 0; }
          .kop-2 { font-size: 13pt; font-weight: bold; margin: 0; }
          .kop-3 { font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 0; }
          .kop-sub { font-size: 9pt; font-style: italic; margin: 3px 0 0 0; }
          .border-line {
            border-top: 3px solid #000000;
            border-bottom: 1px solid #000000;
            height: 3px;
            margin-top: 10px;
            margin-bottom: 20px;
          }
          .letter-title {
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 0;
            text-transform: uppercase;
          }
          .letter-number {
            text-align: center;
            font-size: 11pt;
            margin-top: 2px;
            margin-bottom: 25px;
          }
          .paragraph-text {
            text-align: justify;
            text-indent: 40px;
            margin-bottom: 12px;
          }
          .detail-table {
            width: 100%;
            margin-left: 30px;
            margin-bottom: 20px;
            border-collapse: collapse;
          }
          .detail-table td {
            padding: 3px 0;
            vertical-align: top;
          }
          .footer-table {
            width: 100%;
            margin-top: 40px;
            border-collapse: collapse;
          }
          .footer-table td {
            vertical-align: top;
          }
          .qr-placeholder {
            border: 1px solid #777;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7pt;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; width: 100%;">
          <!-- Kop Surat Pemerintah Kota Pasuruan -->
          <div style="display: flex; align-items: center; justify-content: center;">
            <div style="border: 2.5px solid #000; border-radius: 8px; width: 68px; height: 68px; padding-top: 15px; font-weight: bold; font-size: 9pt; text-align: center; font-family: sans-serif; margin-right: 15px; box-sizing: border-box;">
              LOGO<br/>PEMKOT
            </div>
            <div style="text-align: center;">
              <div class="kop-1">PEMERINTAH KOTA PASURUAN</div>
              <div class="kop-2">KECAMATAN GADINGREJO</div>
              <div class="kop-3">KANTOR KELURAHAN TRAJENG</div>
              <div class="kop-sub">Jl. S. Parman No. 45 Pasuruan, Telepon (0343) 421064, Kode Pos 67132</div>
            </div>
          </div>
        </div>
        
        <div class="border-line"></div>

        <div class="letter-title">
          ${selectedTitleUpper(app.jenisPelayanan)}
        </div>
        <div class="letter-number">
          Nomor: 470 / 184 / 42.10.4.02 / 2026
        </div>

        <p class="paragraph-text">
          Lurah Trajeng Kecamatan Panggungrejo Kota Pasuruan, dengan ini menerangkan bahwa berdasarkan berkas administrasi dan database kependudukan kelurahan, warga di bawah ini:
        </p>

        <table class="detail-table">
          <tr><td style="width:160px;">Nama Lengkap</td><td style="width:15px;">:</td><td><strong>${app.nama}</strong></td></tr>
          <tr><td>NIK</td><td>:</td><td>${app.nik}</td></tr>
          <tr><td>Tempat, Tanggal Lahir</td><td>:</td><td>Pasuruan, 12 Desember 1985</td></tr>
          <tr><td>Alamat domisili</td><td>:</td><td>Kelurahan Trajeng, RT 03 / RW 02, Kec. Panggungrejo, Kota Pasuruan</td></tr>
          <tr><td>Pekerjaan</td><td>:</td><td>Swasta</td></tr>
        </table>

        ${selectedBodyParagraph(app)}

        <p class="paragraph-text">
          Demikian surat keterangan ini diberikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya dan pihak terkait harap maklum adanya.
        </p>

        <table class="footer-table">
          <tr>
            <td style="width: 60%; padding-top: 15px;">
              <div style="border: 1px dashed #bbb; padding: 10px; width: 140px; text-align: center; font-size: 7.5pt; font-family: sans-serif; color: #555;">
                <div style="font-weight: bold; margin-bottom: 4px;">VERIFIKASI DIGITAL</div>
                <div style="background-color: #000; width: 50px; height: 50px; margin: 0 auto 5px;"></div>
                IKD KOTA PASURUAN<br/>PIN: TRJ-${app.id.split('-')[2] || '9827'}
              </div>
            </td>
            <td style="width: 40%; text-align: left;">
              <div>Ditetapkan di: Pasuruan</div>
              <div>Pada tanggal: ${app.tanggalPengajuan}</div>
              <div style="font-weight: bold; margin-top: 5px; margin-bottom: 60px;">LURAH TRAJENG</div>
              
              <div style="font-weight: bold; text-decoration: underline;">LURAH</div>
            </td>
          </tr>
        </table>

        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(docSource);
    printWindow.document.close();
  };

  function selectedTitleUpper(type: string): string {
    const srv = DAFTAR_PELAYANAN.find(s => s.id === type);
    if (srv) {
      return srv.title.replace('PERSYARATAN ', '').toUpperCase();
    }
    return 'SURAT KETERANGAN';
  }

  function selectedBodyParagraph(item: ServiceApplication): string {
    const srv = DAFTAR_PELAYANAN.find(s => s.id === item.jenisPelayanan);
    const hasMaterai = srv?.persyaratan.some(req => req.includes('Materai 10.000')) || false;
    
    if (hasMaterai && item.pernyataanData) {
      const p = item.pernyataanData;
      return `
        <p class="paragraph-text">
          Berdasarkan Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) bermaterai Rp 10.000 yang ditandatangani oleh pemegang hak/pemohon di atas, yang bersangkutan menyatakan secara sah dan berkekuatan hukum penuh perihal:
        </p>
        <div style="background: #fafafa; border: 1px solid #ddd; padding: 12px; border-radius: 6px; margin: 15px 30px; font-style: italic; font-size: 10pt;">
          "${p.detailPernyataan || p.narasiPernyataan || (p.barangHilang ? 'Bahwa pemohon telah kehilangan dokumen berharga berupa ' + p.barangHilang + ' di daerah ' + p.tempatKehilangan + ' pada sekitar tanggal ' + p.tanggalKehilangan : 'Bahwa pemohon menyatakan data administratif ' + (srv?.title || '') + ' adalah benar dan sah adanya.')}"
        </div>
        <p class="paragraph-text">
          Serta menerangkan bahwa seluruh keterangan tersebut disaksikan langsung kebenarannya oleh saksi-saksi warga setempat yaitu sdr/i <strong>${p.namaSaksi1 || '-'}</strong> dan sdr/i <strong>${p.namaSaksi2 || '-'}</strong>.
        </p>
      `;
    }

    switch (item.jenisPelayanan) {
      case 'sankem':
        return `
          <p class="paragraph-text">
            Berdasarkan pemeriksaan berkas kelayakan, nama tersebut di atas adalah ahli waris yang sah untuk mengajukan program dana <strong>Santunan Kematian (SANKEM)</strong> atas berpulangnya almarhum yang bersangkutan, dikuatkan oleh bukti-bukti administratif lengkap rangkap empat.
          </p>
        `;
      case 'akte_kematian':
        return `
          <p class="paragraph-text">
            Menerangkan bahwa pelaporan kematian bagi jenazah yang bersangkutan telah memenuhi seluruh persyaratan pencatatan sipil Kelurahan Trajeng dan telah diverifikasi keterangannya secara sah.
          </p>
        `;
      case 'akte_kelahiran':
        return `
          <p class="paragraph-text">
            Menyatakan bahwa pelaporan kenal lahir bagi bayi/anak dari orang tua bersangkutan telah terdaftar dengan berkas-berkas pengabsahan nikah serta disaksikan oleh dua orang saksi warga secara lengkap.
          </p>
        `;
      case 'kk_baru':
        return `
          <p class="paragraph-text">
            Menyatakan bahwa yang bersangkutan sedang dalam proses penerbitan Kartu Keluarga (KK) baru akibat perubahan data mutasi sipil dalam wilayah Kelurahan Trajeng.
          </p>
        `;
      default:
        return `
          <p class="paragraph-text">
            Bahwa nama tersebut di atas benar-benar penduduk tetap Kelurahan Trajeng Kecamatan Panggungrejo Kota Pasuruan yang dikenal berkelakuan baik dan patuh pada regulasi masyarakat yang berlaku.
          </p>
        `;
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 font-sans" id="details-viewer-container">
      {/* Top bar with state titles */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-150 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Detail Pengajuan #{app.id}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 font-mono">Tanggal Ajukan: {app.tanggalPengajuan}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          id="close-details-btn"
          className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left pane: meta info and states */}
        <div className="md:col-span-4 space-y-5 text-left leading-normal">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/60 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">Jenis Pelayanan</span>
              <strong className="text-gray-800 block text-sm font-bold mt-0.5">{service.title}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">Status Pengajuan</span>
              <div className="mt-1.5">
                {app.status === 'selesai' ? (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Selesai / Terbit
                  </span>
                ) : app.status === 'diproses' ? (
                  <span className="bg-amber-100/70 text-amber-800 border border-amber-200/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 animate-pulse">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Sedang Diproses
                  </span>
                ) : app.status === 'ditolak' ? (
                  <span className="bg-red-50 text-red-800 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Berkas Ditolak
                  </span>
                ) : (
                  <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Menunggu Review
                  </span>
                )}
              </div>
            </div>

            {app.keterangan && (
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">Catatan Petugas Kelurahan</span>
                <p className="text-xs text-gray-650 bg-white rounded-xl p-3 border border-gray-150 mt-1 italic">
                  "{app.keterangan}"
                </p>
              </div>
            )}
          </div>

          {/* Guidelines instruction if approved */}
          {app.status === 'selesai' && (
            <div className="bg-emerald-50/50 border border-emerald-250 p-4.5 rounded-xl space-y-2">
              <div className="flex gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
                <h4 className="text-xs font-bold text-emerald-900 leading-tight">Pengambilan Surat Fisik</h4>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Berkas pengurusan Anda telah diverifikasi oleh Staf Kelurahan Trajeng. Silakan datangi langsung <strong>Loket Pelayanan Umum Kelurahan Trajeng</strong> guna mengambil cetakan berkas resmi yang bertanda tangan basah dan stempel kelurahan.
              </p>
            </div>
          )}
        </div>

        {/* Right pane: Fitur Monitoring Status Pengajuan */}
        <div className="md:col-span-8 w-full bg-white rounded-2xl border border-gray-150 p-6 md:p-8 space-y-6" id="monitoring-section-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-150">
            <div className="text-left py-1">
              <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                Monitoring Real-Time Status Pengajuan
              </h4>
              <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest font-mono">ID Tracker: #{app.id}</p>
            </div>
          </div>

          {/* Graphical timeline */}
          <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {/* STEP 1: Draft Dikirim */}
            <div className="relative text-left">
              <span className="absolute -left-[30px] top-0.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-300 h-8 w-8 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-700" />
              </span>
              <div className="pl-4">
                <div className="flex items-center gap-2">
                  <h5 className="font-extrabold text-gray-900 text-sm">1. Berkas Pengajuan Terkirim</h5>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest leading-none">SELESAI</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Permohonan pelayanan <strong>{service.title}</strong> telah didaftarkan secara sukses oleh warga di sistem mandiri kelurahan.
                </p>
                <div className="text-[10px] text-gray-400 font-mono mt-1">Diajukan pada: {app.tanggalPengajuan} WIB</div>
              </div>
            </div>

            {/* STEP 2: Verifikasi Kelengkapan Berkas */}
            <div className="relative text-left">
              {app.status === 'ditolak' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-red-100 text-red-800 border-2 border-red-300 h-8 w-8 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-700" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-red-950 text-sm">2. Verifikasi Kelengkapan Berkas Gagal</h5>
                      <span className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-widest leading-none">DITOLAK</span>
                    </div>
                    <p className="text-xs text-red-850 mt-1 leading-normal font-medium">
                      Verifikasi berkas pendukung dibatalkan oleh Petugas karena kelengkapan pendaftaran tidak memenuhi kriteria kelayakan.
                    </p>
                    {app.keterangan && (
                      <div className="mt-2 text-xs bg-red-50 text-red-900 rounded-xl p-3 border border-red-200 leading-normal">
                        <strong>Alasan Penolakan:</strong> "{app.keterangan}"
                      </div>
                    )}
                  </div>
                </>
              ) : app.status === 'pending' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-blue-50 text-blue-800 border-2 border-blue-300 h-8 w-8 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-650 animate-pulse" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-gray-900 text-sm">2. Verifikasi Kelengkapan Berkas</h5>
                      <span className="bg-blue-55 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest leading-none">SEDANG DIKOREKSI</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">
                      Petugas Loket Pelayanan Kelurahan sedang menjadwalkan pemeriksaan kevalidan file scan dokumen digital yang Anda unggah.
                    </p>
                  </div>
                </>
              ) : ( // Status diproses atau selesai
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-300 h-8 w-8 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-700" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-gray-900 text-sm">2. Verifikasi Kelengkapan Berkas</h5>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest leading-none">SELESAI</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">
                      Pemeriksaan seluruh file scan berkas pendukung Anda dinyatakan <strong>BERHASIL & SAH</strong> oleh Staf Administrasi Umum.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* STEP 3: Tinjauan / Tanda Tangan Lurah */}
            <div className="relative text-left">
              {app.status === 'ditolak' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-gray-100 text-gray-400 border-2 border-gray-250 h-8 w-8 rounded-full flex items-center justify-center">
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </span>
                  <div className="pl-4 opacity-60">
                    <h5 className="font-bold text-gray-500 text-sm">3. Pengesahan Lurah Trajeng</h5>
                    <p className="text-xs text-gray-400 mt-0.5">Dibatalkan karena berkas administrasi tidak lolos verifikasi awal.</p>
                  </div>
                </>
              ) : app.status === 'pending' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-gray-50 text-gray-350 border-2 border-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-gray-405" />
                  </span>
                  <div className="pl-4 opacity-60">
                    <h5 className="font-bold text-gray-500 text-sm">3. Pengesahan Lurah Trajeng</h5>
                    <p className="text-xs text-gray-400 mt-0.5">Akan dimulai setelah berkas pendukung lolos uji keandalan data oleh staf kelurahan.</p>
                  </div>
                </>
              ) : app.status === 'diproses' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-amber-50 text-amber-805 border-2 border-amber-300 h-8 w-8 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-gray-900 text-sm">3. Pengesahan Lurah Trajeng</h5>
                    </div>
                    <p className="text-xs text-gray-650 mt-1 leading-normal">
                      Dokumen berada di meja <strong>Lurah Trajeng</strong> guna proses legalisasi Surat Keterangan Pengantar resmi.
                    </p>
                  </div>
                </>
              ) : ( // Selesai
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-300 h-8 w-8 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-700" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-gray-900 text-sm">3. Pengesahan Lurah Trajeng</h5>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest leading-none">LEGAL DIGITAL</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-normal">
                      Surat disahkan menggunakan <strong>Tanda Tangan Elektronik (TTE) Tersertifikasi</strong> oleh Lurah.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* STEP 4: Surat Terbit / Siap Diambil */}
            <div className="relative text-left">
              {app.status === 'selesai' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-450 h-8 w-8 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-800 animate-bounce" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-emerald-950 text-sm">4. Surat Terbit / Siap Diambil</h5>
                      <span className="bg-emerald-100 text-emerald-850 text-[9px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-widest leading-none">SIAP DIAMBIL</span>
                    </div>
                    <p className="text-xs text-gray-750 mt-1 leading-normal">
                      Dokumen pelayanan Anda telah selesai diproses dan disahkannya secara resmi oleh Lurah Trajeng! Silakan datang langsung ke <strong>Loket Pelayanan Kelurahan Trajeng</strong> dengan membawa dokumen fisik asli (KTP &amp; KK) serta print-out bukti Surat Pernyataan asli yang bermaterai (bila diminta) untuk pengambilan berkas resmi bertanda tangan basah dan berstempel dinas.
                    </p>
                  </div>
                </>
              ) : app.status === 'ditolak' ? (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-red-100 text-red-800 border-2 border-red-300 h-8 w-8 rounded-full flex items-center justify-center">
                    <X className="h-4.5 w-4.5 text-red-700" />
                  </span>
                  <div className="pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-red-950 text-sm">4. Verifikasi Gagal / Ditolak</h5>
                      <span className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-widest">DITOLAK</span>
                    </div>
                    <p className="text-xs text-red-800 mt-1 leading-normal">
                      Pengajuan ditolak. Silakan koreksi kesalahan berkas pendukung kependudukan Anda lalu buat permohonan pengajuan baru dengan berkas pendukung yang benar.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="absolute -left-[30px] top-0.5 bg-gray-50 text-gray-350 border-2 border-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                  </span>
                  <div className="pl-4 opacity-65">
                    <h5 className="font-semibold text-gray-500 text-sm">4. Surat Terbit / Siap Diambil</h5>
                    <p className="text-xs text-gray-450 mt-0.5">Surat akan diterbitkan otomatis setelah peninjauan Lurah disetujui (100% digital).</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Quick Informational card for Trajeng exclusive usage */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 text-left">
            <Landmark className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-500 leading-normal space-y-1">
              <strong className="text-gray-800 text-[11.5px] font-bold uppercase block">Pemberitahuan Khusus Kelurahan Trajeng Pasuruan</strong>
              <p>
                Sistem Monitoring SIM Pelayanan ini bersifat <strong>internal &amp; eksklusif</strong> bagi warga domisili Kelurahan Trajeng, Kecamatan Panggungrejo, Kota Pasuruan. Pengurusan tidak dipungut biaya apapun (Gratis).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
