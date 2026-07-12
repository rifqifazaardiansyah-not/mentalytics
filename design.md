# Design Document — Mentalytics

## 1. Overview

Mentalytics dibangun sebagai **Single Page Application (SPA)** dengan React + Vite, menggunakan Supabase sebagai backend (Postgres + Realtime + Auto REST API) dan Claude API (via edge function) sebagai AI assistant di tiga titik pembelajaran. Tidak ada sistem autentikasi/role — identitas siswa disimpan sebagai UUID di `localStorage`.

Prototype ini didesain untuk dikerjakan dalam 8 hari, dijalankan secara lokal (`npm run dev`) saat demo, dengan database di cloud (Supabase free tier).

---

## 2. Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend framework | React 18 + Vite | Fast HMR, cocok untuk vibe coding |
| Styling | Tailwind CSS | Utility-first, gampang konsisten dengan design token |
| Routing | React Router v6 | Client-side routing sesuai struktur di bawah |
| Chart / Scatter Plot | Recharts (`ScatterChart`) | Interaktif, punya `ReferenceArea`/tooltip untuk drag-explore |
| State global ringan | React Context (`StudentContext`, `ChallengeContext`) | Tidak perlu Redux untuk skala prototype ini |
| Backend & DB | Supabase (Postgres) | Auto REST API + Realtime subscription |
| Realtime | Supabase Realtime channel | Untuk Forum Diskusi |
| AI | Claude API dipanggil dari Supabase Edge Function (Deno) | API key tidak boleh ada di client |
| Animasi ringan (opsional) | Framer Motion | Transisi antar halaman Milo agar lebih hidup |
| Icon | lucide-react | Konsisten dengan gaya UI modern |

---

## 3. Design Tokens — Color Palette

Palet warna diambil dari referensi "Mental Health Color Palette" yang diberikan (nuansa teal-ke-hijau lembut), dipakai sebagai warna primer sistem. Karena palet asli hanya berisi 5 nuansa hijau-teal (tanpa warna teks/status), ditambahkan warna pendukung (neutral, teks, status) supaya kontras & aksesibilitas (WCAG AA) tetap terjaga.

### 3.1 Warna Inti (dari referensi)

| Token | Hex | RGB | Kegunaan |
|---|---|---|---|
| `--color-primary-100` | `#d4edf6` | (212,237,246) | Background lembut, section alternatif |
| `--color-primary-200` | `#c4f0ed` | (196,240,237) | Card background, hover state ringan |
| `--color-primary-300` | `#c9f4e4` | (201,244,228) | Border lembut, divider |
| `--color-primary-400` | `#bef4d5` | (190,244,213) | Badge/tag, chip aktif |
| `--color-primary-500` | `#b2f2c3` | (178,242,195) | Accent hijau utama (highlight, progress bar) |

### 3.2 Warna Turunan (ditambahkan untuk kontras & fungsi)

| Token | Hex | Kegunaan |
|---|---|---|
| `--color-primary-600` | `#7fd9a8` | CTA button utama (hover/active dari primary-500) |
| `--color-primary-700` | `#4fb583` | Teks/ikon di atas background terang, active nav |
| `--color-ink-900` | `#1f2d28` | Teks utama (kontras tinggi di atas background hijau muda) |
| `--color-ink-600` | `#4b5f58` | Teks sekunder / deskripsi |
| `--color-surface` | `#ffffff` | Background card/modal |
| `--color-bg` | `#f6fcf9` | Background halaman (netral kehijauan sangat muda) |
| `--color-warning` | `#f6c453` | Timer hampir habis, alert non-kritis |
| `--color-danger` | `#e57373` | Error/validasi gagal |
| `--color-info` | `#7cc4e8` | Info AI / tooltip bantuan |
| `--color-highlight-self` | `#bef4d5` dengan border `#4fb583` 2px | Highlight baris data milik siswa sendiri di tabel |

