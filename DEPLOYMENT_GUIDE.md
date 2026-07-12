# 🚀 Panduan Deployment Mentalytics

## 📋 Ringkasan Tech Stack

**Mentalytics** adalah aplikasi web berbasis:
- **Frontend**: React 19 + Vite (SPA)
- **Backend & Database**: Supabase (PostgreSQL + Auto REST API + Realtime)
- **AI Service**: Google Gemini AI (via client-side API calls)
- **Styling**: Tailwind CSS
- **Hosting yang Direkomendasikan**: Vercel (frontend) + Supabase Cloud (backend/DB)

---

## 🎯 Rekomendasi Platform Deployment

### ✅ Pilihan Terbaik: **Vercel** (Recommended)

**Mengapa Vercel?**
- ✅ **Gratis untuk personal/educational projects** (free tier sangat generous)
- ✅ **Zero-config deployment** - otomatis deteksi Vite/React
- ✅ **Git-based deployment** - auto-deploy setiap push ke GitHub
- ✅ **Edge Network (CDN global)** - loading cepat dari mana saja
- ✅ **Environment variables** mudah diatur via dashboard
- ✅ **Custom domain gratis** (subdomain `.vercel.app` atau custom domain sendiri)
- ✅ **HTTPS otomatis** (SSL certificate gratis)
- ✅ **Preview deployments** untuk setiap PR/branch

**Free Tier Limits:**
- 100GB bandwidth/bulan (cukup untuk ribuan pengunjung)
- Unlimited static sites
- Unlimited preview deployments

---

### Alternatif Platform Lain

| Platform | Pro | Kontra | Free Tier |
|----------|-----|--------|-----------|
| **Netlify** | Mirip Vercel, mudah dipakai, Netlify Forms bawaan | Bandwidth limit lebih kecil (100GB) | ✅ 100GB/bulan |
| **Cloudflare Pages** | Bandwidth unlimited, CDN tercepat | Setup sedikit lebih teknis | ✅ Unlimited |
| **GitHub Pages** | Gratis unlimited, langsung dari repo | Hanya static files, tidak support SPA routing dengan baik tanpa workaround | ✅ Unlimited |
| **Firebase Hosting** | Integrasi bagus dengan Firebase services | Perlu setup rewrites untuk SPA | ✅ 10GB/bulan |

**Kesimpulan**: Untuk prototype educational seperti Mentalytics, **Vercel** adalah pilihan terbaik karena:
1. Setup paling mudah (< 5 menit)
2. Free tier paling generous
3. Cocok untuk SPA React + environment variables

---

## 📦 Persiapan Sebelum Deploy

### 1. Setup Git Repository (jika belum)

```bash
# Di folder project
git init
git add .
git commit -m "Initial commit - Mentalytics ready for deployment"

# Create GitHub repository (via GitHub web atau GitHub CLI)
gh repo create mentalytics --public --source=. --remote=origin --push
# Atau manual: buat repo di GitHub.com lalu:
git remote add origin https://github.com/USERNAME/mentalytics.git
git push -u origin main
```

### 2. Verifikasi Build Lokal

Pastikan build berhasil sebelum deploy:

```bash
npm run build
```

Seharusnya membuat folder `dist/` tanpa error. Test hasil build:

```bash
npm run preview
```

Buka http://localhost:4173 dan cek apakah aplikasi berjalan normal.

---

## 🚀 Deployment ke Vercel (Step-by-Step)

### Step 1: Install Vercel CLI (Optional, lebih mudah via web)

