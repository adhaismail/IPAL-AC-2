# BUMI — Building Maintenance Integrated
### Panduan Lengkap Setup & Deploy

---

## 📁 Struktur Folder Project

```
bumi/
├── index.html          ← Halaman utama (semua halaman dalam 1 file)
├── style.css           ← Seluruh styling (light/dark mode, responsive)
├── script.js           ← Logic aplikasi (login, form, validasi, submit)
├── Code.gs             ← Google Apps Script backend (copy ke GAS)
└── README.md           ← Panduan ini
```

---

## 👤 Akun Demo (Hardcoded)

| Nama    | NIK  | Password | Role         | Akses Form        |
|---------|------|----------|--------------|-------------------|
| Saepul  | 1111 | ipal123  | Teknisi IPAL | Form Monitoring IPAL |
| Nasikin | 2222 | ac123    | Teknisi AC   | Form Maintenance AC  |

---

## 🗂 Struktur Google Spreadsheet

Gunakan **1 spreadsheet** dengan **2 sheet**:

### Sheet 1: "Monitoring IPAL"
| Kolom | Isi |
|-------|-----|
| A | Timestamp Sistem |
| B | Tanggal Monitoring |
| C | Waktu Monitoring |
| D | Nama Teknisi |
| E | NIK Teknisi |
| F | Flowmeter Inlet |
| G | Debit Inlet (m³) |
| H | Flowmeter Outlet |
| I | Debit Outlet (m³) |
| J | Flowmeter RAS |
| K | Debit RAS (m³) |
| L | Flowmeter Recycle |
| M | Debit Recycle (m³) |
| N | pH Ekualisasi 2 |
| O | Suhu Ekualisasi 2 |
| P | pH Anaerob |
| Q | Suhu Anaerob |
| R | pH Aerasi 1 |
| S | SVI30 Aerasi 1 |
| T | pH Aerasi 2 |
| U | SVI30 Aerasi 2 |
| V | pH Aerasi 4 |
| W | SVI30 Aerasi 4 |
| X | pH Outlet |
| Y | Suhu Outlet |
| Z | Foto SVI30 (URL/keterangan) |
| AA | Deskripsi Gangguan/Kondisi IPAL |

### Sheet 2: "Maintenance AC"
| Kolom | Isi |
|-------|-----|
| A | Timestamp Sistem |
| B | Tanggal Pelaporan |
| C | Waktu Pelaporan |
| D | Nama Teknisi |
| E | NIK Teknisi |
| F | Unit AC |
| G | Jenis Gangguan |
| H | Waktu Mulai Kerusakan |
| I | Foto Kerusakan (URL/keterangan) |
| J | Deskripsi Kerusakan |
| K | Tindakan Perbaikan |
| L | Deskripsi Perbaikan |
| M | Foto Setelah Perbaikan (URL/keterangan) |
| N | Gangguan Kembali (15 menit) |

---

## ⚙️ Cara Connect ke Google Spreadsheet

### Langkah 1 — Buat Google Spreadsheet
1. Buka [sheets.google.com](https://sheets.google.com)
2. Buat spreadsheet baru, beri nama **"BUMI Data"**
3. Copy **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[INI-SPREADSHEET-ID]/edit
   ```

### Langkah 2 — Setup Google Apps Script
1. Di spreadsheet, klik **Extensions > Apps Script**
2. Hapus semua kode default
3. **Paste seluruh isi `Code.gs`** ke editor
4. Ganti nilai `SPREADSHEET_ID`:
   ```javascript
   const SPREADSHEET_ID = 'paste-id-spreadsheet-anda-di-sini';
   ```
5. Klik **Run > testConnection** untuk memverifikasi
6. Izinkan akses saat muncul dialog permission

### Langkah 3 — Deploy Web App
1. Klik **Deploy > New Deployment**
2. Klik ikon ⚙️ lalu pilih **Web App**
3. Isi konfigurasi:
   - **Description**: BUMI Backend v1
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
4. Klik **Deploy**
5. **Copy URL** yang muncul (format: `https://script.google.com/macros/s/xxxxx/exec`)

### Langkah 4 — Connect ke Website BUMI
1. Buka `script.js`
2. Cari baris:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. Ganti dengan URL yang Anda copy:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/AKfycbxxxx/exec';
   ```
4. Simpan file

---

## 🚀 Cara Deploy Website

### Opsi A — Buka Langsung (Paling Mudah)
1. Simpan semua file (`index.html`, `style.css`, `script.js`) dalam 1 folder
2. Buka `index.html` langsung di browser

> ⚠️ Untuk submit ke Google Sheets, perlu dihosting di web server (bukan file://)

### Opsi B — GitHub Pages (Gratis)
1. Upload folder ke GitHub repository
2. Buka **Settings > Pages**
3. Pilih branch `main`, folder `/root`
4. Website live di: `https://username.github.io/bumi`

### Opsi C — Netlify (Gratis, Mudah)
1. Buka [netlify.com](https://netlify.com)
2. Drag & drop folder project ke dashboard
3. Website live otomatis dengan URL custom

### Opsi D — Vercel (Gratis)
```bash
npm install -g vercel
cd bumi/
vercel
```

### Opsi E — Server Lokal
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```
Buka: `http://localhost:8080`

---

## 📸 Fitur Foto/Upload ke Google Drive (Opsional)

Agar foto tersimpan ke Google Drive:
1. Buat folder di Google Drive
2. Copy **Folder ID** dari URL: `https://drive.google.com/drive/folders/[FOLDER-ID]`
3. Di `Code.gs`, isi:
   ```javascript
   const DRIVE_FOLDER_ID = 'paste-folder-id-anda';
   ```
4. Re-deploy Apps Script

---

## 🔒 Catatan Keamanan

- Akun dummy (NIK + password) tersimpan di `script.js` — cocok untuk internal/intranet
- Untuk production: implementasikan backend authentication yang proper
- Google Apps Script Web App yang di-deploy sebagai "Anyone" dapat diakses siapa saja yang tahu URL-nya — jaga kerahasiaan URL

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Form submit tidak masuk ke spreadsheet | Pastikan GAS_URL sudah diisi dan diakses via HTTP (bukan `file://`) |
| "Script needs authorization" | Jalankan `testConnection()` di GAS editor dan izinkan permission |
| Foto tidak tersimpan ke Drive | Pastikan `DRIVE_FOLDER_ID` diisi dan Apps Script memiliki akses Drive |
| Dark mode tidak menyimpan | Pastikan localStorage tersedia (tidak incognito mode) |
| AC dropdown kosong | Normal jika form AC belum pernah dibuka — akan terisi otomatis saat login sebagai Teknisi AC |

---

## 📞 Info Teknis

- **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript ES2022
- **Backend**: Google Apps Script (V8 Runtime)
- **Database**: Google Sheets
- **Font**: Manrope + Poppins (Google Fonts)
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: Responsive, tested on iOS Safari & Android Chrome

---

*BUMI v1.0 © 2025 — PT. Industri Nusantara*