### 3.3 Tipografi

| Elemen | Font | Ukuran (mobile / desktop) |
|---|---|---|
| Heading (H1) | Poppins SemiBold | 24px / 32px |
| Heading (H2) | Poppins Medium | 20px / 26px |
| Body | Inter Regular | 14px / 16px |
| Karakter Milo (dialog) | Poppins Medium, italic opsional | 15px / 17px |

### 3.4 Komponen Emote Skala Likert (Guiding Activity)

5 tingkat, konsisten warna dari palet (semakin "positif" makin ke arah primary-500):
1. Sangat Sedih — warna aksen `#e57373` (danger, out of palette — kontras sengaja untuk kondisi negatif)
2. Sedih — `#f6c453`
3. Netral — `#d4edf6` (primary-100)
4. Senang — `#bef4d5` (primary-400)
5. Sangat Senang — `#7fd9a8` (primary-600)

> Catatan desain: karena topik sensitif (bullying/anxiety), skema warna tetap tenang (tidak neon/mencolok), sesuai prinsip "ruang aman psikologis" pada outline proposal.

---

## 4. Struktur Folder Project (dari nol)

```
mentalytics/
├── .kiro/
│   └── specs/
│       └── mentalytics/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── public/
│   └── assets/
│       └── milo/                  # gambar karakter Milo diupload manual di sini
│           ├── milo-wave.png
│           ├── milo-happy.png
│           ├── milo-thinking.png
│           └── milo-explain.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                  # import Tailwind + CSS variables design token
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   └── stats.js                # helper: hitung skor Likert, korelasi Pearson
│   ├── context/
│   │   ├── StudentContext.jsx      # simpan/ambil siswa_id & nama dari localStorage
│   │   └── ChallengeContext.jsx    # simpan teks "The Challenge" agar bisa diakses global
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx        # wrapper umum (nav drawer)
│   │   │   ├── LearningLayout.jsx  # wrapper khusus Guiding Resource s.d. Hasil Tes
│   │   │   ├── NavDrawer.jsx
│   │   │   ├── ChallengeFloatingButton.jsx
│   │   │   └── AIFloatingButton.jsx
│   │   ├── milo/
│   │   │   ├── MiloCharacter.jsx
│   │   │   └── MiloDialogBubble.jsx
│   │   ├── survey/
│   │   │   ├── LikertEmoteInput.jsx
│   │   │   ├── SurveyTimer.jsx
│   │   │   └── SurveyQuestionCard.jsx
│   │   ├── chart/
│   │   │   ├── StaticScatterExample.jsx   # untuk Guiding Resource
│   │   │   └── InteractiveScatterPlot.jsx # untuk Solution
│   │   ├── table/
│   │   │   └── ClassResultsTable.jsx
│   │   ├── ai/
│   │   │   └── AIChatPanel.jsx
│   │   └── ui/                     # button, card, modal, input generik
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Panduan.jsx
│   │   ├── AboutUs.jsx
│   │   ├── TapMilo.jsx
│   │   ├── TentangMilo.jsx
│   │   ├── Motivasi.jsx
│   │   ├── belajar/
│   │   │   ├── KegiatanBelajar.jsx
│   │   │   ├── CP.jsx
│   │   │   ├── TP.jsx
│   │   │   ├── BigIdeaEQ.jsx
│   │   │   ├── ForumDiskusi.jsx
│   │   │   ├── TheChallenge.jsx
│   │   │   ├── GuidingResource.jsx
│   │   │   ├── TransisiAktivitas.jsx
│   │   │   ├── GuidingActivity.jsx
│   │   │   ├── HasilGuidingActivities.jsx
│   │   │   ├── GuidingQuestion.jsx
│   │   │   ├── Solution.jsx
│   │   │   └── HasilTes.jsx
│   ├── router.jsx
│   └── data/
│       └── surveyQuestions.js       # daftar pertanyaan bullying & anxiety (statis)
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql            # lihat Section 5
│   └── functions/
│       └── ai-chat/
│           └── index.ts             # edge function pemanggil Claude API
├── .env.local                       # SUPABASE_URL, SUPABASE_ANON_KEY (client-safe)
├── tailwind.config.js
├── package.json
└── vite.config.js
```