```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended - Paling Mudah)

1. **Buka** https://vercel.com
2. **Sign up/Login** dengan akun GitHub
3. **Klik "Add New Project"**
4. **Import repository** `mentalytics` dari GitHub
5. **Configure Project:**
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

6. **Environment Variables** - Klik "Environment Variables" lalu tambahkan:
   ```
   VITE_SUPABASE_URL = https://hqyhsuasinyjlwxkapta.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWhzdWFzaW55amx3eGthcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzM0NTMsImV4cCI6MjA1MjI0OTQ1M30.IFSjfRMxq3fBXVbCPWY9KG0i4bZb5dJBJxJWE4jYr8U
   VITE_GEMINI_API_KEY = (API key Google Gemini AI kamu)
   ```
   
   ⚠️ **Penting**: Pastikan semua variable dimulai dengan `VITE_` agar bisa diakses di client-side React.

7. **Deploy** - Klik "Deploy"
   - Vercel akan build project (1-2 menit)
   - Setelah selesai, dapat URL deployment: `https://mentalytics-xxxx.vercel.app`

8. **Test** - Buka URL dan cek semua fitur:
   - Home page load
   - Navigation bekerja
   - Koneksi ke Supabase (buat siswa baru)
   - AI Chat Panel (test Gemini API)

### Step 3: Deploy via Vercel CLI (Alternative)

Jika prefer command line:

```bash
# Login ke Vercel
vercel login

# Deploy (pertama kali akan setup project)
vercel

# Ikuti prompt:
# - Set up and deploy: Y
# - Scope: pilih personal account
# - Link to existing project: N
# - Project name: mentalytics
# - Directory: ./
# - Override build settings: N

# Setelah deploy preview berhasil, deploy ke production:
vercel --prod
```

Tambahkan environment variables via CLI:

```bash
vercel env add VITE_SUPABASE_URL
# Paste value: https://hqyhsuasinyjlwxkapta.supabase.co
# Select environments: Production, Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# Paste value: (anon key dari .env.local)

vercel env add VITE_GEMINI_API_KEY
# Paste value: (Gemini API key)
```

Redeploy untuk apply environment variables:

```bash
vercel --prod
```

---

## 🗄️ Setup Supabase (Backend/Database)

### Status Supabase Saat Ini

Berdasarkan `.env.local`, Supabase **sudah ter-deploy** di cloud:
- URL: `https://hqyhsuasinyjlwxkapta.supabase.co`
- Project sudah live (free tier Supabase)

### Yang Perlu Dicek

1. **Verifikasi Migrations Sudah Dijalankan:**
   ```bash
   # Jika menggunakan Supabase CLI
   supabase db push
   ```

2. **Cek di Supabase Dashboard:**
   - Login ke https://supabase.com/dashboard
   - Pilih project `hqyhsuasinyjlwxkapta`
   - **Table Editor** - pastikan semua tabel ada:
     - `siswa`
     - `essential_question_answers`
     - `survey_answers_raw`
     - `survey_results`
     - `guiding_question_answers`
     - `solutions`
     - `ai_interactions`
   - **Database > Realtime** - pastikan `essential_question_answers` enabled (untuk Forum Diskusi)

3. **Row Level Security (RLS):**
   - ⚠️ **Perhatian**: Saat ini RLS diset `using (true)` (open untuk semua)
   - ✅ **Untuk prototype demo**: ini OK
   - ❌ **Jangan gunakan di production publik** (siapa saja bisa CRUD semua data)
   - **Recommended untuk production**: Implementasi proper authentication + RLS per user

---

## 🔑 Environment Variables Checklist

### Untuk Development (`.env.local`)
```env
VITE_SUPABASE_URL=https://hqyhsuasinyjlwxkapta.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_b3w9N0FES-3YFBKsq583RQ_K0tG5Ta7
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Untuk Production (Vercel Dashboard)
- ✅ Tambahkan semua variable di atas ke Vercel Environment Variables
- ✅ Pilih scope: Production, Preview, Development
- ✅ Jangan commit `.env.local` ke Git (sudah ada di `.gitignore`)

### Cara Mendapatkan Gemini API Key

Jika belum punya:
1. Buka https://aistudio.google.com/app/apikey
2. Login dengan Google account
3. Klik "Get API Key" atau "Create API Key"
4. Copy API key ke environment variables

---

## 🔄 Auto-Deploy Setup (Git Integration)

Setelah deploy pertama via Vercel, setiap `git push` akan otomatis trigger deployment baru:

```bash
# Workflow development:
git add .
git commit -m "feat: tambah fitur X"
git push origin main
# Vercel otomatis build dan deploy dalam 1-2 menit
```

**Preview Deployments:**
- Setiap branch/PR akan dapat preview URL unik
- Berguna untuk testing sebelum merge ke main

---

## 🌐 Custom Domain (Optional)

Jika ingin domain sendiri (misalnya `mentalytics.com`):

### Via Vercel Dashboard:
1. **Beli domain** (dari Namecheap, GoDaddy, atau provider lain)
2. **Vercel Dashboard** > Project Settings > Domains
3. **Add Domain** > Masukkan domain kamu
4. **Configure DNS** di domain provider:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21` (Vercel IP)
5. Tunggu DNS propagation (5-30 menit)
6. Vercel otomatis provision SSL certificate (HTTPS)

