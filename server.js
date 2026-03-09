const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

// Create tables
function createTables() {
    // Tabel untuk data pendaftaran
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        npm TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        telepon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel untuk data pembayaran
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        material_name TEXT NOT NULL,
        material_code TEXT NOT NULL,
        package_name TEXT NOT NULL,
        price INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_id TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
}

// Routes

// Endpoint untuk pendaftaran
app.post('/api/register', (req, res) => {
    const { nama, npm, email, telepon } = req.body;

    if (!nama || !npm || !email) {
        return res.status(400).json({ error: 'Nama, NPM, dan Email wajib diisi' });
    }

    const sql = 'INSERT INTO users (nama, npm, email, telepon) VALUES (?, ?, ?, ?)';
    db.run(sql, [nama, npm, email, telepon], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'NPM atau Email sudah terdaftar' });
            }
            return res.status(500).json({ error: 'Gagal mendaftarkan pengguna' });
        }
        res.json({ message: 'Pendaftaran berhasil', userId: this.lastID });
    });
});

// Endpoint untuk login (cek NPM atau Email)
app.post('/api/login', (req, res) => {
    const { npm } = req.body;

    if (!npm) {
        return res.status(400).json({ error: 'NPM/Email wajib diisi' });
    }

    // Cek apakah input adalah email atau npm
    const isEmail = npm.includes('@');
    const sql = isEmail
        ? 'SELECT * FROM users WHERE email = ?'
        : 'SELECT * FROM users WHERE npm = ?';

    db.get(sql, [npm], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal login' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }
        res.json({ message: 'Login berhasil', user: row });
    });
});

// Endpoint untuk pembayaran
app.post('/api/payment', (req, res) => {
    const { userId, materialName, materialCode, packageName, price, paymentMethod } = req.body;

    if (!userId || !materialName || !materialCode || !packageName || !price || !paymentMethod) {
        return res.status(400).json({ error: 'Semua field pembayaran wajib diisi' });
    }

    // Generate transaction ID sederhana
    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);

    const sql = `INSERT INTO payments (user_id, material_name, material_code, package_name, price, payment_method, transaction_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [userId, materialName, materialCode, packageName, price, paymentMethod, transactionId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Gagal memproses pembayaran' });
        }
        res.json({ message: 'Pembayaran berhasil diproses', transactionId: transactionId });
    });
});

// Endpoint untuk mendapatkan data pembayaran user
app.get('/api/payments/:userId', (req, res) => {
    const { userId } = req.params;

    const sql = 'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC';
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal mengambil data pembayaran' });
        }
        res.json({ payments: rows });
    });
});

// Endpoint untuk melihat semua data users (untuk admin/debugging)
app.get('/api/admin/users', (req, res) => {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal mengambil data users' });
        }
        res.json({ 
            message: 'Data pengguna berhasil diambil',
            count: rows.length,
            users: rows 
        });
    });
});

// Endpoint untuk melihat semua data payments (untuk admin/debugging)
app.get('/api/admin/payments', (req, res) => {
    const sql = 'SELECT * FROM payments ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal mengambil data payments' });
        }
        res.json({ 
            message: 'Data pembayaran berhasil diambil',
            count: rows.length,
            payments: rows 
        });
    });
});

// Endpoint untuk melihat dashboard admin
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Dashboard - Database UNISKA</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #2c7be5; text-align: center; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-box { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; flex: 1; margin: 0 10px; }
                .stat-number { font-size: 2em; font-weight: bold; color: #27ae60; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #2c7be5; color: white; }
                tr:hover { background: #f8f9fa; }
                .refresh-btn { background: #27ae60; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0; }
                .refresh-btn:hover { background: #229954; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🗄️ Admin Dashboard - Database UNISKA</h1>
                
                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-number" id="userCount">-</div>
                        <div>Total Pengguna</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="paymentCount">-</div>
                        <div>Total Pembayaran</div>
                    </div>
                </div>

                <button class="refresh-btn" onclick="loadData()">🔄 Refresh Data</button>

                <h2>👥 Data Pengguna Terdaftar</h2>
                <table id="usersTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>NPM</th>
                            <th>Email</th>
                            <th>Program</th>
                            <th>Tanggal Daftar</th>
                        </tr>
                    </thead>
                    <tbody id="usersBody">
                        <tr><td colspan="6">Loading...</td></tr>
                    </tbody>
                </table>

                <h2>💳 Data Pembayaran</h2>
                <table id="paymentsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User ID</th>
                            <th>Materi</th>
                            <th>Paket</th>
                            <th>Harga</th>
                            <th>Metode</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody id="paymentsBody">
                        <tr><td colspan="9">Loading...</td></tr>
                    </tbody>
                </table>
            </div>

            <script>
                async function loadData() {
                    try {
                        // Load users data
                        const usersResponse = await fetch('/api/admin/users');
                        const usersData = await usersResponse.json();
                        
                        // Load payments data
                        const paymentsResponse = await fetch('/api/admin/payments');
                        const paymentsData = await paymentsResponse.json();
                        
                        // Update stats
                        document.getElementById('userCount').textContent = usersData.count;
                        document.getElementById('paymentCount').textContent = paymentsData.count;
                        
                        // Update users table
                        const usersBody = document.getElementById('usersBody');
                        if (usersData.users.length === 0) {
                            usersBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Belum ada data pengguna</td></tr>';
                        } else {
                            usersBody.innerHTML = usersData.users.map(user => 
                                \`<tr>
                                    <td>\${user.id}</td>
                                    <td>\${user.nama}</td>
                                    <td>\${user.npm}</td>
                                    <td>\${user.email}</td>
                                    <td>\${user.telepon}</td>
                                    <td>\${user.created_at}</td>
                                </tr>\`
                            ).join('');
                        }
                        
                        // Update payments table
                        const paymentsBody = document.getElementById('paymentsBody');
                        if (paymentsData.payments.length === 0) {
                            paymentsBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Belum ada data pembayaran</td></tr>';
                        } else {
                            paymentsBody.innerHTML = paymentsData.payments.map(payment => 
                                \`<tr>
                                    <td>\${payment.id}</td>
                                    <td>\${payment.user_id}</td>
                                    <td>\${payment.material_name}</td>
                                    <td>\${payment.package_name}</td>
                                    <td>Rp \${payment.price.toLocaleString('id-ID')}</td>
                                    <td>\${payment.payment_method}</td>
                                    <td>\${payment.transaction_id}</td>
                                    <td>\${payment.status}</td>
                                    <td>\${payment.created_at}</td>
                                </tr>\`
                            ).join('');
                        }
                        
                    } catch (error) {
                        console.error('Error loading data:', error);
                        alert('Gagal memuat data. Pastikan server berjalan.');
                    }
                }
                
                // Load data when page loads
                loadData();
                
                // Auto refresh every 30 seconds
                setInterval(loadData, 30000);
            </script>
        </body>
        </html>
    `);
});

// Start server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});