---

## 5. Skema Database (Supabase / Postgres)

```sql
-- 0001_init.sql

create extension if not exists "uuid-ossp";

create table siswa (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  created_at timestamptz default now()
);

create table essential_question_answers (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  jawaban text not null,
  created_at timestamptz default now()
);

create table survey_answers_raw (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  tipe text check (tipe in ('bullying', 'anxiety')) not null,
  no_pertanyaan int not null,
  skor int check (skor between 1 and 5) not null,
  created_at timestamptz default now()
);

create table survey_results (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade unique,
  skor_bullying int not null,
  skor_anxiety int not null,
  waktu_selesai timestamptz default now()
);

create table guiding_question_answers (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  no_pertanyaan int not null,
  jawaban text not null,
  created_at timestamptz default now()
);

create table solutions (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade unique,
  pola_hubungan text check (pola_hubungan in ('positif', 'negatif', 'tidak ada')),
  siswa_perlu_perhatian text,
  rekomendasi text,
  ai_feedback text,
  created_at timestamptz default now()
);

create table ai_interactions (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  halaman text check (halaman in ('guiding_resource', 'solution', 'hasil_tes')),
  prompt text,
  response text,
  created_at timestamptz default now()
);

-- Enable Realtime untuk Forum Diskusi
alter publication supabase_realtime add table essential_question_answers;

-- RLS: prototype tanpa auth, buka akses insert/select publik (JANGAN dipakai di production)
alter table siswa enable row level security;
create policy "public_all_siswa" on siswa for all using (true) with check (true);
alter table essential_question_answers enable row level security;
create policy "public_all_eqa" on essential_question_answers for all using (true) with check (true);
alter table survey_answers_raw enable row level security;
create policy "public_all_sar" on survey_answers_raw for all using (true) with check (true);
alter table survey_results enable row level security;
create policy "public_all_sr" on survey_results for all using (true) with check (true);
alter table guiding_question_answers enable row level security;
create policy "public_all_gqa" on guiding_question_answers for all using (true) with check (true);
alter table solutions enable row level security;
create policy "public_all_sol" on solutions for all using (true) with check (true);
alter table ai_interactions enable row level security;
create policy "public_all_ai" on ai_interactions for all using (true) with check (true);
```

> ⚠️ Catatan keamanan: RLS `using (true)` di atas sengaja dibuat terbuka penuh **khusus untuk prototype demo tertutup**. Jangan gunakan konfigurasi ini jika aplikasi di-deploy publik.

---

## 6. Konsep AI

### 6.1 Arsitektur Panggilan AI

```
Client (AIChatPanel.jsx)
   │  POST { context, siswa_id, user_input, extra_data }
   ▼
Supabase Edge Function "ai-chat"
   │  1. Pilih system prompt berdasarkan `context`
   │  2. Jika context = 'solution' atau 'hasil_tes':
   │     - fetch survey_results dari DB
   │     - hitung rata-rata & korelasi Pearson (lib/stats.js versi server)
   │     - sisipkan angka ke prompt
   │  3. Panggil Claude API (model claude-sonnet-4-6, max_tokens 1000)
   │  4. Simpan log ke tabel ai_interactions
   ▼
Response dikembalikan ke client, ditampilkan di AIChatPanel
```

### 6.2 System Prompt per Konteks

**`guiding_resource`** — AI sebagai penjelas konsep (Socratic, bukan jawaban instan):
> "Kamu adalah AI Coach di Mentalytics yang membantu murid SMA memahami konsep diagram pencar/scatter plot dan data bivariat. Jangan langsung memberi jawaban akhir — ajukan pertanyaan balik atau berikan analogi sederhana agar murid menemukan pemahaman sendiri. Gunakan bahasa Indonesia yang ramah dan singkat."

