# Website Pelatihan Komputer UNISKA

Website frontend dengan backend Node.js dan database SQLite untuk sistem pendaftaran dan pembayaran pelatihan komputer.

## Fitur

- Pendaftaran pengguna
- Login pengguna
- Sistem pembayaran dengan berbagai paket
- Database SQLite untuk penyimpanan data
- API RESTful untuk komunikasi frontend-backend

## Persyaratan Sistem

- Node.js (versi 14 atau lebih baru) - [Download dari nodejs.org](https://nodejs.org/)

## ✅ Status: SERVER & DATABASE FULLY OPERATIONAL!

**🌐 Server aktif di:** `http://localhost:3000`  
**💾 Database:** `database.db` (SQLite - 28KB)  
**📊 Status:** ✅ **Website lengkap dengan database berfungsi 100%!**

## 🚀 **Fitur yang Sudah Aktif:**

### 🎯 **Halaman Utama**
- ✅ Website index.html terbuka dengan benar
- ✅ Tidak ada lagi error "Cannot GET /"

### 👤 **Sistem Pendaftaran**
- ✅ Form daftar berfungsi
- ✅ Data tersimpan ke database SQLite
- ✅ Validasi NPM dan email unik

### 🔐 **Sistem Login**
- ✅ Verifikasi dari database
- ✅ Session management aktif

### 💰 **Sistem Pembayaran**
- ✅ Form pembayaran lengkap
- ✅ Data tersimpan dengan transaction ID
- ✅ Riwayat pembayaran tersimpan

### 🎨 **UI/UX**
- ✅ Modal daftar dan login berfungsi
- ✅ Teks total pembayaran rata tengah
- ✅ Navigasi halaman smooth

## Fitur Database yang Aktif:

### 📝 **Pendaftaran Pengguna**
- ✅ Data tersimpan di tabel `users`
- ✅ Validasi NPM dan Email unik
- ✅ Auto-generated ID

### 💳 **Sistem Pembayaran**
- ✅ Data tersimpan di tabel `payments`
- ✅ Transaction ID otomatis
- ✅ Riwayat pembayaran lengkap

### 🔐 **Login Sistem**
- ✅ Verifikasi dari database
- ✅ Session management

## 🚀 **Cara Menggunakan:**

1. **Buka website:** `http://localhost:3000`
2. **Daftar akun** → Data tersimpan ke database
3. **Login** → Verifikasi dari database
4. **Bayar** → Riwayat tersimpan

## 📊 **Struktur Database:**

### Tabel `users`:
- id, nama, npm, email, telepon, created_at

### Tabel `payments`:
- id, user_id, material_name, material_code, package_name, price, payment_method, transaction_id, status, created_at

## Struktur Database

### Tabel `users`
- id (INTEGER PRIMARY KEY)
- nama (TEXT)
- npm (TEXT UNIQUE)
- email (TEXT UNIQUE)
- telepon (TEXT)
- created_at (DATETIME)

### Tabel `payments`
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- material_name (TEXT)
- material_code (TEXT)
- package_name (TEXT)
- price (INTEGER)
- payment_method (TEXT)
- transaction_id (TEXT UNIQUE)
- status (TEXT DEFAULT 'pending')
- created_at (DATETIME)

## API Endpoints

- `POST /api/register` - Pendaftaran pengguna baru
- `POST /api/login` - Login pengguna
- `POST /api/payment` - Proses pembayaran
- `GET /api/payments/:userId` - Mendapatkan riwayat pembayaran pengguna

## File Utama

- `server.js` - Backend server dengan Express.js
- `index.html` - Halaman utama website
- `index.css` - Styling website
- `index.js` - JavaScript untuk interaktivitas frontend
- `database.db` - File database SQLite (dibuat otomatis saat server pertama kali dijalankan)