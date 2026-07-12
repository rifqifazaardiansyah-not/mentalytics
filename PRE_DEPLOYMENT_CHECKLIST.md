# ✅ Pre-Deployment Checklist

Gunakan checklist ini sebelum deploy ke production untuk memastikan semua siap.

## 📋 Code Preparation

### Build & Test
- [ ] `npm install` berhasil tanpa error atau warning
- [ ] `npm run build` berhasil dan menghasilkan folder `dist/`
- [ ] `npm run preview` berjalan dan aplikasi dapat diakses di http://localhost:4173
- [ ] Test navigasi semua halaman di preview mode
- [ ] Test form submission (create siswa, survey, dll)
- [ ] Test AI chat di 3 konteks (Guiding Resource, Solution, Hasil Tes)
- [ ] Test scatter plot rendering dan interaktivitas
- [ ] Test mobile responsive (buka preview di mobile atau DevTools device mode)

### Code Quality
- [ ] Tidak ada `console.log()` atau `console.error()` yang tidak perlu
- [ ] Tidak ada hardcoded API keys di source code
- [ ] Tidak ada TODO/FIXME yang critical
- [ ] File `vercel.json` ada di root folder (untuk SPA routing)
- [ ] File `.gitignore` sudah benar (tidak commit `.env.local`, `node_modules`, `dist`)

## 🔐 Environment Variables

### File `.env.local`
- [ ] File `.env.local` ada dan berisi semua variable yang dibutuhkan
- [ ] `VITE_SUPABASE_URL` berisi URL Supabase yang benar
- [ ] `VITE_SUPABASE_ANON_KEY` berisi anon key yang benar
- [ ] `VITE_GEMINI_API_KEY` berisi Gemini API key yang valid
- [ ] Test koneksi Supabase dengan variable ini (jalankan `npm run dev`)
- [ ] Test AI chat dengan Gemini API key ini

### Backup Environment Variables
- [ ] Copy semua variable ke tempat aman (password manager, notes, dll)
- [ ] Siap paste ke Vercel dashboard saat deployment

## 🗄️ Database (Supabase)

### Database Status
- [ ] Login ke Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Project `hqyhsuasinyjlwxkapta` aktif (tidak paused)
- [ ] Semua 7 tabel sudah ada:
  - [ ] `siswa`
  - [ ] `essential_question_answers`
  - [ ] `survey_answers_raw`
  - [ ] `survey_results`
  - [ ] `guiding_question_answers`
  - [ ] `solutions`
  - [ ] `ai_interactions`

### Database Configuration
- [ ] RLS (Row Level Security) enabled untuk semua tabel
- [ ] Policies sudah diset (public access untuk prototype - **JANGAN untuk production publik**)
- [ ] Realtime enabled untuk tabel `essential_question_answers` (untuk Forum Diskusi)
- [ ] Test insert/select dari aplikasi lokal berhasil

### Database Migrations
- [ ] Semua migration files ada di `supabase/migrations/`:
  - [ ] `0001_init.sql`
  - [ ] `0002_add_multi_class.sql`
  - [ ] `0003_fix_join_class_function.sql`
  - [ ] `0004_fix_join_class_reuse_student.sql`
  - [ ] `0005_add_anxiety_details.sql`
  - [ ] `0006_add_student_identity.sql`
  - [ ] `0007_update_solutions_table.sql`
- [ ] Semua migrations sudah dijalankan di production database

## 🎨 Assets

### Images
- [ ] Folder `public/assets/milo/` berisi semua gambar Milo:
  - [ ] `milo-wave.png`
  - [ ] `milo-happy.png`
  - [ ] `milo-thinking.png`
  - [ ] `milo-explain.png`
- [ ] Folder `public/assets/icon/` berisi icon yang dibutuhkan
- [ ] Folder `public/assets/team/` berisi foto tim (jika ada)
- [ ] Semua gambar sudah dioptimasi (tidak terlalu besar)

## 📱 Git Repository

### Git Setup
- [ ] Repository sudah di-initialize (`git init` atau clone dari GitHub)
- [ ] File `.gitignore` ada dan benar
- [ ] **JANGAN** commit file `.env.local` (check `.gitignore`)
- [ ] Semua perubahan sudah di-commit
- [ ] Commit message deskriptif dan jelas

### GitHub Repository
- [ ] Repository sudah dibuat di GitHub
- [ ] Repository visibility: Public atau Private (sesuai kebutuhan)
- [ ] Remote origin sudah diset: `git remote -v` menunjukkan URL GitHub
- [ ] Code sudah di-push ke GitHub: `git push origin main`
- [ ] Verifikasi di GitHub web - semua file terlihat (kecuali yang di `.gitignore`)

## 🚀 Vercel Account

