# 🧠 Mentalytics

> **"Find your feelings with Statistic"**

Mentalytics adalah platform pembelajaran interaktif berbasis **Challenge-Based Learning (CBL)** untuk siswa SMA/Fase E yang mengintegrasikan pembelajaran matematika statistika (diagram pencar/scatter plot, data bivariat) dengan isu kesehatan mental dan kampanye anti-bullying. 

Siswa diajak mengumpulkan data secara anonim, melakukan analisis statistik data kelas mereka sendiri, dan merumuskan rekomendasi solusi nyata dengan bantuan **Milo**, asisten AI yang bertindak sebagai mitra berpikir.

---

## 🎨 Fitur Utama

- **Milo AI Companion & Tutor:**
  - **Tutor Diagram Pencar (Guiding Resource):** AI membimbing siswa memahami statistika bivariat secara bertahap (*scaffolding*), tidak memberikan jawaban langsung.
  - **Rekan Berpikir Solusi (Solution):** Memberikan feedback kritis terhadap rancangan rekomendasi solusi yang diajukan kelompok.
  - **Konselor Hasil (Hasil Tes):** Memberikan rekomendasi personal berdasarkan hasil asesmen psikologis.
- **Asesmen Bullying & Kecemasan (Guiding Activity):** Kuesioner interaktif skala Likert 5-poin dengan emote visual dan timer hitung mundur.
- **Visualisasi Diagram Pencar Interaktif:** Menggunakan Recharts untuk mengeksplorasi data kelas (Skor Bullying vs Skor Kecemasan) dengan fitur hover detail.
- **Forum Diskusi Real-time:** Menampilkan jawaban siswa terhadap *Essential Question* secara langsung menggunakan fitur Supabase Realtime WebSocket.
- **Manajemen Identitas Anonim:** Prototype didesain ramah privasi menggunakan identitas nama yang dipetakan ke UUID unik dan disimpan secara aman di `localStorage` masing-masing browser.

---

## 💻 Tech Stack

### Frontend
- **React 19 & Vite** - Framework UI cepat dan modern.
- **React Router v7** - Routing halaman client-side.
- **Tailwind CSS** - Framework styling utility-first yang disesuaikan dengan design tokens kesehatan mental.
- **Framer Motion** - Animasi mikro dan transisi karakter Milo agar lebih hidup.
- **Recharts** - Library grafik interaktif untuk diagram pencar.
- **Lucide React** - Set ikon UI yang clean dan modern.
- **React Markdown** - Merender jawaban teks terformat markdown dari AI.

### Backend & Service
- **Supabase (PostgreSQL)** - Database, REST API otomatis, dan WebSockets untuk Forum Real-time.
- **Google Gemini AI SDK** - Menghubungkan asisten AI Milo dengan model *gemini-flash* menggunakan rotasi API Key otomatis (*round-robin*) untuk kestabilan kuota.

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18.x atau yang lebih baru)
- Akun [Supabase](https://supabase.com/) gratis

### Langkah-langkah Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/USERNAME/mentalytics.git
   cd mentalytics
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin berkas contoh `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Buka berkas `.env.local` dan isi nilainya dengan credential Supabase serta Gemini API Key Anda:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   # (Opsional) Tambahkan backup keys jika diperlukan:
   # VITE_GEMINI_API_KEY_2=your_second_gemini_api_key_here
   ```

4. **Migrasi Database Supabase:**
   - Masuk ke dashboard Supabase Anda.
   - Buka menu **SQL Editor**.
   - Jalankan script SQL yang ada di folder `supabase/migrations/` secara berurutan untuk membuat tabel, relasi, dan mengaktifkan kebijakan keamanan RLS.

5. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di `http://localhost:3000` (atau port lain yang ditunjukkan pada terminal Anda).

---

## 📁 Struktur Folder Project

```
mentalytics/
├── public/
│   └── assets/
│       ├── icon/                    # Ikon untuk tombol floating
│       ├── milo/                    # Ekspresi karakter maskot Milo
│       ├── team/                    # Foto tim pengembang
│       └── video/                   # Video pengenalan Big Idea
├── src/
│   ├── components/                  # Komponen reusable (AI, Survey, Layout)
│   ├── context/                     # Global State (StudentContext, ChallengeContext)
│   ├── data/                        # Data statis kuesioner
│   ├── lib/                         # Client initialization (Supabase, Gemini, Stats)
│   ├── pages/                       # Halaman aplikasi (belajar/, Home, dll.)
│   ├── main.jsx                     # Entry point aplikasi
│   ├── index.css                    # Setup Tailwind & Design Tokens
│   └── router.jsx                   # Konfigurasi rute React Router
├── supabase/
│   └── migrations/                  # File skema database (SQL)
├── .env.example                     # Template environment variables
├── package.json                     # Daftar package dependencies & script
├── tailwind.config.js               # Konfigurasi design tokens & tema Tailwind
└── vite.config.js                   # Konfigurasi Vite bundler
```

---

## 🔒 Catatan Keamanan (Security Notes)

- **Row Level Security (RLS) di Database:** 
  Pada database prototype ini, kebijakan RLS diset untuk publik (`using (true) with check (true)`) demi kemudahan demo lokal tanpa sistem otentikasi login yang kompleks. **Jangan gunakan skema ini untuk aplikasi skala produksi!** Pastikan untuk mengubah RLS policy sebelum merilisnya ke internet publik.
- **Penyimpanan API Key Gemini:** 
  Gemini API Key dibaca dari variable environment client-side. Pastikan file `.env.local` tidak di-commit ke Git (sudah ditambahkan ke `.gitignore`).

---

## 👥 Tim Pengembang

- **Dr. Nuriana Rachmani Dewi (Nino Adhi), M.Pd.** — Dosen Pembimbing
- **Najwa Qoirun Nisa** — Content Developer
- **Rifqi Faza Ardiansyah** — Web Developer & System Analyst
- **Nada Syifa Salsabila** — Researcher
- **Dewi Amalia Khasani** — Public Relations

---

**Mentalytics** © 2026 | Dibuat dengan ❤️ oleh Tim Mentalytics