### Vercel Free Domain:
Jika tidak ingin beli domain, dapat:
- Default: `mentalytics-xxxx.vercel.app`
- Custom subdomain: `mentalytics.vercel.app` (jika nama belum dipakai)

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics (Free)
1. **Vercel Dashboard** > Project > Analytics
2. Dapat data:
   - Page views
   - Unique visitors
   - Performance metrics (Web Vitals)
   - Geographic distribution

### Setup Google Analytics (Optional)
Tambahkan Google Analytics 4 ke `index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🐛 Troubleshooting

### 1. Build Failed di Vercel

**Error:** `Module not found` atau `npm install failed`

**Solusi:**
- Pastikan `package.json` dan `package-lock.json` terupdate
- Run `npm install` lokal lalu commit ulang
- Cek Node version di Vercel (default: Node 18) vs lokal

### 2. Environment Variables Tidak Terdeteksi

**Error:** `VITE_SUPABASE_URL is undefined`

**Solusi:**
- Pastikan variable dimulai dengan `VITE_`
- Redeploy setelah tambah env vars: klik "Redeploy" di Vercel
- Vercel tidak auto-redeploy saat env vars berubah

### 3. SPA Routing 404 (Page Not Found saat Refresh)

**Error:** Refresh halaman `/kegiatan-belajar` muncul 404

**Solusi:**
- Vercel seharusnya otomatis handle ini untuk Vite/React
- Jika masalah masih ada, tambahkan `vercel.json`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### 4. Supabase Connection Failed

**Error:** `Failed to connect to Supabase`

**Solusi:**
- Cek Supabase project status di dashboard (pastikan tidak paused)
- Verifikasi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar
- Test koneksi langsung dari browser console:
  ```js
  import { createClient } from '@supabase/supabase-js'
  const supabase = createClient('URL', 'ANON_KEY')
  await supabase.from('siswa').select('*').limit(1)
  ```

### 5. AI Chat Tidak Berfungsi

**Error:** AI tidak merespons atau error 401

**Solusi:**
- Cek `VITE_GEMINI_API_KEY` sudah diset di Vercel
- Verifikasi API key valid di https://aistudio.google.com
- Cek quota Gemini API (free tier: 60 requests/minute)

---

## 💰 Estimasi Biaya

### Gratis (Recommended untuk Prototype/Demo)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Hobby (Free) | $0/bulan | 100GB bandwidth, unlimited sites |
| **Supabase** | Free Tier | $0/bulan | 500MB database, 5GB bandwidth, 2GB file storage |
| **Gemini API** | Free Tier | $0 | 60 requests/minute, 1500 requests/day |
| **Total** | | **$0/bulan** | Cukup untuk ratusan pengguna/bulan |

### Jika Butuh Upgrade (Production dengan Traffic Tinggi)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Pro | $20/bulan | 1TB bandwidth, team collaboration |
| **Supabase** | Pro | $25/bulan | 8GB database, 50GB bandwidth, 100GB storage |
| **Gemini API** | Pay-as-you-go | ~$0.001/request | Unlimited (dibayar per request) |
| **Total** | | **$45-50/bulan** | Cukup untuk ribuan pengguna/bulan |

**Untuk Mentalytics (educational prototype):**
- ✅ **Free tier sangat cukup** untuk demo dan testing
- ⏰ Upgrade hanya jika traffic > 1000 siswa aktif/bulan

---

## 🔐 Security Checklist untuk Production

Jika akan deploy secara publik (bukan hanya demo tertutup):

- [ ] **Implementasi Authentication** (Supabase Auth atau OAuth)
- [ ] **Update RLS Policies** - ganti `using (true)` dengan proper user-based policies
- [ ] **Rate Limiting** untuk AI API calls (prevent abuse)
- [ ] **Input Validation** untuk semua form submissions
- [ ] **CORS Configuration** jika ada external API calls
- [ ] **Secrets Management** - jangan commit API keys ke Git
- [ ] **Backup Database** secara regular (Supabase automatic daily backups di Pro plan)
- [ ] **Monitoring & Alerts** untuk uptime dan errors (Vercel/Sentry)

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Build berhasil lokal (`npm run build`)
- [ ] Test preview berhasil (`npm run preview`)
- [ ] Semua environment variables terdaftar di `.env.local`
- [ ] Git repository sudah ada di GitHub
- [ ] Supabase migrations sudah dijalankan
- [ ] Database tables terverifikasi di Supabase Dashboard

### Deployment
- [ ] Vercel project dibuat dan terhubung ke GitHub repo
- [ ] Environment variables ditambahkan ke Vercel Dashboard
- [ ] Deployment pertama berhasil (build success)
- [ ] URL deployment berfungsi (test home page)

### Post-Deployment Testing
- [ ] Navigation antar halaman bekerja
- [ ] Refresh halaman tidak 404 (SPA routing works)
- [ ] Form submission berhasil (create siswa, survey, dll)
- [ ] Supabase connection bekerja (data tersimpan)
- [ ] AI Chat Panel merespons dengan benar
- [ ] Forum Diskusi realtime updates bekerja
- [ ] Scatter plot rendering dengan benar
- [ ] Mobile responsive (test di berbagai screen size)

### Optional
- [ ] Custom domain dikonfigurasi (jika ada)
- [ ] Google Analytics setup (jika ingin analytics)
- [ ] Performance optimization (lazy loading, image optimization)
- [ ] SEO meta tags (title, description, og:image)

---

## 🚀 Quick Start (TL;DR)

Untuk deploy Mentalytics dalam < 10 menit:

```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Initial commit"
gh repo create mentalytics --public --source=. --push

