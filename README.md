# Mentalytics

**Find your feelings with Statistic**

Platform pembelajaran interaktif berbasis Challenge Based Learning (CBL) untuk siswa SMA Fase E yang menggabungkan statistika dengan kesehatan mental dan anti-bullying.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih baru)
- npm atau yarn
- Akun Supabase (sudah di-setup)

### Installation

1. Clone atau extract project ini

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.local` dan pastikan variabel environment sudah ada:
```env
VITE_SUPABASE_URL=https://hqyhsuasinyjlwxkapta.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Setup database di Supabase:
   - Login ke [Supabase Dashboard](https://app.supabase.com)
   - Buka SQL Editor
   - Jalankan semua migration scripts di folder `supabase/migrations/`

5. Jalankan development server:
```bash
npm run dev
```

6. Buka browser di `http://localhost:3000`

## 🌐 Deployment

### Deploy ke Production

Aplikasi ini siap dideploy ke **Vercel** (recommended) atau platform hosting lain.

**Quick Deploy:**

1. Push ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. Deploy ke Vercel:
   - Buka https://vercel.com
   - Import repository dari GitHub
   - Tambahkan environment variables
   - Deploy!

**Dokumentasi lengkap:** Lihat `DEPLOYMENT_GUIDE.md` untuk step-by-step deployment instructions.

**Quick reference:** Lihat `deploy.md` untuk command-line deployment guide.

## 📁 Project Structure

```
mentalytics/
├── public/
│   └── assets/
│       └── milo/                    # Upload gambar Milo di sini
├── src/
│   ├── components/
│   │   ├── layout/                  # AppShell, NavDrawer, LearningLayout
│   │   ├── milo/                    # MiloCharacter, MiloDialogBubble
│   │   ├── ai/                      # AIChatPanel
│   │   └── ...
│   ├── context/                     # StudentContext, ChallengeContext
│   ├── pages/                       # Semua halaman aplikasi
│   ├── lib/                         # supabaseClient, stats utilities
│   └── data/                        # Static data (survey questions, etc)
├── supabase/
│   ├── migrations/                  # Database schema
│   └── functions/                   # Edge functions (AI)
└── .kiro/
    └── specs/
        └── mentalytics/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

## 🎨 Design System

Aplikasi menggunakan design tokens dengan palet warna mental health yang tenang:

- **Primary Colors**: Hijau-teal lembut (#d4edf6 - #b2f2c3)
- **Typography**: Poppins (headings), Inter (body)
- **Spacing**: Tailwind default
- **Components**: Custom dengan Tailwind + Framer Motion

## ✅ Project Status

### ✅ Completed Features

**Core Functionality:**
- ✅ Student identity management (localStorage-based)
- ✅ Challenge-Based Learning flow implementation
- ✅ Complete navigation system with responsive drawer
- ✅ Milo character integration across all pages
- ✅ Interactive scatter plot with data exploration
- ✅ AI-powered chat assistance (3 contexts)
- ✅ Real-time forum discussion
- ✅ Survey system (bullying + anxiety assessment)
- ✅ Individual & class-level results visualization
- ✅ Presentation view with recommendations
- ✅ Mobile-responsive design

**AI Integration:**
- ✅ Guiding Resource AI (adaptive scaffolding)
- ✅ Solution AI (data analysis feedback)
- ✅ Hasil Tes AI (personal recommendations)
- ✅ Progressive disclosure (tidak loop questions)
- ✅ Database logging untuk semua AI interactions

**Pages Implemented:**
- ✅ Home, Panduan, About Us
- ✅ Tap Milo, Tentang Milo, Motivasi
- ✅ Kegiatan Belajar, CP, TP, Big Idea EQ
- ✅ The Challenge, Guiding Resource, Guiding Activity
- ✅ Eksplorasi Diagram Pencar (interactive)
- ✅ Guiding Question, Solution
- ✅ Presentation View
- ✅ Hasil Tes (individual results)
- ✅ Forum Diskusi (realtime)

**Design System:**
- ✅ Tailwind CSS dengan design tokens
- ✅ Mental health color palette
- ✅ Lucide React icons (no emoticons)
- ✅ Consistent typography (Poppins + Inter)
- ✅ Framer Motion animations

### 🚀 Ready for Deployment

Project ini sudah **production-ready** untuk demo/prototype:
- Build tested dan working
- Environment variables configured
- Database schema complete (7 migrations)
- All features implemented and tested
- Mobile responsive
- AI integration working

**⚠️ Security Note:** 
RLS policies diset untuk prototype/demo (open access). Jangan deploy ke public production tanpa implement proper authentication & RLS.

## 🔧 Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Recharts** - Interactive charts & scatter plots
- **Lucide React** - Icon library
- **React Markdown** - Markdown rendering (AI responses)

### Backend & Services
- **Supabase** - PostgreSQL database + Auto REST API
- **Supabase Realtime** - WebSocket untuk Forum Diskusi
- **Google Gemini AI** - AI chat assistant (3 contexts)

### Database
- **PostgreSQL** (via Supabase)
- 7 tables: siswa, survey_answers_raw, survey_results, essential_question_answers, guiding_question_answers, solutions, ai_interactions
- RLS enabled (prototype settings)

### Deployment
- **Vercel** (recommended) - Frontend hosting
- **Supabase Cloud** - Backend & database (already deployed)
- **Environment Variables** - `.env.local` untuk development, Vercel dashboard untuk production

## 📊 Features

### Learning Flow (Challenge-Based Learning)
1. **Orientasi** - CP, TP, Big Idea, Essential Question
2. **The Challenge** - Permasalahan bullying & anxiety di sekolah
3. **Guiding Resources** - Materi diagram pencar dengan AI scaffolding
4. **Guiding Activities** - Survey assessment (bullying + anxiety)
5. **Guiding Questions** - Analisis data hasil survey
6. **Eksplorasi Diagram Pencar** - Interactive scatter plot exploration
7. **Solution** - Buat rekomendasi berbasis data dengan AI feedback
8. **Presentation View** - Visualisasi final + action steps
9. **Hasil Tes** - Individual results dengan AI recommendations

### AI Integration (3 Contexts)
1. **Guiding Resource AI** - Adaptive scaffolding, tidak langsung kasih jawaban
2. **Solution AI** - Feedback untuk rekomendasi draft, progressive disclosure
3. **Hasil Tes AI** - Personal recommendations berdasarkan kategori

### Key Components
- **Milo Character** - Friendly guide di setiap halaman
- **Floating Buttons** - AI chat & Challenge text access
- **Real-time Forum** - Diskusi Essential Question antar siswa
- **Interactive Charts** - Scatter plot dengan drag, zoom, regression line
- **Responsive Design** - Mobile-first approach

## 🎯 Demo Instructions

Untuk demo dengan multiple siswa:
1. Buka 3+ browser/incognito tabs (setiap tab = 1 siswa)
2. **Tab 1-3:** Flow lengkap dari Home → Survey → Solution
3. **Observe:** Real-time forum updates, scatter plot dengan data semua siswa
4. **Test AI:** Chat di 3 konteks berbeda (Guiding Resource, Solution, Hasil Tes)
5. **Mobile:** Test responsive design di mobile device

**Recommended Demo Flow:**
```
Home → Tap Milo → Kegiatan Belajar → CP → TP → Big Idea EQ → 
Forum Diskusi → The Challenge → Guiding Resource (+ AI) → 
Guiding Activity (Survey) → Hasil Guiding Activities → 
Guiding Question → Eksplorasi Diagram Pencar → Solution (+ AI) → 
Presentation View → Hasil Tes (+ AI)
```

## 📚 Documentation

Lihat folder `.kiro/specs/mentalytics/` untuk:
- `requirements.md` - Spesifikasi lengkap (EARS format)
- `design.md` - Design decisions & architecture
- `tasks.md` - Implementation roadmap

## 🤝 Team

Dikembangkan oleh Tim Mentalytics untuk mendukung pembelajaran statistika dan kesehatan mental di sekolah.

---

**Mentalytics** © 2026 | Built with ❤️ using React + Vite + Supabase
