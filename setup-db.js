import mysql from 'mysql2/promise';
import 'dotenv/config'; // Load env variables

async function setupDatabase() {
  console.log('Memulai inisialisasi database...');

  try {
    // Koneksi ke server MySQL (tanpa menentukan database terlebih dahulu)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      ssl: {
        rejectUnauthorized: true
      }
    });

    console.log('Terhubung ke server MySQL.');

    const dbName = process.env.DB_NAME || 'db_kelurahan';

    // Membuat Database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database \`${dbName}\` berhasil dibuat atau sudah ada.`);

    // Beralih menggunakan database tersebut
    await connection.query(`USE \`${dbName}\``);

    // 1. Membuat tabel Users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        nik VARCHAR(20) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        status ENUM('aktif', 'tidak aktif') NOT NULL DEFAULT 'aktif'
      )
    `);
    console.log('Tabel `users` siap.');

    // 2. Membuat tabel Residents (Profil Warga)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS residents (
        nik VARCHAR(20) PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        tempatLahir VARCHAR(100) DEFAULT '',
        tanggalLahir VARCHAR(50) DEFAULT '',
        pekerjaan VARCHAR(100) DEFAULT '',
        alamat VARCHAR(255) DEFAULT '',
        rt VARCHAR(10) DEFAULT '',
        rw VARCHAR(10) DEFAULT '',
        telepon VARCHAR(20) DEFAULT '',
        email VARCHAR(100) DEFAULT ''
      )
    `);
    console.log('Tabel `residents` siap.');

    // 3. Membuat tabel Applications (Pengajuan Layanan)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY,
        nik VARCHAR(20) NOT NULL,
        nama VARCHAR(100) NOT NULL,
        jenisPelayanan VARCHAR(50) NOT NULL,
        tanggalPengajuan VARCHAR(50) NOT NULL,
        status ENUM('pending', 'diproses', 'selesai', 'ditolak') NOT NULL DEFAULT 'pending',
        keterangan TEXT,
        hasPernyataan BOOLEAN DEFAULT FALSE,
        pernyataanData TEXT,
        uploadedFiles TEXT,
        fileContents LONGTEXT
      )
    `);
    console.log('Tabel `applications` siap.');

    // Menambahkan Admin Default (Opsional, jika ingin langsung ada admin)
    const [adminExist] = await connection.query('SELECT * FROM users WHERE username = "admin"');
    if (adminExist.length === 0) {
      await connection.query(`
        INSERT INTO users (id, nama, nik, username, password, role, status)
        VALUES ('USR-admin123', 'Administrator Kelurahan', '0000000000000000', 'admin', 'admin123', 'admin', 'aktif')
      `);
      console.log('User Admin default berhasil ditambahkan (username: admin, password: admin123).');
    }

    console.log('Inisialisasi database BERHASIL secara keseluruhan!');
    await connection.end();

  } catch (error) {
    console.error('Terjadi kesalahan saat mengatur database:', error);
  }
}

setupDatabase();
