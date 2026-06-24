export type ServiceStatus = 'pending' | 'diproses' | 'selesai' | 'ditolak';

export interface UserAccount {
  id: string;
  nama: string;
  nik: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  status: 'aktif' | 'tidak aktif' | 'ditolak';
  ktpPhotoUrl?: string; // base64 or placeholder URL
  pasfotoUrl?: string; // base64 or placeholder URL
  rejectionReason?: string;
}


export type ServiceType = 
  | 'sankem'
  | 'akte_kematian'
  | 'akte_kelahiran'
  | 'kk_baru'
  | 'kia_ktp'
  | 'pindah_keluar'
  | 'pindah_masuk'
  | 'domisili_tinggal'
  | 'domisili_usaha'
  | 'ket_usaha'
  | 'sktm'
  | 'belum_menikah'
  | 'beda_nama'
  | 'tanggal_lahir'
  | 'kehilangan'
  | 'lainnya';



export interface ServiceApplication {
  id: string;
  nik: string;
  nama: string;
  jenisPelayanan: ServiceType;
  tanggalPengajuan: string;
  status: ServiceStatus;
  keterangan: string;
  hasPernyataan: boolean;
  pernyataanData?: {
    judulPernyataan?: string;
    narasiPernyataan?: string;
    namaPlaceholder?: string;
    nikPlaceholder?: string;
    barangHilang?: string;
    tempatKehilangan?: string;
    tanggalKehilangan?: string;
    pekerjaanSaksi1?: string;
    alamatSaksi1?: string;
    namaSaksi1?: string;
    namaSaksi2?: string;
    pekerjaanSaksi2?: string;
    alamatSaksi2?: string;
    tanggalSurat?: string;
    detailPernyataan?: string; // used for general pernyataan
  };
  uploadedFiles?: { [key: string]: string };
  fileContents?: { [key: string]: string };
}

export interface ServiceDetail {
  id: ServiceType;
  title: string;
  icon: string;
  deskripsi: string;
  persyaratan: string[];
  kategori: 'kependudukan' | 'keterangan_pernyataan';
}

