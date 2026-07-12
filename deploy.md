# 🚀 Quick Deployment Commands

## Prerequisites

Pastikan sudah install:
- Node.js (v18 atau lebih baru)
- Git
- Akun GitHub
- Akun Vercel (sign up dengan GitHub)

## Deployment Steps

### 1. Verifikasi Build Lokal

```bash
# Install dependencies (jika belum)
npm install

# Build project
npm run build

# Test build hasil
npm run preview
```

Buka http://localhost:4173 dan pastikan aplikasi berjalan dengan baik.

### 2. Push ke GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "feat: ready for deployment"

# Create GitHub repository dan push
# Option A: Menggunakan GitHub CLI (jika sudah install gh)
gh repo create mentalytics --public --source=. --remote=origin --push

# Option B: Manual (jika tidak ada gh CLI)
# 1. Buat repository baru di https://github.com/new dengan nama "mentalytics"
# 2. Jangan initialize dengan README (karena sudah ada file lokal)
# 3. Copy URL repository (contoh: https://github.com/USERNAME/mentalytics.git)
# 4. Jalankan command berikut:
git remote add origin https://github.com/USERNAME/mentalytics.git
git branch -M main
git push -u origin main
```

### 3. Deploy ke Vercel (via Dashboard)

1. Buka https://vercel.com
2. Klik **"Sign Up"** atau **"Log In"** dengan akun GitHub
3. Setelah login, klik **"Add New..."** → **"Project"**
4. Pilih repository **"mentalytics"** dari list
5. Klik **"Import"**

6. **Configure Project:**
   - Framework Preset: `Vite` (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

7. **Add Environment Variables:**
   
   Klik **"Environment Variables"** dan tambahkan variable berikut:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://hqyhsuasinyjlwxkapta.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Copy dari file `.env.local` |
   | `VITE_GEMINI_API_KEY` | Your Gemini API key |
   
   ⚠️ **Penting**: 
   - Semua variable HARUS dimulai dengan `VITE_`
   - Untuk setiap variable, pilih environment: **Production**, **Preview**, dan **Development**

8. Klik **"Deploy"**

9. Tunggu build selesai (1-3 menit)

10. Setelah berhasil, Vercel akan memberikan URL deployment:
    ```
    https://mentalytics-xxxx.vercel.app
    ```

11. **Test Deployment:**
    - Buka URL tersebut
    - Test navigasi antar halaman
    - Test create siswa baru
    - Test AI chat panel
    - Test survey & scatter plot

### 4. Setup Auto-Deploy

Setelah deployment pertama berhasil, setiap kali push ke GitHub akan otomatis trigger deployment:

```bash
# Workflow selanjutnya:
# 1. Edit code
# 2. Commit changes
git add .
git commit -m "feat: tambah fitur baru"

# 3. Push ke GitHub
git push origin main

# Vercel otomatis detect push dan build + deploy dalam 1-2 menit
```

## Alternative: Deploy via Vercel CLI

Jika prefer command line:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy (pertama kali)
vercel

# Ikuti prompt interaktif:
# Set up and deploy: Y
# Scope: pilih personal account
# Link to existing project: N
# Project name: mentalytics
# Directory: ./
# Override build settings: N

# Deploy ke production
vercel --prod

# Add environment variables via CLI
vercel env add VITE_SUPABASE_URL production
# Paste value lalu Enter

vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_GEMINI_API_KEY production

# Redeploy untuk apply env vars
vercel --prod
```

## Troubleshooting

### Build Failed

**Symptoms:**
- Build error di Vercel
- "Module not found" atau "npm install failed"

**Solution:**
```bash
# Clean install lokal
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# Jika berhasil, commit dan push ulang
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Environment Variables Not Working

**Symptoms:**
- `VITE_SUPABASE_URL is undefined`
- AI chat tidak berfungsi

**Solution:**
1. Cek di Vercel Dashboard > Settings > Environment Variables
2. Pastikan semua variable ada dan valuenya benar
3. Pastikan variable dimulai dengan `VITE_`
4. Klik **"Redeploy"** di Vercel (tidak auto-redeploy saat env vars berubah)

### 404 on Page Refresh

**Symptoms:**
- Refresh halaman `/kegiatan-belajar` muncul 404

**Solution:**
File `vercel.json` sudah dibuat untuk handle SPA routing. Jika masih 404:
1. Verifikasi `vercel.json` ada di root folder
2. Redeploy: `git add vercel.json && git commit -m "fix: add vercel config" && git push`

### Supabase Connection Failed

**Symptoms:**
- "Failed to connect to Supabase"
- Data tidak tersimpan

**Solution:**
1. Cek Supabase project status di https://supabase.com/dashboard
2. Pastikan project tidak di-pause (free tier auto-pause setelah 1 minggu inactive)
3. Verifikasi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar
4. Test koneksi dari browser console:
   ```js
   // Buka deployed site, open DevTools Console:
   const { createClient } = supabase
   const client = createClient(
     'https://hqyhsuasinyjlwxkapta.supabase.co',
     'YOUR_ANON_KEY'
   )
   await client.from('siswa').select('*').limit(1)
   ```

## Post-Deployment Checklist

- [ ] Deployment URL berfungsi
- [ ] Home page load dengan benar
- [ ] Navigation bekerja (tidak 404)
- [ ] Form create siswa berhasil
- [ ] Survey submission berhasil
- [ ] Scatter plot rendering
- [ ] AI Chat Panel merespons
- [ ] Forum Diskusi realtime updates
- [ ] Mobile responsive (test di phone/tablet)
- [ ] HTTPS aktif (default dari Vercel)

## Maintenance

### Update Deployment

```bash
# Setiap kali ada perubahan:
git add .
git commit -m "update: deskripsi perubahan"
git push

# Vercel auto-deploy dalam 1-2 menit
```

### Rollback to Previous Version

Jika deployment baru ada masalah:

1. Buka Vercel Dashboard > Project
2. Tab **"Deployments"**
3. Cari deployment sebelumnya yang berfungsi
4. Klik **"..."** → **"Promote to Production"**

Atau via CLI:
```bash
vercel rollback
```

### Monitor Performance

- **Vercel Analytics**: Dashboard > Analytics (pageviews, Web Vitals)
- **Supabase Usage**: Dashboard > Settings > Usage (database size, API calls)
- **Gemini API Quota**: https://aistudio.google.com (request count)

## Custom Domain (Optional)

Jika ingin domain sendiri (contoh: `mentalytics.id`):

1. Beli domain dari provider (Namecheap, Niagahoster, dll)
2. Vercel Dashboard > Project Settings > Domains
3. Klik **"Add"** dan masukkan domain
4. Ikuti instruksi DNS configuration
5. Tunggu DNS propagation (5-30 menit)
6. SSL certificate otomatis di-provision

## Resources

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Gemini API Console**: https://aistudio.google.com

## Support

Jika ada masalah:
1. Cek troubleshooting section di atas
2. Baca full documentation di `DEPLOYMENT_GUIDE.md`
3. Cek Vercel build logs untuk error details
4. Community support: Vercel Discord atau Supabase Discord

---

**Happy Deploying! 🚀**
