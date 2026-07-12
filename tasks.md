# Implementation Plan — Mentalytics

Rencana implementasi ini disusun bertahap dan inkremental. Setiap task merujuk ke requirement terkait di `requirements.md`. Kerjakan berurutan dari atas ke bawah — setiap task dibangun di atas hasil task sebelumnya.

---

- [x] 1. Setup project & fondasi
  - [x] 1.1 Inisialisasi project Vite + React, install Tailwind CSS, React Router, Recharts, lucide-react, framer-motion
  - [x] 1.2 Buat struktur folder sesuai `design.md` Section 4
  - [x] 1.3 Setup `tailwind.config.js` dan `index.css` dengan CSS variables dari design token (Section 3 `design.md`)
  - [x] 1.4 Setup project Supabase (buat project baru, catat `SUPABASE_URL` & `SUPABASE_ANON_KEY` ke `.env.local`)
  - [x] 1.5 Jalankan migration `0001_init.sql` di Supabase SQL editor sesuai schema `design.md` Section 5
  - [x] 1.6 Buat `src/lib/supabaseClient.js` untuk inisialisasi Supabase client
  - _Requirements: 1.1_

- [x] 2. Context & komponen layout global
  - [x] 2.1 Implementasi `StudentContext.jsx` (`getOrCreateSiswaId`, simpan/baca localStorage)
  - [x] 2.2 Implementasi `ChallengeContext.jsx` (simpan teks The Challenge setelah di-fetch pertama kali)
  - [x] 2.3 Buat `AppShell.jsx` + `NavDrawer.jsx` (menu garis tiga → Home, Panduan, About Us, Tap Milo)
  - [x] 2.4 Buat `LearningLayout.jsx` dengan slot untuk `ChallengeFloatingButton` (selalu tampil) dan `AIFloatingButton` (conditional via prop `showAI`)
  - [x] 2.5 Setup `router.jsx` dengan seluruh path sesuai `design.md` Section 4
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 3. Halaman statis pengenalan
  - [x] 3.1 Buat `Home.jsx` — maskot Milo (pose `wave`), nama app, slogan
  - [x] 3.2 Buat `Panduan.jsx` — konten statis instruksi & fitur
  - [x] 3.3 Buat `AboutUs.jsx` — deskripsi Mentalytics + biodata tim
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Tap Milo & karakter
  - [x] 4.1 Buat komponen `MiloCharacter.jsx` (menerima prop `pose`) dan `MiloDialogBubble.jsx`
  - [x] 4.2 Buat `TapMilo.jsx` dengan 3 tombol navigasi (Sapa Milo!, Motivasi, Kegiatan Belajar)
  - [x] 4.3 Buat `TentangMilo.jsx` dengan narasi asal-usul Milo
  - [x] 4.4 Buat `Motivasi.jsx` dengan daftar kalimat motivasi
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Orientasi pembelajaran (Kegiatan Belajar → Essential Question)
  - [x] 5.1 Buat `KegiatanBelajar.jsx` dengan sapaan Milo + tombol "Tap MILO to start learning!"
  - [x] 5.2 Buat `CP.jsx` dan `TP.jsx` (highlight visual pada teks CP/TP)
  - [ ] 5.3 Buat `BigIdeaEQ.jsx` — embed video + form Essential Question
  - [ ] 5.4 Implementasi submit jawaban Essential Question ke tabel `essential_question_answers`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 6. Forum Diskusi (realtime)
  - [ ] 6.1 Buat `ForumDiskusi.jsx` — fetch awal seluruh `essential_question_answers`
  - [ ] 6.2 Implementasi Supabase Realtime channel subscribe ke INSERT baru pada tabel tersebut
  - [ ] 6.3 Render daftar jawaban (nama + isi) yang update otomatis
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. The Challenge & floating button deskripsi
  - [ ] 7.1 Buat `TheChallenge.jsx` — tampilkan instruksi kelompok + deskripsi tantangan lengkap
  - [ ] 7.2 Simpan teks challenge ke `ChallengeContext` saat halaman dimuat
  - [ ] 7.3 Implementasi `ChallengeFloatingButton.jsx` — modal/drawer menampilkan isi dari context
  - _Requirements: 6.1, 6.2, 1.3, 1.4_

