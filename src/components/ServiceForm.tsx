import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckSquare, AlertCircle, Upload, ArrowRight, 
  ArrowLeft, Download, Printer, Info, CheckCircle, FilePlus,
  Eye, Trash2, X, User
} from 'lucide-react';
import { ServiceType, DAFTAR_PELAYANAN, UserAccount, ServiceApplication } from '../types';
import { downloadWordFile, PernyataanData } from '../lib/wordGenerator';

interface ServiceFormProps {
  loggedInUser: UserAccount;
  onSubmit: (app: ServiceApplication) => void;
  onCancel: () => void;
  initialServiceType?: ServiceType;
}

export default function ServiceForm({ loggedInUser, onSubmit, onCancel, initialServiceType }: ServiceFormProps) {
  const [selectedType, setSelectedType] = useState<ServiceType>(initialServiceType || 'kehilangan');
  const [keterangan, setKeterangan] = useState('');
  
  // Data Diri Manual (karena profil warga ditiadakan)
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');

  
  // Track interactive service type collapse list ("jika di klik maka muncul jenis layanan lainnya")
  const [isOpen, setIsOpen] = useState(false);

  // Declaration letter (Surat Pernyataan) specific state fields
  const [barangHilang, setBarangHilang] = useState('1 Buah Kartu Tanda Penduduk (KTP) Elektronik atas nama Budi Santoso');
  const [lokasiKehilangan, setLokasiKehilangan] = useState('Sekitar wilayah Jl. Hangtuah dan Pasar Kelurahan Trajeng Pasuruan');
  const [tanggalKehilangan, setTanggalKehilangan] = useState('Senin, 15 Juni 2026');
  
  // Custom statement details content for 15 services with Materai
  const [detailPernyataan, setDetailPernyataan] = useState('');

  const [namaSaksi1, setNamaSaksi1] = useState('');
  const [namaSaksi2, setNamaSaksi2] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');

  // Track if statement letter downloaded
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  // Simulated file uploads
  const [files, setFiles] = useState<{ [key: string]: string }>({});
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [previewingFile, setPreviewingFile] = useState<{ reqName: string; fileName: string } | null>(null);

  const selectedService = DAFTAR_PELAYANAN.find(s => s.id === selectedType) || DAFTAR_PELAYANAN[0];
  const hasMateraiRequirement = selectedService.persyaratan.some(req => req.includes('Materai 10.000'));

  // Sync selectedType from initialServiceType prop if updated
  useEffect(() => {
    if (initialServiceType) {
      setSelectedType(initialServiceType);
    }
  }, [initialServiceType]);

  useEffect(() => {
    // Set default date for physical letter sign-off (indonesia style)
    const today = new Date();
    const formatted = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setTanggalSurat(formatted);
  }, []);

  // Reset files and downloaded state when service type changes
  useEffect(() => {
    setFiles({});
    setFileContents({});
    setHasDownloaded(false);
  }, [selectedType]);

  // Update validation check to require all specific files from selectedService.persyaratan
  useEffect(() => {
    const requiredFiles = selectedService.persyaratan;
    const allUploaded = requiredFiles.every(req => !!files[req]);
    setReadyToSubmit(allUploaded);
  }, [files, selectedService]);

  // Set automated prefilled content for other statements
  useEffect(() => {
    if (selectedType !== 'kehilangan') {
      switch (selectedType) {
        case 'domisili_tinggal':
          setDetailPernyataan(`Bahwa saya benar-benar bertempat tinggal menetap secara sah di wilayah Kelurahan Trajeng RT ${rt} RW ${rw} Kecamatan Panggungrejo Kota Pasuruan sejak tahun 2018 dan berkelakuan baik di lingkungan warga setempat.`.trim());
          break;
        case 'domisili_usaha':
          setDetailPernyataan(`Bahwa benar saya menjalankan kegiatan operasional/tempat usaha perdagangan perorangan di wilayah administratif Kelurahan Trajeng Kota Pasuruan dan mematuhi tata tertib kebersamaan warga setempat.`.trim());
          break;
        case 'ket_usaha':
          setDetailPernyataan(`Bahwa saya menyatakan dengan sebenarnya memiliki kegiatan usaha ekonomi rintisan aktif berupa kedai/toko kelontong di domisili tempat tinggal saya Kelurahan Trajeng demi menunjang ekonomi keluarga.`.trim());
          break;
        case 'sktm':
          setDetailPernyataan(`Bahwa benar kondisi ekonomi rumah tangga kami saat ini berada di bawah kecukupan regional dengan penghasilan bulanan yang tidak menetap, dan membutuhkan jaminan keringanan biaya pendidikan/kesehatan umum.`.trim());
          break;
        case 'belum_menikah':
          setDetailPernyataan(`Bahwa saya menyatakan dengan sadar dan jaminan hukum penuh bahwa saya sampai dengan surat ini dibuat belum pernah melangsungkan tali pernikahan dengan siapapun baik siri, agama maupun resmi.`.trim());
          break;
        case 'beda_nama':
          setDetailPernyataan(`Bahwa pencantuman nama saya yang tertulis pada ijazah kelulusan sekolah dan nama pada KTP/KK/Akte Kelahiran merujuk pada satu subjek orang yang sama, yaitu saya sendiri.`.trim());
          break;
        case 'tanggal_lahir':
          setDetailPernyataan(`Bahwa terdapat kekeliruan administratif pencatatan tanggal lahir pada dokumen ijazah. Tanggal lahir saya yang benar adalah sesuai dengan akta kelahiran bawaan.`.trim());
          break;
        case 'lainnya':
          setDetailPernyataan(`Bahwa benar permohonan atas surat pengantar yang bersangkutan diproses berdasarkan keterangan sah data kependudukan pribadi saya tanpa manipulasi apapun.`.trim());
          break;
        default:
          setDetailPernyataan(`Bahwa saya menyatakan data kependudukan yang saya serahkan untuk pembuatan surat ${selectedService.title} adalah sah dan benar adanya.`.trim());
      }
    }
  }, [selectedType, loggedInUser, selectedService, rt, rw]);

  const handleDownloadPernyataan = () => {
    const data: PernyataanData = {
      nama: loggedInUser.nama,
      nik: loggedInUser.nik,
      tempatLahir,
      tanggalLahir,
      pekerjaan,
      alamat,
      rt,
      rw,
      barangHilang: selectedType === 'kehilangan' ? barangHilang : undefined,
      lokasiKehilangan: selectedType === 'kehilangan' ? lokasiKehilangan : undefined,
      tanggalKehilangan: selectedType === 'kehilangan' ? tanggalKehilangan : undefined,
      saksi1: namaSaksi1,
      saksi2: namaSaksi2,
      tanggalSurat,
      judulPernyataan: selectedService.title,
      detailPernyataan: selectedType === 'kehilangan' ? undefined : detailPernyataan
    };
    downloadWordFile(data);
    setHasDownloaded(true);
  };

  const handlePrintPernyataan = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izin pop-up diperlukan untuk membuka halaman cetak.');
      return;
    }

    const docSource = `
      <html>
      <head>
        <title>${selectedService.title.toUpperCase()}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            padding: 30px;
            font-size: 12pt;
            line-height: 1.6;
            color: #000000;
          }
          .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            text-decoration: underline;
            margin-bottom: 24pt;
            text-transform: uppercase;
          }
          .data-table {
            width: 100%;
            margin-left: 20px;
            margin-bottom: 20px;
            border-collapse: collapse;
          }
          .data-table td {
            padding: 4px 0;
            vertical-align: top;
          }
          .loss-box {
            border: 1px solid #000;
            padding: 8px 12px;
            margin: 15px 20px;
            background-color: #fafafa;
          }
          .bottom-table {
            width: 100%;
            margin-top: 40px;
            border-collapse: collapse;
          }
          .bottom-table td {
            vertical-align: top;
          }
          .stamp-box {
            border: 1px dashed #777;
            width: 110px;
            height: 65px;
            text-align: center;
            font-size: 8pt;
            color: #444;
            padding-top: 15px;
            margin: 15px 0 15px auto;
            background-color: #fcfcfc;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-title">${selectedService.title.toUpperCase()}</div>
        <div>Yang bertanda tangan di bawah ini :</div>
        <table class="data-table">
          <tr><td style="width:180px;">Nama</td><td style="width:15px;">:</td><td><strong>${loggedInUser.nama}</strong></td></tr>
          <tr><td>NIK</td><td>:</td><td>${loggedInUser.nik}</td></tr>
          <tr><td>Tempat, Tanggal Lahir</td><td>:</td><td>${tempatLahir}, ${tanggalLahir}</td></tr>
          <tr><td>Pekerjaan</td><td>:</td><td>${pekerjaan || '-'}</td></tr>
          <tr><td>Alamat domisili</td><td>:</td><td>${alamat} (RT ${rt} / RW ${rw}), Kelurahan Trajeng, Kota Pasuruan</td></tr>
        </table>
        
        <p style="text-align: justify; text-indent: 40px;">
          Dengan ini menyatakan bahwa saya yang beridentitas sebagaimana tersebut di atas, memberikan pernyataan dengan sebenarnya berkaitan dengan pengajuan <strong>${selectedService.title.toUpperCase()}</strong> dengan rincian keterangan sebagai berikut:
        </p>

        <div class="loss-box">
          ${selectedType === 'kehilangan' ? `
            <strong>Nama Dokumen/Barang Hilang:</strong> ${barangHilang}<br>
            <strong>Lokasi Kejadian perkiraan:</strong> ${lokasiKehilangan}<br>
            <strong>Tanggal Hilang perkiraan:</strong> ${tanggalKehilangan}
          ` : `
            <strong>Rincian Pernyataan Tambahan:</strong><br/>
            ${detailPernyataan}
          `}
        </div>

        <p style="text-align: justify; text-indent: 40px;">
          Seluruh data dan dokumen pendukung yang saya sampaikan dalam permohonan ini adalah benar adanya. Apabila di kemudian hari ditemukan ketidaksesuaian, pemalsuan, atau hal yang tidak benar dalam pernyataan ini, saya bersedia mempertanggungjawabkannya sesuai ketentuan hukum dan perundang-undangan yang berlaku di Negara Republik Indonesia.
        </p>

        <p style="text-align: justify; text-indent: 40px;">
          Demikian surat pernyataan ini saya buat dengan sebenarnya dengan kesadaran penuh tanpa ada tekanan atau paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.
        </p>

        <table class="bottom-table">
          <tr>
            <td style="width: 50%;">
              <div style="font-weight:bold; margin-bottom:5px;">SAKSI-SAKSI KETETANGGAAN:</div>
              <div style="margin-bottom:8px;">
                Saksi I: <strong>${namaSaksi1 || '-'}</strong>
              </div>
              <div>
                Saksi II: <strong>${namaSaksi2 || '-'}</strong>
              </div>
            </td>
            <td style="width: 50%; text-align: right;">
              <div>Pasuruan, ${tanggalSurat}</div>
              <div style="margin-top:5px; margin-right:30px;">Yang Menyatakan,</div>
              <div class="stamp-box" style="margin-right:25px;">
                MATERAI<br>Rp 10.000
              </div>
              <div style="margin-top:20px; margin-right:20px; font-weight:bold; text-decoration:underline;">
                ( ${loggedInUser.nama} )
              </div>
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

  const handleFileUpload = (id: string, fileOrName: File | string) => {
    if (typeof fileOrName === 'string') {
      setFiles(prev => ({
        ...prev,
        [id]: fileOrName
      }));
    } else {
      const file = fileOrName;
      setFiles(prev => ({
        ...prev,
        [id]: file.name
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setFileContents(prev => ({
            ...prev,
            [id]: result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(id);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(id, e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim()) return;

    const randomId = 'TRJ-' + new Date().getFullYear() + 
      String(new Date().getMonth() + 1).padStart(2, '0') + 
      String(new Date().getDate()).padStart(2, '0') + '-' + 
      Math.floor(100 + Math.random() * 900);

    const appData: ServiceApplication = {
      id: randomId,
      nik: loggedInUser.nik,
      nama: loggedInUser.nama,
      jenisPelayanan: selectedType,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      status: 'pending',
      keterangan: 'Menunggu dokumen fisik atau verifikasi antrean berkas digital oleh Kelurahan.',
      hasPernyataan: hasMateraiRequirement,
      pernyataanData: hasMateraiRequirement ? {
        judulPernyataan: selectedService.title,
        detailPernyataan: selectedType === 'kehilangan' ? undefined : detailPernyataan,
        barangHilang: selectedType === 'kehilangan' ? barangHilang : undefined,
        tempatKehilangan: selectedType === 'kehilangan' ? lokasiKehilangan : undefined,
        tanggalKehilangan: selectedType === 'kehilangan' ? tanggalKehilangan : undefined,
        namaSaksi1,
        pekerjaanSaksi1: 'Swasta',
        alamatSaksi1: 'Kelurahan Trajeng, Pasuruan',
        namaSaksi2,
        pekerjaanSaksi2: 'Wiraswasta',
        alamatSaksi2: 'Kelurahan Trajeng, Pasuruan',
        tanggalSurat
      } : undefined,
      uploadedFiles: files,
      fileContents: fileContents
    };

    onSubmit(appData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8" id="form-container">
      {/* Header section with back button */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-150">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg border border-emerald-100">
            <FilePlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-gray-900 leading-tight">Pengajuan Pelayanan Baru</h2>
            <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">LENGKAPI INFORMASI DAN BERKAS PERMOHONAN</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          id="back-list-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-55 hover:text-gray-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Riwayat
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 font-sans">
        {/* Interactive service structure picker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Jenis Surat Pelayanan Kelurahan *
            </label>
            
            {/* Click to reveal list of alternate options */}
            <div className="relative" id="interactive-service-selector-container">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                id="active-service-trigger-btn"
                className="w-full bg-white text-gray-900 font-sans font-bold rounded-xl border border-emerald-300 py-3.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-50/20 transition-all"
              >
                <span className="flex items-center gap-2 text-sm leading-tight">
                  <FileText className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  {selectedService.title}
                </span>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest font-mono">
                  {isOpen ? 'Tutup ▲' : 'Ubah ▼'}
                </span>
              </button>

              {/* Reveal other services list when clicked */}
              {isOpen && (
                <div 
                  id="dropdown-reveal-other-services"
                  className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto animate-fade-in divide-y divide-gray-100"
                >
                  <p className="p-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                    Pilih Layanan Lainnya (Total 16 Layanan)
                  </p>
                  {DAFTAR_PELAYANAN.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(sec.id);
                        setIsOpen(false);
                        // Clear requirements file if changing
                        const newFiles = { ...files };
                        if (sec.id !== 'kehilangan') {
                          delete newFiles['SuratPernyataan'];
                        }
                        setFiles(newFiles);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors hover:bg-emerald-50/40 ${
                        selectedType === sec.id 
                          ? 'bg-emerald-50/80 text-emerald-950 border-l-4 border-emerald-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{sec.title}</span>
                      {sec.persyaratan.some(req => req.includes('Materai 10.000')) && (
                        <span className="bg-sky-50 text-[8px] text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-sm font-sans uppercase font-bold tracking-wider shrink-0">
                          Materai
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Short Service Overview */}
            <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/50">
              <div className="flex gap-2.5">
                <Info className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 leading-tight animate-pulse">Sifat Layanan</h4>
                  <p className="text-xs text-gray-650 leading-relaxed mt-1 font-medium">{selectedService.deskripsi}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Sidebar - reveals requirements immediately on selection */}
          <div className="lg:col-span-8 bg-gray-50 rounded-2xl p-5 border border-gray-200" id="instant-requirements-box">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <CheckSquare className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              Persyaratan Administrasi Dokumen: {selectedService.title}
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedService.persyaratan.map((req, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-gray-750 font-medium items-start bg-white p-3 rounded-xl border border-gray-150 shadow-2xs">
                  <span className="bg-emerald-100 text-emerald-800 font-bold shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[10px] md:mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-normal">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MANUAL DATA DIRI ENTRY */}
        {hasMateraiRequirement && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 border-b border-gray-200 pb-2">
              <User className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              Lengkapi Data Diri Pemohon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tempat Lahir *</label>
                <input type="text" required value={tempatLahir} onChange={e => setTempatLahir(e.target.value)} className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: Pasuruan" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal Lahir *</label>
                <input type="text" required value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: 15 Agustus 1990" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pekerjaan *</label>
                <input type="text" required value={pekerjaan} onChange={e => setPekerjaan(e.target.value)} className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: Wiraswasta" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Alamat Domisili *</label>
                <input type="text" required value={alamat} onChange={e => setAlamat(e.target.value)} className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Contoh: Jl. Hangtuah No. 12" />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">RT *</label>
                  <input type="text" required value={rt} onChange={e => setRt(e.target.value)} className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="001" />
                </div>
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">RW *</label>
                  <input type="text" required value={rw} onChange={e => setRw(e.target.value)} className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="002" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPREHENSIVE DYNAMIC SECTION: "Surat Pernyataan Materai 10.000" Form & Live Paper Sheet */}
        {hasMateraiRequirement && (
          <div className="border border-amber-250 bg-amber-50/20 rounded-2xl p-6 space-y-6 animate-fade-in" id="pernyataan-helper-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/50">
              <div className="flex gap-3 items-start">
                <div className="bg-amber-100 text-amber-900 p-2 rounded-xl border border-amber-200/60">
                  <FileText className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-amber-955 leading-tight">Pengisian &amp; Cetak Surat Pernyataan</h3>
                  <p className="text-xs text-amber-700 font-medium font-sans mt-0.5">Isi rincian informasi di bawah ini untuk membuat dan mengunduh surat pernyataan secara instan.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="print-statement-btn"
                  onClick={handlePrintPernyataan}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-705 hover:text-gray-900 border border-gray-250 hover:border-gray-400 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-emerald-600" />
                  Cetak / Print
                </button>
                <button
                  type="button"
                  id="download-statement-btn"
                  onClick={handleDownloadPernyataan}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download Berkas (.DOC)
                </button>
              </div>
            </div>

            {/* Editor fields and Live preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input fields */}
              <div className="lg:col-span-5 space-y-4">
                {selectedType === 'kehilangan' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Nama Dokumen / Barang Hilang *
                      </label>
                      <textarea
                        id="barang-hilang-input"
                        rows={2}
                        value={barangHilang}
                        onChange={(e) => setBarangHilang(e.target.value)}
                        required
                        className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800 leading-normal"
                        placeholder="Contoh: 1 buah KTP Asli atas nama Budi Santoso"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Lokasi Kehilangan Perkiraan *
                      </label>
                      <input
                        id="lokasi-hilang-input"
                        type="text"
                        value={lokasiKehilangan}
                        onChange={(e) => setLokasiKehilangan(e.target.value)}
                        required
                        className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800"
                        placeholder="Contoh: Sekitar Alun-Alun Pasuruan"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Tanggal Hilang *
                      </label>
                      <input
                        id="tanggal-hilang-input"
                        type="text"
                        value={tanggalKehilangan}
                        onChange={(e) => setTanggalKehilangan(e.target.value)}
                        required
                        className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800"
                        placeholder="Contoh: Senin, 15 Juni 2026"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Rincian Pernyataan Tambahan *
                    </label>
                    <textarea
                      id="detail-pernyataan-input"
                      rows={5}
                      value={detailPernyataan}
                      onChange={(e) => setDetailPernyataan(e.target.value)}
                      required
                      className="w-full bg-white text-xs font-medium rounded-xl border border-gray-250 p-3 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800 leading-normal"
                      placeholder="Tulis rincian pernyataan kependudukan formal Anda..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Tanggal Surat *
                    </label>
                    <input
                      id="tanggal-tangan-input"
                      type="text"
                      value={tanggalSurat}
                      onChange={(e) => setTanggalSurat(e.target.value)}
                      required
                      className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800"
                      placeholder="Contoh: 16 Juni 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Saksi I (Tetangga)
                    </label>
                    <input
                      id="saksi1-input"
                      type="text"
                      value={namaSaksi1}
                      onChange={(e) => setNamaSaksi1(e.target.value)}
                      className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800"
                      placeholder="Nama Saksi 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Saksi II (Tetangga)
                  </label>
                  <input
                    id="saksi2-input"
                    type="text"
                    value={namaSaksi2}
                    onChange={(e) => setNamaSaksi2(e.target.value)}
                    className="w-full bg-white text-xs font-medium rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-gray-800"
                    placeholder="Nama Saksi 2"
                  />
                </div>

                <div className="pt-1">
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex gap-2">
                    <Info className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-805 leading-normal font-sans">
                      <strong>Cara Penyerahan:</strong> Setelah mengunduh berkas .DOC atau mencetaknya, pastikan membubuhkan tanda tangan fisik Anda di atas <strong>Materai Tempel Rp 10.000</strong> dan ditandatangani oleh 2 orang saksi tetangga sebelum mengunggah kembali fotonya di bawah.
                    </p>
                  </div>
                </div>
              </div>

              {/* REALISTIC ON-SCREEN LETTER preview PAGE */}
              <div className="lg:col-span-7 bg-white rounded-xl shadow-lg border border-gray-300 p-6 md:p-8 font-serif text-[11px] leading-relaxed relative overflow-hidden select-text text-gray-800 max-h-[500px] overflow-y-auto animate-fade-in" id="letter-preview">
                {/* Simulated Watermark background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none transform -rotate-45">
                  <span className="text-7xl font-sans font-bold uppercase tracking-widest">TRAJENG</span>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                  {/* Letter Header title */}
                  <div className="text-center font-bold text-sm tracking-tight border-b border-gray-150 pb-2">
                    {selectedService.title.toUpperCase()}
                  </div>

                  <div>Yang bertanda tangan di bawah ini :</div>

                  <table className="w-full border-collapse text-[10.5px]">
                    <tbody>
                      <tr>
                        <td className="w-24 font-normal py-0.5">Nama Lengkap</td>
                        <td className="w-3 text-center">:</td>
                        <td className="font-bold">{loggedInUser.nama}</td>
                      </tr>
                      <tr>
                        <td className="font-normal py-0.5">NIK (KTP)</td>
                        <td>:</td>
                        <td>{loggedInUser.nik}</td>
                      </tr>
                      <tr>
                        <td className="font-normal py-0.5">Tempat/Tgl Lahir</td>
                        <td>:</td>
                        <td>{tempatLahir}, {tanggalLahir}</td>
                      </tr>
                      <tr>
                        <td className="font-normal py-0.5">Pekerjaan</td>
                        <td>:</td>
                        <td>{pekerjaan || '-'}</td>
                      </tr>
                      <tr>
                        <td className="font-normal py-0.5">Alamat Domisili</td>
                        <td>:</td>
                        <td>{alamat} (RT {rt}/RW {rw}), Kelurahan Trajeng</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="text-justify text-[10.5px]">
                    Dengan ini menyatakan dengan sebenarnya berkaitan dengan permohonan pengujian kelayakan administratif <strong>{selectedService.title.toUpperCase()}</strong>:
                  </p>

                  <div className="border border-dashed border-gray-300 bg-gray-50/70 p-3 rounded-lg italic text-[10.5px] text-gray-700">
                    {selectedType === 'kehilangan' ? (
                      <>
                        <strong>Nama Dokumen/Barang Hilang:</strong> {barangHilang}<br/>
                        <strong>Perkiraan Lokasi:</strong> {lokasiKehilangan}<br/>
                        <strong>Perkiraan Tanggal:</strong> {tanggalKehilangan}
                      </>
                    ) : (
                      <>
                        <strong>Isi Rincian Pernyataan Kependudukan:</strong><br/>
                        <span className="whitespace-pre-line leading-relaxed">{detailPernyataan}</span>
                      </>
                    )}
                  </div>

                  <p className="text-justify text-[10.5px]">
                    Seluruh dokumen yang saya sampaikan adalah sah dan benar. Apabila di kemudian hari terbukti pernyataan ini palsu, saya bersedia diajukan ke muka pengadilan sesuai hukum yang berlaku di Indonesia.
                  </p>

                  <p className="text-justify text-[10.5px]">
                    Demikian surat pernyataan ini saya buat dengan kesadaran penuh tanpa paksaan pihak lain.
                  </p>

                  {/* Signatures section block */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] pt-4 leading-normal">
                    <div>
                      <div className="font-bold border-b border-gray-150 pb-1 mb-2">SAKSI-SAKSI:</div>
                      <div className="h-10 flex items-center italic text-gray-400">
                        (Tanda Tangan 1)
                      </div>
                      <div className="font-semibold text-gray-900">1. {namaSaksi1 || '...................................'}</div>

                      <div className="h-10 flex items-center italic text-gray-400 mt-2">
                        (Tanda Tangan 2)
                      </div>
                      <div className="font-semibold text-gray-900">2. {namaSaksi2 || '...................................'}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div>Pasuruan, {tanggalSurat}</div>
                      <div className="font-semibold mr-4 mt-1">Yang Menyatakan,</div>
                      
                      {/* Stamp placement box */}
                      <div className="border border-dashed border-sky-400 bg-sky-50 text-[8px] text-sky-700 text-center w-20 h-10 flex flex-col justify-center items-center font-sans tracking-wide my-2 rounded self-end mr-6 select-none opacity-85">
                        <span className="font-bold">MATERAI TEMPEL</span>
                        <span className="text-[7px]">Rp 10.000</span>
                      </div>
                      
                      <div className="font-bold text-gray-900 underline mt-1 mr-4">
                        ( {loggedInUser.nama} )
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILE UPLOAD SECTION */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-2 border-b border-gray-150">
            Unggah Berkas Pendukung (Format PDF / JPG, Maks 5MB)
          </h3>

          {/* Ketentuan Berkas Digital */}
          <div className="bg-emerald-50/50 border border-emerald-150 p-4.5 rounded-2xl space-y-2 text-emerald-950 text-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-900 font-sans">
              <Info className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              Ketentuan Unggah Dokumen Administrasi (Format Berkas)
            </div>
            <ul className="list-disc pl-5 space-y-1 font-medium leading-relaxed font-sans text-gray-700">
              <li><strong>Ekstensi File Valid:</strong> Hanya menerima dokumen digital dengan format <strong>PDF (.pdf)</strong> atau Gambar/Foto dengan format <strong>JPG/JPEG (.jpg, .jpeg)</strong> atau <strong>PNG (.png)</strong>.</li>
              <li><strong>Ukuran Maksimal Berkas:</strong> File yang diunggah tidak boleh melebihi batas ukuran <strong>5 Megabytes (5 MB)</strong> secara sistem.</li>
              <li><strong>Kualitas Hasil Scan/Foto:</strong> Dokumen wajib dipindai dalam posisi tegak lurus (berdiri), tidak miring/terbalik, seluruh berkas tidak terpotong, bebas dari noda buram atau bayangan gelap, serta seluruh teks/stempel dinas harus <strong>terbaca dengan sangat jelas</strong> oleh petugas Kelurahan.</li>
              <li><strong>Legalitas Keaslian:</strong> Pengunggahan berkas rekayasa komputer, editan tidak legal, atau penipuan berkas berisiko pembatalan permohonan pelaporan secara langsung dan dapat diproses secara hukum formal.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedService.persyaratan.map((req, i) => {
              const fileKey = req;
              const hasFile = !!files[fileKey];
              const isPernyataanSlot = req.toLowerCase().includes('pernyataan') || req.toLowerCase().includes('materai');
              
              return (
                <div key={i} className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 mb-1.5 flex items-start gap-1 leading-normal">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-gray-800 font-medium">{req}</span> <span className="text-red-500 font-bold">*</span>
                  </span>
                  
                  <div
                    id={`drop-zone-${i}`}
                    onDragEnter={(e) => handleDrag(e, `slot-${i}`)}
                    onDragOver={(e) => handleDrag(e, `slot-${i}`)}
                    onDragLeave={(e) => handleDrag(e, `slot-${i}`)}
                    onDrop={(e) => handleDrop(e, fileKey)}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center flex flex-col items-center justify-center transition-all h-36 relative ${
                      hasFile
                        ? 'border-emerald-250 bg-emerald-50/20'
                        : dragActive === `slot-${i}`
                        ? 'border-emerald-500 bg-emerald-50/10'
                        : isPernyataanSlot
                        ? 'border-amber-250 hover:border-amber-400 bg-amber-50/5'
                        : 'border-gray-250 hover:border-gray-400 bg-gray-55'
                    }`}
                  >
                    {hasFile ? (
                      <div className="text-center space-y-2 w-full px-2">
                        <CheckCircle className="h-6 w-6 mx-auto text-emerald-600 animate-pulse" id={`attached-icon-${i}`} />
                        <p className="text-[10.5px] font-bold text-emerald-800 truncate max-w-[200px] mx-auto leading-none mb-1">
                          {files[fileKey]}
                        </p>
                        <span className="bg-emerald-50 text-[8px] text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider inline-block">
                          E-DOKUMEN TERUNGGAH
                        </span>
                        
                        <div className="flex items-center justify-center gap-3 pt-1 border-t border-dashed border-emerald-100">
                          <button
                            type="button"
                            onClick={() => setPreviewingFile({ reqName: fileKey, fileName: files[fileKey] })}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                            title="Pratinjau dokumen hasil unggah"
                          >
                            <Eye className="h-3 w-3" /> Lihat
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => document.getElementById(`file-replace-raw-${i}`)?.click()}
                            className="text-[10px] text-amber-600 hover:text-amber-800 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                            title="Ganti berkas ini dengan file lain"
                          >
                            <Upload className="h-3 w-3" /> Ganti
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setFiles(prev => { const n = {...prev}; delete n[fileKey]; return n; });
                              setFileContents(prev => { const n = {...prev}; delete n[fileKey]; return n; });
                            }}
                            className="text-[10px] text-red-650 hover:text-red-800 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                            title="Hapus berkas unggahan ini"
                          >
                            <Trash2 className="h-3 w-3" /> Hapus
                          </button>
                        </div>

                        <input
                          type="file"
                          id={`file-replace-raw-${i}`}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(fileKey, e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-gray-500 space-y-1 cursor-pointer relative w-full">
                        <Upload className="h-6 w-6 mx-auto stroke-gray-400" />
                        <p className="text-[11px] font-medium leading-normal">
                          Drag &amp; drop atau <span className="text-emerald-600 font-bold">pilih berkas</span>
                        </p>
                        <div className="text-[8.5px] text-gray-400 uppercase tracking-widest font-semibold truncate max-w-[170px] mx-auto">
                          {req.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.PDF / JPG
                        </div>
                        <input
                          type="file"
                          id={`file-raw-${i}`}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(fileKey, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`file-raw-${i}`)?.click()}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keperluan / Keterangan Form input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
            Keperluaan Penggunaan Surat *
          </label>
          <textarea
            id="keperluan-textarea"
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            required
            className="w-full bg-gray-55 text-gray-900 font-medium rounded-xl border border-gray-250 p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm leading-relaxed"
            placeholder="Tuliskan keperluan penggunaan surat. Contoh: Untuk persyaratan mengurus kartu baru di instansi terkait yang hilang."
          />
        </div>

        {/* Form action triggers */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-150">
          <button
            type="button"
            onClick={onCancel}
            id="cancel-btn"
            className="px-5 py-3 border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-bold text-xs uppercase tracking-widest tracking-wide transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            id="submit-proposal-btn"
            disabled={!readyToSubmit || !keterangan.trim()}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md ${
              readyToSubmit && keterangan.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                : 'bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-250 shadow-none'
            }`}
          >
            Kirim Permohonan
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>

      {/* Citizens View Document Preview Modal */}
      {previewingFile && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60] font-sans animate-fade-in" id="user-file-preview-modal">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-emerald-900 text-white p-4.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-left">
                <FileText className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wide">Hasil Unggahan Berkas Warga</h3>
                  <p className="text-[10px] text-gray-300 font-mono truncate max-w-[260px]">{previewingFile.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingFile(null)}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 bg-gray-100 overflow-y-auto flex-1 flex flex-col items-center animate-fade-in">
              <div className="bg-white shadow-md border border-gray-200 rounded-xl p-5 w-full max-w-sm text-xs leading-relaxed text-gray-800 relative text-left">
                <div className="absolute inset-0 flex items-center justify-center rotate-12 opacity-[0.03] select-none pointer-events-none">
                  <div className="text-gray-900 border-4 border-double border-gray-900 p-4 rounded text-3xl font-black text-center">
                    PASURUAN TRAJENG
                  </div>
                </div>

                 {(() => {
                  const contentData = fileContents[previewingFile.reqName];
                  if (contentData) {
                    const fileNameLower = previewingFile.fileName.toLowerCase();
                    const isImg = contentData.startsWith('data:image/') || 
                                  fileNameLower.endsWith('.jpg') || 
                                  fileNameLower.endsWith('.jpeg') || 
                                  fileNameLower.endsWith('.png') || 
                                  fileNameLower.endsWith('.webp') || 
                                  fileNameLower.endsWith('.gif') || 
                                  fileNameLower.endsWith('.bmp');
                    const isPdfCur = contentData.includes('application/pdf') || 
                                     fileNameLower.endsWith('.pdf');
                    
                    if (isImg) {
                      return (
                        <div className="space-y-3.5 w-full">
                          <div className="border-b border-gray-300 pb-2 flex items-center justify-between">
                            <h4 className="font-extrabold text-gray-950 text-[9.5px] uppercase">BERKAS UNGGAHAN ANDA</h4>
                            <span className="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded-sm">GAMBAR</span>
                          </div>
                          <div className="flex justify-center bg-gray-50 border border-gray-150 p-2 rounded-xl">
                            <img 
                              src={contentData} 
                              alt={previewingFile.fileName} 
                              className="w-full h-auto max-h-[40vh] object-contain rounded-lg shadow-sm"
                            />
                          </div>
                        </div>
                      );
                    } else if (isPdfCur) {
                      return (
                        <div className="space-y-3.5 w-full">
                          <div className="border-b border-gray-300 pb-2 flex items-center justify-between">
                            <h4 className="font-extrabold text-gray-950 text-[9.5px] uppercase font-sans">BERKAS UNGGAHAN ANDA</h4>
                            <span className="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded-sm">PDF/DOKUMEN</span>
                          </div>
                          <iframe 
                            src={contentData} 
                            title={previewingFile.fileName} 
                            className="w-full h-80 rounded-xl border border-gray-255 shadow-inner bg-gray-55"
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-3 text-center py-4 w-full">
                          <div className="text-4xl text-gray-400 mx-auto w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full font-sans">📄</div>
                          <h4 className="font-sans font-bold text-gray-950 text-[10px] truncate max-w-full">{previewingFile.fileName}</h4>
                          <p className="text-[10px] text-gray-500 font-sans">Berkas digital berhasil disimpan dan dikaitkan dengan permohonan Anda.</p>
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 inline-block rounded-lg px-3 py-1 font-bold text-[9px] uppercase tracking-wider font-sans">
                            BERKAS SELESAI DIUNGGAH
                          </div>
                        </div>
                      );
                    }
                  }

                  const reqLower = previewingFile.reqName.toLowerCase();
                  if (reqLower.includes('ktp') || reqLower.includes('kk')) {
                    return (
                      <div className="space-y-3.5">
                        <div className="border-b border-gray-300 pb-2 flex items-center justify-between">
                          <h4 className="font-extrabold text-gray-950 text-[9.5px] uppercase">E-KTP ELEKTRONIK MANDIRI</h4>
                          <span className="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded-sm">DIGITAL PREVIEW</span>
                        </div>
                        <div className="space-y-1.5 font-sans">
                          <p className="font-mono font-bold text-[11px] text-gray-950">NIK : {resident.nik}</p>
                          <p><strong>Nama:</strong> {resident.nama}</p>
                          <p><strong>TTL:</strong> {resident.tempatLahir}, {resident.tanggalLahir}</p>
                          <p><strong>Pekerjaan:</strong> {resident.pekerjaan || 'Wiraswasta'}</p>
                          <p><strong>Alamat:</strong> {resident.alamat} (RT {resident.rt} / RW {resident.rw})</p>
                        </div>
                        <div className="border border-dashed border-emerald-250 bg-emerald-50/30 p-2 rounded text-[9px] text-emerald-800 font-semibold text-center uppercase tracking-wide">
                          ✔ Dokumen KTP Terverifikasi Sistem
                        </div>
                      </div>
                    );
                  } else if (reqLower.includes('pernyataan') || reqLower.includes('materai')) {
                    return (
                      <div className="space-y-3">
                        <div className="border-b border-gray-300 pb-1.5 text-center">
                          <h4 className="font-extrabold text-gray-950 text-[10px] uppercase">SURAT PERNYATAAN KEPENDUDUKAN</h4>
                        </div>
                        <p className="text-[10px] text-gray-650 leading-relaxed text-justify italic font-serif">
                          "Dengan ini saya menyatakan kesahihan seluruh dokumen yang dilampirkan atas nama {resident.nama} tanpa pemalsuan data."
                        </p>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between items-center text-[9px] font-sans">
                          <div>
                            <p className="text-gray-405">Saksi Tetangga:</p>
                            <p className="font-semibold">1. {namaSaksi1}</p>
                            <p className="font-semibold">2. {namaSaksi2}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-sky-50 text-sky-700 font-sans font-bold border border-sky-200 text-[7px] px-1.5 py-0.5 rounded uppercase block mb-1">
                              MATERAI 10000
                            </span>
                            <p className="text-gray-900 font-bold underline">{resident.nama}</p>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 font-sans">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="font-bold text-gray-900 text-[10px] uppercase leading-tight">{previewingFile.reqName}</h4>
                            <span className="text-[8px] text-gray-400 font-mono">DOKUMEN LAMPIRAN SAH</span>
                          </div>
                        </div>
                        <div className="space-y-2 font-sans py-2 text-[10px]">
                          <div><span className="text-gray-400 uppercase font-mono text-[8px] block">NAMA INDIVIDU:</span> <strong className="text-gray-800">{resident.nama}</strong></div>
                          <div><span className="text-gray-400 uppercase font-mono text-[8px] block">NIK WARGA:</span> <strong className="text-gray-800 font-mono">{resident.nik}</strong></div>
                          <div><span className="text-gray-400 uppercase font-mono text-[8px] block">UKURAN BERKAS:</span> <strong className="text-gray-800">2.14 MB (SIAK-PDF)</strong></div>
                          <div><span className="text-gray-400 uppercase font-mono text-[8px] block">TANGGAL UPLOADING:</span> <strong className="text-gray-800">{tanggalSurat}</strong></div>
                        </div>
                        <div className="border border-dashed border-emerald-300 bg-emerald-50/40 p-2.5 rounded-lg flex items-center gap-1.5 font-sans">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-[8px] text-emerald-800 font-extrabold uppercase tracking-wide">
                            SALINAN ASLI DIGITAL RELEVAN &amp; AKTIF
                          </span>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="p-4 border-t border-gray-150 bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPreviewingFile(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
