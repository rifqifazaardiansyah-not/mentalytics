# ⚡ Quick Start - Mentalytics Deployment

## 🎯 Goal
Deploy Mentalytics ke production dalam **< 15 menit**

---

## ✅ Pre-Deployment Check

Jalankan verification script:
```bash
node verify-deployment-ready.js
```

Jika muncul `🎉 READY TO DEPLOY!` atau `⚠️ READY WITH WARNINGS`, lanjut ke step berikutnya.

---

## 📝 Persiapan (5 menit)

### 1. Update Gemini API Key

Edit file `.env.local`, ganti placeholder dengan API key asli:
```env
VITE_GEMINI_API_KEY=AIza...your_actual_key
```

**Cara dapat Gemini API Key:**
1. Buka https://aistudio.google.com/app/apikey
2. Login dengan Google account
3. Klik "Get API Key" atau "Create API Key"
4. Copy paste ke `.env.local`

### 2. Test Build Lokal

```bash
# Install dependencies (jika belum)
npm install

# Build project
npm run build

# Test hasil build
npm run preview
```

Buka http://localhost:4173 dan pastikan aplikasi berjalan normal.

---

## 🚀 Deployment (10 menit)

### Step 1: Push ke GitHub (3 menit)

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "feat: ready for deployment"

# Create GitHub repository dan push
# Option A: Menggunakan GitHub CLI (recommended)
gh auth login
gh repo create mentalytics --public --source=. --remote=origin --push

# Option B: Manual (jika tidak ada gh CLI)
# 1. Buat repo di https://github.com/new dengan nama "mentalytics"
# 2. Jangan initialize dengan README
# 3. Copy URL repo (contoh: https://github.com/USERNAME/mentalytics.git)
# 4. Jalankan:
git remote add origin https://github.com/USERNAME/mentalytics.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy ke Vercel (7 menit)

**Via Dashboard (Paling Mudah):**

1. Buka https://vercel.com
2. Klik **"Sign Up"** atau **"Log In"** dengan GitHub
3. Klik **"Add New..."** → **"Project"**
4. Pilih repository **"mentalytics"**
5. Klik **"Import"**
6. **Configure:**
   - Framework: `Vite` (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. **Environment Variables** - Tambahkan 3 variable:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | Copy dari `.env.local` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | Copy dari `.env.local` | Production, Preview, Development |
   | `VITE_GEMINI_API_KEY` | Copy dari `.env.local` | Production, Preview, Development |

8. Klik **"Deploy"**
9. Tunggu 1-3 menit
10. 🎉 **DONE!** Dapat URL: `https://mentalytics-xxxx.vercel.app`

---

## ✅ Post-Deployment Testing (2 menit)

Test deployment URL:

- [ ] Home page load
- [ ] Navigation bekerja (tidak 404 saat refresh)
- [ ] Create siswa baru (test Supabase connection)
- [ ] AI Chat Panel (test Gemini API)
- [ ] Survey submission
- [ ] Scatter plot rendering
- [ ] Mobile responsive

---

## 🎊 Success!

Deployment selesai! URL siap dishare:
```
https://mentalytics-xxxx.vercel.app
```

---

## 🔄 Update Deployment

Setiap kali ada perubahan:

```bash
git add .
git commit -m "update: deskripsi perubahan"
git push
```

Vercel otomatis deploy dalam 1-2 menit. ✨

---

## 📚 Need More Details?

- **Full Guide**: `DEPLOYMENT_GUIDE.md` (comprehensive documentation)
- **Commands**: `deploy.md` (CLI reference)
- **Checklist**: `PRE_DEPLOYMENT_CHECKLIST.md` (detailed checks)
- **Overview**: `DEPLOYMENT_SUMMARY.md` (architecture & costs)

---

## 🆘 Troubleshooting

### Build Failed
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Environment Variables Not Working
1. Vercel Dashboard > Settings > Environment Variables
2. Verify all 3 variables ada dan benar
3. Klik "Redeploy" (Deployments tab → "..." → Redeploy)

### 404 on Page Refresh
- Verifikasi `vercel.json` ada di root folder
- Redeploy

### Supabase Connection Failed
1. Check Supabase Dashboard (project tidak paused)
2. Verify `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar
3. Test di browser console:
   ```js
   // Buka deployed site, F12 Console:
   const { createClient } = supabase
   const client = createClient('YOUR_URL', 'YOUR_KEY')
   await client.from('siswa').select('*').limit(1)
   ```

---

## 💡 Pro Tips

1. **Bookmark URLs:**
   - Deployment: `https://mentalytics-xxxx.vercel.app`
   - Vercel Dashboard: `https://vercel.com/dashboard`
   - Supabase Dashboard: `https://supabase.com/dashboard`
   - Gemini Console: `https://aistudio.google.com`

2. **Monitor Usage Weekly:**
   - Vercel Analytics (traffic, errors)
   - Supabase Usage (database size, API calls)
   - Gemini Quota (request count)

3. **Git Workflow:**
   - Branch untuk fitur baru: `git checkout -b feature/nama`
   - Test di preview deployment
   - Merge ke main setelah verified

---

**Happy Deploying! 🚀**

*Questions? Check `DEPLOYMENT_GUIDE.md` for detailed documentation.*