# 2. Deploy ke Vercel
# Buka https://vercel.com
# Klik "Import Project" > Pilih repo "mentalytics"
# Tambahkan env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY
# Klik "Deploy"

# 3. Done! 🎉
# Dapat URL: https://mentalytics-xxxx.vercel.app
```

---

## 📚 Resources & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **React Router**: https://reactrouter.com/en/main

---

## 💡 Tips & Best Practices

1. **Git Workflow:**
   - Gunakan branch untuk fitur baru: `git checkout -b feature/nama-fitur`
   - Test di preview deployment sebelum merge ke main
   - Commit message yang jelas: `feat:`, `fix:`, `docs:`

2. **Performance:**
   - Code splitting dengan React lazy loading untuk halaman besar
   - Optimize images (compress sebelum upload ke `public/assets`)
   - Minimize bundle size (check dengan `npm run build`)

3. **Monitoring:**
   - Cek Vercel Analytics tiap minggu untuk melihat traffic pattern
   - Monitor Supabase database size (free tier: 500MB)
   - Setup error tracking (Sentry atau LogRocket) untuk production

4. **Collaboration:**
   - Invite team members ke Vercel project (Settings > Team)
   - Gunakan Vercel comments untuk review preview deployments
   - Document perubahan penting di CHANGELOG.md

---

**🎉 Selamat! Mentalytics siap dideploy ke production!**

Jika ada pertanyaan atau masalah saat deployment, cek Troubleshooting section atau contact support platform yang digunakan.