**`solution`** — AI sebagai mitra berpikir kritis terhadap draft rekomendasi:
> "Kamu adalah AI Coach di Mentalytics. Berdasarkan data kelas berikut: rata-rata skor bullying = {avg_bullying}, rata-rata skor anxiety = {avg_anxiety}, koefisien korelasi Pearson = {correlation}. Murid menuliskan draft rekomendasi: '{draft_rekomendasi}'. Berikan feedback konstruktif singkat (maks 3 kalimat): apakah rekomendasi tersebut masuk akal berdasarkan data, dan sebutkan satu faktor yang mungkin belum dipertimbangkan murid."

**`hasil_tes`** — AI menghasilkan rekomendasi akhir & menjawab pertanyaan lanjutan:
> "Kamu adalah AI Coach di Mentalytics. Berdasarkan data kelas: {ringkasan_statistik}, buat rekomendasi akhir untuk pihak sekolah dalam 3-4 kalimat, sertakan angka pendukung dari data ini. Jika murid bertanya lebih lanjut, jawab dengan merujuk kembali ke data yang sama."

### 6.3 Perhitungan Statistik Pendukung (agar AI tidak berhalusinasi)

`src/lib/stats.js`:
```js
export function pearsonCorrelation(x, y) {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const denX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0));
  const denY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0));
  return num / (denX * denY);
}
```
Dipanggil di edge function (versi Deno/TS) sebelum membangun prompt untuk `solution` dan `hasil_tes`.

---

## 7. Alur Data Antar Halaman (Ringkasan)

```
Guiding Activity (survei per siswa)
        │  INSERT survey_answers_raw (opsional) + survey_results
        ▼
Hasil Guiding Activities (SELECT survey_results, order by waktu_selesai)
        │
        ▼
Guiding Question (baca survey_results sebagai referensi + INSERT jawaban)
        │
        ▼
Solution (SELECT survey_results seluruh kelas → render scatter →
          INSERT solutions, panggil AI dengan agregat data)
        │
        ▼
Hasil Tes (SELECT survey_results + solutions → AI generate rekomendasi final)
```

---

## 8. Komponen Layout Kunci

### `LearningLayout.jsx`
Wrapper untuk seluruh halaman dari Guiding Resource sampai Hasil Tes.
- Selalu render `<ChallengeFloatingButton />` (ambil teks dari `ChallengeContext`, fetch sekali di `TheChallenge.jsx` lalu simpan di context supaya tidak fetch ulang tiap halaman).
- Render `<AIFloatingButton context={...} />` hanya jika prop `showAI` diisi `true` (dipasang di route Guiding Resource, Solution, Hasil Tes).

### `StudentContext.jsx`
- `getOrCreateSiswaId(nama)` → cek localStorage, jika belum ada buat baris baru di tabel `siswa`, simpan `siswa_id` + `nama` di localStorage.
- Dipakai di semua halaman yang butuh submit data.

---

## 9. Aset Karakter Milo

Gambar karakter Milo akan diupload manual oleh pengguna ke `public/assets/milo/`. Rekomendasi penamaan file agar mudah direferensikan AI coding assistant:
- `milo-wave.png` — pose menyapa (Home, Tap Milo, Kegiatan Belajar)
- `milo-happy.png` — pose senang (Motivasi, Hasil Tes positif)
- `milo-thinking.png` — pose berpikir (Guiding Resource, saat AI panel terbuka)
- `milo-explain.png` — pose menjelaskan (Tentang Milo, CP, TP)

Komponen `MiloCharacter.jsx` menerima prop `pose` (`'wave' | 'happy' | 'thinking' | 'explain'`) dan memetakan ke path file di atas.
