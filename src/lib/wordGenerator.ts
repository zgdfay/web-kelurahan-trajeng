

export interface PernyataanData {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  pekerjaan: string;
  alamat: string;
  rt: string;
  rw: string;
  barangHilang?: string;
  lokasiKehilangan?: string;
  tanggalKehilangan?: string;
  saksi1: string;
  saksi2: string;
  tanggalSurat: string;
  judulPernyataan?: string;
  detailPernyataan?: string;
}

export function generatePernyataanHTML(data: PernyataanData): string {
  const formattedDate = data.tanggalSurat || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const titleUpper = (data.judulPernyataan || 'SURAT PERNYATAAN').toUpperCase();

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${titleUpper}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11.0in;
          margin: 1.2in 1.0in 1.2in 1.0in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
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
          letter-spacing: 0.5px;
        }
        .intro-text {
          margin-bottom: 14pt;
          text-align: justify;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-left: 20pt;
          margin-bottom: 18pt;
        }
        .data-table td {
          padding: 3pt 0pt;
          vertical-align: top;
        }
        .label-col {
          width: 180px;
        }
        .colon-col {
          width: 15px;
          text-align: center;
        }
        .declared-text {
          text-align: justify;
          text-indent: 36pt;
          margin-bottom: 12pt;
        }
        .loss-details-box {
          border: 1px solid #000000;
          padding: 10pt;
          margin: 10pt 20pt 15pt 20pt;
          background-color: #fafafa;
          font-style: italic;
        }
        .closing-text {
          text-align: justify;
          text-indent: 36pt;
          margin-bottom: 30pt;
        }
        .bottom-table {
          width: 100%;
          border-collapse: collapse;
          page-break-inside: avoid;
        }
        .bottom-table td {
          vertical-align: top;
        }
        .saksi-title {
          font-weight: bold;
          margin-bottom: 6pt;
        }
        .saksi-list {
          margin-top: 4pt;
          margin-bottom: 15pt;
        }
        .saksi-item {
          margin-bottom: 60pt;
        }
        .stamp-area {
          border: 1px dashed #777777;
          width: 110px;
          height: 65px;
          text-align: center;
          vertical-align: middle;
          font-size: 8pt;
          color: #555555;
          margin: 15pt 0pt 15pt 40pt;
          padding-top: 15pt;
          background-color: #f9f9f9;
        }
        .signer-name {
          font-weight: bold;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="header-title">${titleUpper}</div>
      
      <div class="intro-text">Yang bertanda tangan di bawah ini :</div>
      
      <table class="data-table">
        <tr>
          <td class="label-col">Nama</td>
          <td class="colon-col">:</td>
          <td><strong>${data.nama}</strong></td>
        </tr>
        <tr>
          <td class="label-col">NIK</td>
          <td class="colon-col">:</td>
          <td>${data.nik}</td>
        </tr>
        <tr>
          <td class="label-col">Tempat, Tanggal Lahir</td>
          <td class="colon-col">:</td>
          <td>${data.tempatLahir}, ${data.tanggalLahir}</td>
        </tr>
        <tr>
          <td class="label-col">Pekerjaan</td>
          <td class="colon-col">:</td>
          <td>${data.pekerjaan || '-'}</td>
        </tr>
        <tr>
          <td class="label-col">Alamat domisili</td>
          <td class="colon-col">:</td>
          <td>${data.alamat} (RT ${data.rt} / RW ${data.rw}), Kelurahan Trajeng, Kota Pasuruan</td>
        </tr>
      </table>

      <div class="declared-text">
        Dengan ini menyatakan bahwa saya yang beridentitas sebagaimana tersebut di atas, memberikan pernyataan dengan sebenarnya berkaitan dengan pengajuan <strong>${titleUpper}</strong> dengan perincian keterangan sebagai berikut:
      </div>

      <div class="loss-details-box">
        ${data.detailPernyataan ? `<strong>Rincian Pernyataan Tambahan:</strong><br/>${data.detailPernyataan}` : `
        <strong>Nama Dokumen/Barang Hilang:</strong> ${data.barangHilang || '-'}<br/>
        <strong>Lokasi Kejadian perkiraan:</strong> ${data.lokasiKehilangan || '-'}<br/>
        <strong>Tanggal Hilang perkiraan:</strong> ${data.tanggalKehilangan || '-'}
        `}
      </div>

      <div class="declared-text">
        Seluruh keterangan dan dokumen pendukung yang saya sampaikan dalam permohonan ini adalah benar adanya. Apabila di kemudian hari ditemukan ketidaksesuaian, pemalsuan, atau hal yang tidak benar dalam pernyataan ini, saya bersedia mempertanggungjawabkannya sesuai ketentuan hukum dan perundang-undangan yang berlaku di Negara Republik Indonesia.
      </div>

      <div class="closing-text">
        Demikian surat pernyataan ini saya buat dengan sebenarnya dengan kesadaran penuh tanpa ada tekanan atau paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.
      </div>

      <table class="bottom-table">
        <tr>
          <td style="width: 50%;">
            <div class="saksi-title">SAKSI-SAKSI KETETANGGAAN:</div>
            <ol class="saksi-list" style="margin-bottom: 5pt; padding-left: 15pt;">
              <li style="margin-bottom: 8pt;">
                Saksi I: <strong>${data.saksi1 || '-'}</strong>
              </li>
              <li style="margin-bottom: 8pt;">
                Saksi II: <strong>${data.saksi2 || '-'}</strong>
              </li>
            </ol>
          </td>
          <td style="width: 50%; text-align: right; padding-right: 20pt;">
            <div>Pasuruan, ${formattedDate}</div>
            <div style="margin-top: 5pt; margin-right: 40pt;">Yang Menyatakan,</div>
            
            <div class="stamp-area" style="text-align: center; float: right; margin-right: 35pt;">
              Materai<br/>
              Rp 10.000
            </div>
            <div style="clear: both; height: 10pt;"></div>
            
            <div style="margin-top: 25pt; margin-right: 20pt;">
              <span class="signer-name">( ${data.nama} )</span>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function downloadWordFile(data: PernyataanData): void {
  const content = generatePernyataanHTML(data);
  const blob = new Blob(['\ufeff' + content], {
    type: 'application/msword;charset=utf-8'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const cleanName = data.nama.replace(/[^a-zA-Z0-9]/g, '_');
  const filePrefix = (data.judulPernyataan || 'Surat_Pernyataan').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  link.download = `${filePrefix}_${cleanName}.doc`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