- [ ] 8. Guiding Resource + AI (titik AI #1)
  - [ ] 8.1 Buat `StaticScatterExample.jsx` (Recharts, data dummy screentime vs anxiety)
  - [ ] 8.2 Buat `GuidingResource.jsx` — render chart + penjelasan konsep variabel independen/dependen
  - [ ] 8.3 Bangun Supabase Edge Function `ai-chat` — routing berdasarkan `context`, panggil Claude API
  - [ ] 8.4 Buat `AIChatPanel.jsx` + `AIFloatingButton.jsx`, hubungkan ke edge function dengan `context: 'guiding_resource'`
  - [ ] 8.5 Simpan setiap interaksi ke tabel `ai_interactions`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 13.1, 13.2, 13.4, 13.5_

- [ ] 9. Halaman transisi & Guiding Activity (survei)
  - [ ] 9.1 Buat `data/surveyQuestions.js` — daftar pertanyaan bullying & anxiety
  - [ ] 9.2 Buat `TransisiAktivitas.jsx` — penjelasan sebelum survei
  - [ ] 9.3 Buat `LikertEmoteInput.jsx` (5 emote sesuai design token Section 3.4)
  - [ ] 9.4 Buat `SurveyTimer.jsx` (countdown 15–20 menit, konfigurable)
  - [ ] 9.5 Buat `GuidingActivity.jsx` — render seluruh pertanyaan + timer + auto-submit saat waktu habis
  - [ ] 9.6 Implementasi kalkulasi skor total per sub-tema dan INSERT ke `survey_results` (+ opsional `survey_answers_raw`)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 10. Hasil Guiding Activities (tabel kelas)
  - [ ] 10.1 Buat `ClassResultsTable.jsx` — kolom No, Skor Bullying, Skor Anxiety
  - [ ] 10.2 Buat `HasilGuidingActivities.jsx` — fetch `survey_results` order by `waktu_selesai`
  - [ ] 10.3 Implementasi highlight baris milik `siswa_id` aktif (bandingkan dengan localStorage)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 11. Guiding Question
  - [ ] 11.1 Buat `GuidingQuestion.jsx` — tampilkan referensi tabel + daftar pertanyaan pemandu
  - [ ] 11.2 Implementasi submit jawaban ke `guiding_question_answers`
  - _Requirements: 10.1, 10.2_

- [ ] 12. Solution (scatter interaktif + AI #2)
  - [ ] 12.1 Buat `InteractiveScatterPlot.jsx` (Recharts `ScatterChart`, data dari seluruh `survey_results` kelas, X = Skor Bullying, Y = Skor Anxiety, dengan tooltip/hover)
  - [ ] 12.2 Buat `Solution.jsx` — render chart + form pola hubungan + field "siswa perlu diperhatikan" + textarea rekomendasi terstruktur
  - [ ] 12.3 Tambahkan `lib/stats.js` (`pearsonCorrelation`) untuk dipakai di client (preview) dan direplikasi di edge function
  - [ ] 12.4 Hubungkan `AIFloatingButton` dengan `context: 'solution'`, kirim draft rekomendasi + data agregat ke edge function
  - [ ] 12.5 Implementasi submit final ke tabel `solutions` (termasuk `ai_feedback` dari respons AI)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 13.3_

- [ ] 13. Hasil Tes (AI auto-generate + AI #3)
  - [ ] 13.1 Buat `HasilTes.jsx` — saat dimuat, otomatis panggil edge function dengan `context: 'hasil_tes'` menggunakan data agregat kelas
  - [ ] 13.2 Render rekomendasi AI beserta angka statistik pendukung (rata-rata, korelasi)
  - [ ] 13.3 Hubungkan `AIFloatingButton` untuk elaborasi lanjutan dengan konteks yang sama
  - _Requirements: 12.1, 12.2, 12.3, 13.3_

- [ ] 14. Reset & seed data demo
  - [ ] 14.1 Buat script `supabase/seed/reset.sql` (truncate seluruh tabel kecuali skema)
  - [ ] 14.2 (Opsional) Buat script seed dummy data untuk testing UI tanpa perlu isi survei manual berkali-kali
  - _Requirements: 14.1, 14.2_

- [ ] 15. QA, responsivitas, dan polish akhir
  - [ ] 15.1 Uji seluruh halaman pada breakpoint mobile (≤430px) dan desktop
  - [ ] 15.2 Pastikan tombol floating (Challenge & AI) tidak menutupi konten penting di mobile
  - [ ] 15.3 Ganti seluruh placeholder gambar Milo dengan aset asli dari `public/assets/milo/`
  - [ ] 15.4 Uji ulang alur penuh end-to-end: Home → ... → Hasil Tes dengan minimal 3 "siswa" (3 browser/incognito berbeda) untuk memastikan data agregat & realtime bekerja
  - [ ] 15.5 Jalankan `reset.sql` sebagai gladi bersih sebelum demo final
  - _Requirements: 1.1, 14.1_
