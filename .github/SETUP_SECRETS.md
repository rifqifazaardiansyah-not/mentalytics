# Setup GitHub Secrets untuk Keep-Alive Workflow

## 📋 Langkah-langkah Setup

### 1. Buka Repository Settings
1. Buka repository di GitHub
2. Klik **Settings** (tab paling kanan)
3. Di sidebar kiri, klik **Secrets and variables** → **Actions**

### 2. Tambahkan Secrets
Klik tombol **"New repository secret"** dan tambahkan 2 secrets berikut:

#### Secret 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://hqyhsuasinyjlwxkapta.supabase.co`

#### Secret 2: SUPABASE_ANON_KEY
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWhzdWFzaW55amx3eGthcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzM0NTMsImV4cCI6MjA1MjI0OTQ1M30.IFSjfRMxq3fBXVbCPWY9KG0i4bZb5dJBJxJWE4jYr8U`

### 3. Verifikasi Setup
Setelah secrets ditambahkan:
1. Buka tab **Actions** di repository
2. Pilih workflow **"Keep Supabase Alive"**
3. Klik **"Run workflow"** → **"Run workflow"** (tombol hijau)
4. Tunggu beberapa detik, workflow akan berjalan
5. Cek hasilnya dengan klik workflow run yang baru dibuat

### 4. Jadwal Otomatis
Workflow akan berjalan otomatis:
- ⏰ **Setiap Senin jam 16:00 WIB** (09:00 UTC)
- ⏰ **Setiap Kamis jam 16:00 WIB** (09:00 UTC)

Ini cukup untuk mencegah Supabase pause karena inactivity.

### 5. Manual Trigger (Jika Diperlukan)
Jika ingin run manual kapan saja:
1. Buka **Actions** tab
2. Pilih workflow **"Keep Supabase Alive"**
3. Klik **"Run workflow"** dropdown
4. Klik tombol **"Run workflow"** hijau

---

## ✅ Checklist
- [ ] Tambahkan `SUPABASE_URL` secret
- [ ] Tambahkan `SUPABASE_ANON_KEY` secret
- [ ] Test manual run workflow
- [ ] Verifikasi workflow berhasil (cek log hijau ✓)
- [ ] Commit dan push file `.github/workflows/keep-alive.yml`

---

## 🔍 Troubleshooting

### Error: "Secret not found"
- Pastikan nama secret exact match: `SUPABASE_URL` dan `SUPABASE_ANON_KEY` (case-sensitive)
- Pastikan secrets ada di repository yang benar

### Error: HTTP 401 atau 403
- Cek ulang value dari `SUPABASE_ANON_KEY`
- Pastikan tidak ada extra spaces atau newlines

### Workflow tidak muncul di Actions tab
- Pastikan file berada di path: `.github/workflows/keep-alive.yml`
- Push/commit file ke GitHub repository
- Refresh halaman Actions

---

## 📊 Monitoring
Untuk melihat log execution:
1. Buka **Actions** tab
2. Klik workflow run yang ingin dilihat
3. Klik job **"ping"**
4. Expand steps untuk lihat detail output

Log yang sukses akan menampilkan:
```
✅ Ping completed successfully!
✅ Database query completed!
✨ Keep-alive workflow completed successfully
```