### Account Setup
- [ ] Sudah punya akun Vercel (https://vercel.com)
- [ ] Login dengan GitHub account (recommended)
- [ ] GitHub account ter-connect ke Vercel
- [ ] Repository `mentalytics` terlihat di list saat import project

## 🔑 API Keys & Services

### Supabase
- [ ] Supabase project aktif (tidak paused)
- [ ] Anon key masih valid (tidak expired)
- [ ] Database tidak penuh (check usage di dashboard)
- [ ] Free tier quota cukup (500MB database, 5GB bandwidth)

### Gemini AI
- [ ] API key valid (test di aplikasi lokal)
- [ ] Quota API masih ada (check di https://aistudio.google.com)
- [ ] Free tier: 60 requests/minute, 1500 requests/day

## 📄 Documentation

### Required Files
- [ ] `README.md` - Overview project dan quick start
- [ ] `DEPLOYMENT_GUIDE.md` - Full deployment documentation (sudah dibuat ✅)
- [ ] `deploy.md` - Quick command reference (sudah dibuat ✅)
- [ ] `design.md` - Design system dan tech stack
- [ ] `PRE_DEPLOYMENT_CHECKLIST.md` - File ini (sudah dibuat ✅)
- [ ] `vercel.json` - Vercel configuration (sudah dibuat ✅)

## 🔍 Pre-Deploy Testing

### Functional Testing
- [ ] **Home page** - Load dengan benar, navigasi bekerja
- [ ] **Tap Milo** - Gambar Milo muncul, animasi bekerja
- [ ] **Kegiatan Belajar** - Flow pembelajaran jelas
- [ ] **CP/TP/Big Idea** - Content lengkap
- [ ] **Forum Diskusi** - Submit essential question berhasil, realtime updates
- [ ] **The Challenge** - Challenge text tersimpan di context
- [ ] **Guiding Resource** - AI chat panel berfungsi (adaptive scaffolding)
- [ ] **Guiding Activity** - Survey submission berhasil, skor tersimpan
- [ ] **Hasil Guiding Activities** - Tabel hasil survey muncul
- [ ] **Guiding Question** - Form submission berhasil
- [ ] **Eksplorasi Diagram Pencar** - Scatter plot rendering, interaktif
- [ ] **Solution** - Form + AI feedback bekerja, data tersimpan
- [ ] **Presentation View** - Diagram + recommendations muncul
- [ ] **Hasil Tes** - Individual results + AI recommendations muncul

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium) - Semua fitur bekerja
- [ ] Firefox - Semua fitur bekerja
- [ ] Safari (jika ada Mac) - Semua fitur bekerja
- [ ] Mobile browser (Chrome/Safari mobile) - Responsive dan functional

### Performance Testing
- [ ] Page load time < 3 detik (test dengan slow 3G di DevTools)
- [ ] No console errors di browser DevTools
- [ ] No 404 errors untuk assets
- [ ] Images load dengan benar
- [ ] Animations smooth (tidak lag)

## 🛡️ Security Check

### Code Security
- [ ] No API keys hardcoded di source code
- [ ] All sensitive values di environment variables
- [ ] `.env.local` di `.gitignore` (tidak ter-commit)
- [ ] No SQL injection vulnerabilities (menggunakan Supabase parameterized queries)

### Database Security
- [ ] ⚠️ **RLS policies diset untuk prototype** (open access)
- [ ] Jika deploy untuk demo tertutup: OK ✅
- [ ] Jika deploy untuk public access: **HARUS implement proper auth + RLS** ❌

### API Security
- [ ] Gemini API key tidak exposed di client code (client-side call langsung - OK untuk prototype)
- [ ] Supabase anon key (public key) - OK untuk RLS-protected tables
- [ ] Rate limiting: Gemini free tier 60 req/min (automatic)

## ⚙️ Vercel Configuration

### Project Settings (akan diatur saat deployment)
- [ ] Framework: Vite (auto-detected)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Node version: 18.x (default Vercel)

### Environment Variables (siap paste)
```
VITE_SUPABASE_URL=https://hqyhsuasinyjlwxkapta.supabase.co
VITE_SUPABASE_ANON_KEY=[copy dari .env.local]
VITE_GEMINI_API_KEY=[copy dari .env.local]
```

Untuk setiap variable:
- [ ] Environment: Production ✅
- [ ] Environment: Preview ✅
- [ ] Environment: Development ✅

## 📊 Post-Deployment Plan

### Immediate Checks (setelah deploy)
- [ ] Deployment URL muncul (https://mentalytics-xxxx.vercel.app)
- [ ] Home page load tanpa error
- [ ] Test create siswa baru (verifikasi Supabase connection)
- [ ] Test AI chat (verifikasi Gemini API connection)
- [ ] Test survey submission
- [ ] Test scatter plot
- [ ] Mobile view check

### Monitoring Setup
- [ ] Bookmark Vercel Analytics dashboard
- [ ] Bookmark Supabase Usage dashboard
- [ ] Bookmark Gemini API Console (check quota)
- [ ] Setup alert jika quota hampir habis

### Share & Demo
- [ ] Copy deployment URL untuk share ke tim/dosen
- [ ] Prepare demo script (flow yang harus ditunjukkan)
- [ ] Prepare dummy data untuk demo
- [ ] Test dengan multiple users sebelum demo resmi

## 🎉 Ready to Deploy!

Jika semua checklist di atas ✅, aplikasi siap dideploy!

**Next Step:** 
1. Buka `deploy.md` untuk command-line deployment
2. Atau buka `DEPLOYMENT_GUIDE.md` untuk full step-by-step guide
3. Or simply: Buka https://vercel.com dan import project dari GitHub! 🚀

---

**Good luck with deployment! 🎊**
