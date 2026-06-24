import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_kelurahan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection on Startup
pool.getConnection()
  .then((conn) => {
    console.log('✅ Berhasil terhubung ke database MySQL (db_kelurahan)');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Gagal terhubung ke MySQL. Pastikan XAMPP dan MySQL menyala, dan setup-db.js sudah dijalankan.', err);
  });

// ==========================================
// API ENDPOINTS FOR USERS
// ==========================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user
app.post('/api/users', async (req, res) => {
  try {
    const { id, nama, nik, username, password, role, status, ktpPhotoUrl, pasfotoUrl, rejectionReason } = req.body;
    const query = `
      INSERT INTO users (id, nama, nik, username, password, role, status, ktpPhotoUrl, pasfotoUrl, rejectionReason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      id, nama, nik, username, password, role || 'user', status || 'aktif',
      ktpPhotoUrl || null, pasfotoUrl || null, rejectionReason || null
    ]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, username, password, role, status, ktpPhotoUrl, pasfotoUrl, rejectionReason } = req.body;
    const query = `
      UPDATE users 
      SET nama=?, nik=?, username=?, password=?, role=?, status=?, ktpPhotoUrl=?, pasfotoUrl=?, rejectionReason=?
      WHERE id=?
    `;
    await pool.query(query, [
      nama, nik, username, password, role, status,
      ktpPhotoUrl || null, pasfotoUrl || null, rejectionReason || null,
      id
    ]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id=?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ==========================================
// API ENDPOINTS FOR APPLICATIONS
// ==========================================

app.get('/api/applications', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications ORDER BY tanggalPengajuan DESC');

    // Parse JSON fields back to objects
    const applications = rows.map(row => ({
      ...row,
      hasPernyataan: row.hasPernyataan === 1,
      pernyataanData: row.pernyataanData ? JSON.parse(row.pernyataanData) : undefined,
      uploadedFiles: row.uploadedFiles ? JSON.parse(row.uploadedFiles) : undefined,
      fileContents: row.fileContents ? JSON.parse(row.fileContents) : undefined
    }));

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const {
      id, nik, nama, jenisPelayanan, tanggalPengajuan, status,
      keterangan, hasPernyataan, pernyataanData, uploadedFiles, fileContents
    } = req.body;

    const query = `
      INSERT INTO applications 
      (id, nik, nama, jenisPelayanan, tanggalPengajuan, status, keterangan, hasPernyataan, pernyataanData, uploadedFiles, fileContents)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      id, nik, nama, jenisPelayanan, tanggalPengajuan, status, keterangan,
      hasPernyataan ? 1 : 0,
      pernyataanData ? JSON.stringify(pernyataanData) : null,
      uploadedFiles ? JSON.stringify(uploadedFiles) : null,
      fileContents ? JSON.stringify(fileContents) : null
    ]);

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, keterangan } = req.body;

    const query = `UPDATE applications SET status=?, keterangan=? WHERE id=?`;
    await pool.query(query, [status, keterangan, id]);

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 API Server berjalan di http://localhost:${PORT}`);
});