export const DAFTAR_PELAYANAN: ServiceDetail[] = [
  {
    id: 'sankem',
    title: 'PERSYARATAN SANKEM (Rangkap 4)',
    icon: 'HeartHandshake',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan pengurusan dana Santunan Kematian (SANKEM) bagi warga Kelurahan Trajeng Kota Pasuruan.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Permohonan dari Kelurahan (TTD Stampel Kelurahan)',
      'Surat Pernyataan Tanggung Jawab',
      'Print out Data Kemiskinan An.Almarhum (TTD Stampel Kelurahan)',
      'Foto Copy Akte Kematian (5 Lembar)',
      'Foto Copy KK + KTP Ahli Waris (5 Lembar)',
      'Foto Copy Buku Rekening Bank Jatim Aktif An. Ahli Waris (5 Lembar)'
    ]
  },
  {
    id: 'akte_kematian',
    title: 'PERSYARATAN AKTE KEMATIAN',
    icon: 'ShieldAlert',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan pengurusan Akte Kematian resmi rujukan dinas kependudukan dan pencatatan sipil.',
    persyaratan: [
      'Pengantar RT/RW',
      'Foto Copy KK+ KTP Jenazah',
      'Surat Meninggal dari Rumah Sakit',
      'Foto Copy KTP Pelapor + Asli (Satu KK)',
      'Foto Copy KTP Saksi 2 Orang'
    ]
  },
  {
    id: 'akte_kelahiran',
    title: 'PERSYARATAN PEMBUATAN AKTE KELAHIRAN',
    icon: 'Baby',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan pengurusan Akte Kelahiran baru bagi bayi/anak warga Kelurahan Trajeng Pasuruan.',
    persyaratan: [
      'Pengantar RT/RW',
      'Foto Copy KK + KTP Ortu',
      'Kenal Lahir Asli',
      'Foto Copy Buku Nikah',
      'Foto Copy KTP Saksi 2 Orang',
      '(Formulir Pelaporan Pencatatan Sipil di Dalam Wilayah NKRI) 3'
    ]
  },
  {
    id: 'kk_baru',
    title: 'PERSYARATAN KK BARU',
    icon: 'Scroll',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan penerbitan Kartu Keluarga (KK) Baru akibat penambahan anggota keluarga, pernikahan, atau pemisahan KK.',
    persyaratan: [
      'Pengantar RT/RW',
      'Foto Copy Akte Lahir',
      'Foto Copy Ijasah Terakhir',
      'Foto Copy Buku Nikah',
      '(Formulir Pendaftaran Peristiwa Penduduk)'
    ]
  },
  {
    id: 'kia_ktp',
    title: 'PERSYARATAN KIA/KTP',
    icon: 'Contact',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan pembuatan atau pencetakan Kartu Identitas Anak (KIA) dan Kartu Tanda Penduduk (KTP) El.',
    persyaratan: [
      'Pengantar RT/RW',
      'Foto Copy KK/KTP Ortu',
      'Foto Copy Akte Kelahiran',
      '(Formulir Pendaftaran Peristiwa Penduduk)'
    ]
  },
  {
    id: 'pindah_keluar',
    title: 'PERSYARATAN PINDAH KELUAR',
    icon: 'ArrowUpRight',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan permohonan surat keterangan pindah keluar dari wilayah administrasi Kelurahan Trajeng.',
    persyaratan: [
      'Pengantar RT/RW',
      'Foto Copy KK + KTP',
      'KK/KTP Asli',
      'Alamat Tujuan',
      '(Formulir Pendaftaran Peristiwa Penduduk)'
    ]
  },
  {
    id: 'pindah_masuk',
    title: 'PERSYARATAN PINDAH MASUK',
    icon: 'ArrowDownLeft',
    kategori: 'kependudukan',
    deskripsi: 'Pelayanan penerimaan warga baru yang pindah masuk ke wilayah administrasi Kelurahan Trajeng Pasuruan.',
    persyaratan: [
      'Surat Pindah (Asli)',
      'Foto Copy KK + KTP Asli',
      'Foto Copy Ijasah Terakhir',
      'Foto Copy Akte Kelahiran',
      'Foto Copy Buku Nikah'
    ]
  },
  {
    id: 'domisili_tinggal',
    title: 'SURAT KETERANGAN DOMISILI (TEMPAT TINGGAL)',
    icon: 'Home',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Pelayanan pengantar Surat Keterangan Domisili Tempat Tinggal Warga secara mandiri.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'domisili_usaha',
    title: 'SURAT KETERANGAN DOMISILI (USAHA)',
    icon: 'Store',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Pelayanan pengantar Surat Keterangan Domisili tempat menjalankan usaha di Kelurahan Trajeng Pasuruan.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'ket_usaha',
    title: 'SURAT KETERANGAN USAHA',
    icon: 'Briefcase',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Penerbitan Surat Keterangan Usaha (SKU) resmi untuk modal, perbankan, dan pengesahan kepemilikan usaha.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'sktm',
    title: 'SURAT KETERANGAN TIDAK MAMPU',
    icon: 'Heart',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Penerbitan bukti Surat Keterangan Tidak Mampu (SKTM) untuk keringanan sekolah, beasiswa, kesehatan, dsb.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'belum_menikah',
    title: 'SURAT KETERANGAN BELUM MENIKAH',
    icon: 'HeartHandshake',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Pelayanan Keterangan Belum Menikah untuk melengkapi prasyarat pencatatan nikah atau pekerjaan kuota lajang.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'beda_nama',
    title: 'SURAT KETERANGAN BEDA NAMA',
    icon: 'Type',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Pengantar permohonan penyamaan atau penerbitan keterangan beda ejaan/nama pada dokumen kepemilikan aset/sipil.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'tanggal_lahir',
    title: 'SURAT KETERANGAN TANGGAL LAHIR',
    icon: 'Calendar',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Pernyataan pelaporan ralat kekeliruan pencantuman tanggal lahir antar berkas ijazah/akta/KTP sipil.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'kehilangan',
    title: 'SURAT KETERANGAN KEHILANGAN',
    icon: 'FileQuestion',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Dapatkan Surat Pengantar Kehilangan dokumen berharga seperti KTP, KK, Akte kelahiran, Buku Rekening Mandiri.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  },
  {
    id: 'lainnya',
    title: 'SURAT KETERANGAN LAINNYA',
    icon: 'MoreHorizontal',
    kategori: 'keterangan_pernyataan',
    deskripsi: 'Surat Keterangan Admisitrasi Lainnya yang membutuhkan verifikasi kebenaran data di atas materai Rp. 10.000.',
    persyaratan: [
      'Pengantar RT/RW',
      'Surat Pernyataan Materai 10.000',
      'Foto Copy KK/KTP'
    ]
  }
];
