# 🚀 Setup GitHub Actions untuk Keep Supabase Alive

## 📖 Penjelasan Masalah

Supabase Free Tier akan **pause** database jika tidak ada activity selama beberapa hari. Untuk mencegah ini, kita gunakan GitHub Actions yang secara otomatis melakukan "ping" ke database secara berkala.

---

## ✅ Langkah Setup (5 Menit)

### Step 1: Buka GitHub Repository
1. Buka https://github.com/rifqifazaardiansyah-not/mentalytics
2. Pastikan file `.github/workflows/keep-alive.yml` sudah ada (sudah di-push)

### Step 2: Tambahkan GitHub Secrets
1. Klik tab **Settings** (pojok kanan atas)
2. Di sidebar kiri, klik **Secrets and variables** → **Actions**
3. Klik tombol **"New repository secret"**

#### Secret 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Secret:** `https://hqyhsuasinyjlwxkapta.supabase.co`
- Klik **Add secret**

#### Secret 2: SUPABASE_ANON_KEY
- **Name:** `SUPABASE_ANON_KEY`
- **Secret:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWhzdWFzaW55amx3eGthcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzM0NTMsImV4cCI6MjA1MjI0OTQ1M30.IFSjfRMxq3fBXVbCPWY9KG0i4bZb5dJBJxJWE4jYr8U`
- Klik **Add secret**

### Step 3: Test Manual Run
1. Klik tab **Actions** (di atas)
2. Di sidebar kiri, klik workflow **"Keep Supabase Alive"**
3. Klik tombol **"Run workflow"** (dropdown)
4. Klik tombol hijau **"Run workflow"**
5. Tunggu 10-20 detik
6. Refresh halaman
7. Klik workflow run yang baru muncul
8. Klik job **"ping"**
9. Lihat log - harus ada tanda centang hijau ✓

### Step 4: Verifikasi Log
Log yang sukses akan menampilkan:
```
✅ Ping completed successfully!
✅ Database query completed!
✨ Keep-alive workflow completed successfully
```

---

## 🔄 Jadwal Otomatis

Workflow akan berjalan **otomatis** pada jadwal:
- **Setiap Senin** jam 16:00 WIB (09:00 UTC)
- **Setiap Kamis** jam 16:00 WIB (09:00 UTC)

Ini cukup untuk mencegah Supabase pause!

---

## 🔧 Manual Trigger (Kapan Saja)

Jika database pause atau ingin test:
1. Buka **Actions** tab
2. Pilih **"Keep Supabase Alive"** workflow
3. Klik **"Run workflow"** → **"Run workflow"**
4. Workflow akan langsung berjalan

---

## 📊 Monitoring

### Melihat History Runs
1. Buka **Actions** tab
2. Klik workflow **"Keep Supabase Alive"**
3. Lihat list semua runs (hijau = sukses, merah = gagal)

### Melihat Detail Log
1. Klik salah satu workflow run
2. Klik job **"ping"**
3. Expand steps untuk lihat detail

---

## 🐛 Troubleshooting

### ❌ Error: "Secret SUPABASE_URL not found"
**Solusi:**
- Pastikan nama secret **exact match**: `SUPABASE_URL` (huruf besar semua)
- Cek di Settings → Secrets and variables → Actions
- Secret harus ada di repository yang benar

### ❌ Error: HTTP 401 Unauthorized
**Solusi:**
- Cek ulang value `SUPABASE_ANON_KEY`
- Pastikan copy-paste tanpa extra spaces
- Jangan gunakan `SUPABASE_SECRET_KEY` (beda!)

### ❌ Workflow tidak muncul di Actions
**Solusi:**
- Pastikan file ada di path: `.github/workflows/keep-alive.yml`
- File harus sudah di-commit dan di-push ke GitHub
- Coba refresh halaman Actions

### ❌ Database masih pause
**Solusi:**
- Unpause manual dulu di Supabase dashboard
- Tunggu workflow run berikutnya (Senin/Kamis)
- Atau trigger manual dari Actions tab

---

## 📝 Cara Kerja Teknis

Workflow ini melakukan:
1. **Ping REST API** - Hit endpoint `/rest/v1/` untuk "wake up" server
2. **Query Database** - Simple query `SELECT id FROM kelas LIMIT 1` untuk memastikan database aktif
3. **Repeat** - Otomatis repeat setiap 3-4 hari (Senin & Kamis)

Ini cukup untuk mencegah pause karena:
- Supabase pause setelah ~7 hari tidak ada activity
- Workflow kita run setiap 3-4 hari
- Margin safety: 3+ hari

---

## ✨ Benefits

✅ **Gratis** - GitHub Actions free untuk public repo
✅ **Otomatis** - Tidak perlu manual intervention
✅ **Reliable** - GitHub infrastructure 99.9% uptime
✅ **Transparent** - Semua logs visible di Actions tab
✅ **Flexible** - Bisa trigger manual kapan saja

---

## 📞 Need Help?

Jika masih ada masalah:
1. Cek log di Actions tab untuk error message
2. Verifikasi secrets sudah benar
3. Test manual run dulu sebelum tunggu jadwal otomatis
4. Pastikan Supabase project tidak pause secara manual

---

**Status:** ✅ Setup Complete
**Next Run:** Lihat di Actions tab → Next scheduled run
