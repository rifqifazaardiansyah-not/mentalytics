# Requirements Document — Mentalytics

## Pendahuluan

Mentalytics adalah website pembelajaran interaktif berbasis **Challenge Based Learning (CBL)** berbantuan AI untuk murid Fase E/SMA, yang mengintegrasikan materi statistika (diagram pencar/scatter plot, data bivariat) dengan isu kesehatan mental dan anti-bullying. Murid mengisi survei anonim tentang bullying & anxiety, lalu menganalisis data kelas mereka sendiri untuk merumuskan rekomendasi solusi berbasis data, dengan AI sebagai mitra berpikir (bukan pemberi jawaban instan).

Dokumen ini adalah spesifikasi kebutuhan sistem dalam format EARS (Easy Approach to Requirements Syntax) untuk dibangun sebagai prototype dalam 8 hari.

**Batasan Prototype (disepakati):**
- Tidak ada sistem login/role (tidak ada akun guru vs siswa). Satu instance app = satu sesi kelas aktif.
- Identitas siswa hanya berupa nama, disimpan sebagai `siswa_id` (UUID) di `localStorage` browser.
- Semua siswa dapat melihat data agregat seluruh kelas (skor bullying/anxiety semua siswa), dengan highlight untuk data milik diri sendiri.
- Reset data antar-sesi demo dilakukan manual lewat script, bukan fitur UI.

---

## Requirement 1 — Navigasi & Layout Global

**User Story:** Sebagai siswa, saya ingin dapat mengakses seluruh halaman aplikasi melalui menu navigasi yang konsisten, agar saya tidak tersesat selama proses belajar.

### Acceptance Criteria
1. WHEN aplikasi dimuat pada perangkat apa pun (desktop atau mobile) THE SYSTEM SHALL menyesuaikan tata letak (responsive) tanpa kehilangan fungsi.
2. WHEN pengguna menekan ikon menu (hamburger/garis tiga) THE SYSTEM SHALL menampilkan navigasi ke halaman: Home, Panduan, About Us, Tap Milo.
3. WHEN pengguna berada di halaman mana pun dalam alur Kegiatan Belajar (dari Guiding Resource sampai Hasil Tes) THE SYSTEM SHALL menampilkan tombol floating "Deskripsi Tantangan" yang persisten di semua halaman tersebut.
4. WHEN pengguna menekan tombol "Deskripsi Tantangan" THE SYSTEM SHALL menampilkan isi The Challenge dalam modal/drawer tanpa memuat ulang atau berpindah halaman.
5. WHEN pengguna berada di halaman Guiding Resource, Solution, atau Hasil Tes THE SYSTEM SHALL menampilkan tombol floating "AI".
6. WHEN pengguna berada di halaman selain Guiding Resource, Solution, atau Hasil Tes THE SYSTEM SHALL TIDAK menampilkan tombol floating "AI".
7. IF `siswa_id` belum ada di localStorage WHEN pengguna mencoba mengakses halaman yang membutuhkan identitas (Guiding Activity dan seterusnya) THEN THE SYSTEM SHALL meminta pengguna mengisi nama terlebih dahulu.

---

## Requirement 2 — Halaman Statis Pengenalan (Home, Panduan, About Us)

**User Story:** Sebagai siswa baru, saya ingin memahami apa itu Mentalytics dan cara menggunakannya sebelum mulai belajar.

### Acceptance Criteria
1. WHEN halaman Home dimuat THE SYSTEM SHALL menampilkan karakter maskot Milo, nama aplikasi "Mentalytics", dan slogan "Find your feelings with Statistic".
2. WHEN pengguna membuka halaman Panduan THE SYSTEM SHALL menampilkan instruksi penggunaan aplikasi dari awal sampai akhir beserta daftar fitur.
3. WHEN pengguna membuka halaman About Us THE SYSTEM SHALL menampilkan deskripsi Mentalytics dan biodata tim (nama, program studi/jabatan).

---

## Requirement 3 — Tap Milo & Pengenalan Karakter

**User Story:** Sebagai siswa, saya ingin berinteraksi dengan karakter Milo sebagai teman belajar sebelum masuk ke materi.

### Acceptance Criteria
1. WHEN halaman Tap Milo dimuat THE SYSTEM SHALL menampilkan karakter Milo dengan sapaan kontekstual dan tiga tombol navigasi: "Sapa Milo!", "Motivasi", "Kegiatan Belajar".
2. WHEN pengguna menekan "Sapa Milo!" THE SYSTEM SHALL menavigasi ke halaman Tentang Milo yang berisi narasi asal-usul dan makna nama MILO (Measure, Interpret, Learn, Observe).
3. WHEN pengguna menekan "Motivasi" THE SYSTEM SHALL menavigasi ke halaman Motivasi yang menampilkan kumpulan kalimat motivasi dari Milo.
4. WHEN pengguna menekan "Kegiatan Belajar" THE SYSTEM SHALL menavigasi ke halaman Kegiatan Belajar (mulai alur pembelajaran inti).

---

## Requirement 4 — Orientasi Pembelajaran (Kegiatan Belajar, CP, TP, Big Idea & EQ)

**User Story:** Sebagai siswa, saya ingin memahami tujuan pembelajaran dan konteks masalah sebelum mengerjakan tantangan.

### Acceptance Criteria
1. WHEN halaman Kegiatan Belajar dimuat THE SYSTEM SHALL menampilkan sapaan pembuka Milo dan tombol "Tap MILO to start learning!".
2. WHEN pengguna menekan tombol tersebut THE SYSTEM SHALL menavigasi ke halaman CP.
3. WHEN halaman CP dimuat THE SYSTEM SHALL menampilkan penjelasan konsep Capaian Pembelajaran beserta teks CP itu sendiri dengan highlight visual.
4. WHEN halaman TP dimuat THE SYSTEM SHALL menampilkan penjelasan konsep Tujuan Pembelajaran beserta daftar TP.
5. WHEN halaman Big Idea & Essential Question dimuat THE SYSTEM SHALL menampilkan video terkait bullying dan dampaknya pada anxiety, diikuti pertanyaan pemantik (Essential Question).
6. WHEN pengguna mengisi jawaban Essential Question dan submit THE SYSTEM SHALL menyimpan jawaban ke database dengan `siswa_id` terkait.

---

## Requirement 5 — Forum Diskusi

**User Story:** Sebagai siswa, saya ingin melihat jawaban teman-teman sekelas terhadap Essential Question secara real-time sebagai bahan diskusi kelas.

### Acceptance Criteria
1. WHEN halaman Forum Diskusi dimuat THE SYSTEM SHALL menampilkan seluruh jawaban Essential Question yang telah disubmit oleh siswa di kelas tersebut.
2. WHEN ada siswa baru mengirim jawaban Essential Question SAAT halaman Forum Diskusi sedang terbuka THE SYSTEM SHALL memperbarui daftar jawaban secara realtime tanpa perlu refresh manual.
3. WHEN daftar jawaban ditampilkan THE SYSTEM SHALL menyertakan nama siswa dan isi jawaban.

---

## Requirement 6 — The Challenge

**User Story:** Sebagai siswa, saya ingin memahami instruksi dan konteks tantangan sebelum memulai investigasi data.

### Acceptance Criteria
1. WHEN halaman The Challenge dimuat THE SYSTEM SHALL menampilkan instruksi pembentukan kelompok, deskripsi tantangan lengkap, dan tombol lanjut ke Guiding Resource.
2. WHEN konten The Challenge disimpan THE SYSTEM SHALL menjadikannya dapat diakses ulang melalui tombol floating "Deskripsi Tantangan" di semua halaman berikutnya tanpa navigasi balik.

---

## Requirement 7 — Guiding Resource

**User Story:** Sebagai siswa, saya ingin memahami konsep diagram pencar sebelum mengisi survei, dibantu AI jika masih bingung.

### Acceptance Criteria
1. WHEN halaman Guiding Resource dimuat THE SYSTEM SHALL menampilkan contoh diagram pencar statis dengan sumbu X = waktu screentime dan sumbu Y = skor kecemasan, beserta penjelasan konsep variabel independen dan dependen.
2. WHEN pengguna menekan tombol floating "AI" THE SYSTEM SHALL membuka panel chat AI yang dapat menjawab pertanyaan terkait materi diagram pencar pada halaman ini.
3. WHEN AI merespons pertanyaan pengguna THE SYSTEM SHALL memberikan penjelasan bertahap (scaffolding) alih-alih jawaban langsung/instan.
4. WHEN pengguna menekan tombol lanjut THE SYSTEM SHALL menavigasi ke halaman transisi Guiding Activity.

---

## Requirement 8 — Halaman Transisi & Guiding Activity (Survei)

**User Story:** Sebagai siswa, saya ingin mengisi survei bullying & anxiety dengan cara yang ringan dan dalam waktu terbatas, agar data kelas terkumpul secara adil dan cepat.

### Acceptance Criteria
1. WHEN halaman transisi dimuat THE SYSTEM SHALL menjelaskan apa yang akan dilakukan siswa pada Guiding Activity berikutnya.
2. WHEN halaman Guiding Activity dimuat THE SYSTEM SHALL menampilkan pertanyaan survei dengan dua sub-tema (Bullying dan Anxiety), masing-masing dijawab dengan skala Likert 5 poin yang direpresentasikan sebagai emote wajah (sangat sedih sampai sangat bahagia).
3. WHEN halaman Guiding Activity dimuat THE SYSTEM SHALL menjalankan timer hitung mundur 15–20 menit yang terlihat oleh pengguna.
4. WHEN waktu timer habis SEBELUM pengguna menyelesaikan seluruh pertanyaan THE SYSTEM SHALL otomatis submit jawaban yang telah terisi dan menavigasi ke halaman Hasil Guiding Activities.
5. WHEN pengguna menyelesaikan seluruh pertanyaan sebelum waktu habis dan menekan submit THE SYSTEM SHALL menghitung skor total Bullying dan skor total Anxiety, menyimpannya ke database dengan `siswa_id` dan `waktu_selesai`, lalu menavigasi ke halaman Hasil Guiding Activities.
6. WHEN skor dihitung THE SYSTEM SHALL menjumlahkan nilai skala Likert dari seluruh pertanyaan pada masing-masing sub-tema secara terpisah.

---

## Requirement 9 — Hasil Guiding Activities

**User Story:** Sebagai siswa, saya ingin melihat data hasil survei seluruh kelas dalam bentuk tabel agar dapat menjadi dasar analisis diagram pencar.

### Acceptance Criteria
1. WHEN halaman Hasil Guiding Activities dimuat THE SYSTEM SHALL menampilkan tabel dengan kolom No, Skor Bullying, Skor Anxiety untuk seluruh siswa di kelas.
2. WHEN tabel disusun THE SYSTEM SHALL mengurutkan baris berdasarkan `waktu_selesai` tercepat ke paling lama.
3. WHEN baris data milik `siswa_id` yang sedang login ditampilkan THE SYSTEM SHALL memberikan penyorotan visual (highlight) berbeda dari baris lainnya.
4. WHEN data belum lengkap (belum semua siswa submit) THE SYSTEM SHALL tetap menampilkan data yang sudah tersedia tanpa error.

---

## Requirement 10 — Guiding Question

**User Story:** Sebagai siswa, saya ingin dipandu pertanyaan reflektif setelah membuat diagram pencar manual di kertas berdasarkan tabel hasil kelas.

### Acceptance Criteria
1. WHEN halaman Guiding Question dimuat THE SYSTEM SHALL menampilkan tabel Hasil Guiding Activities (atau ringkasannya) sebagai referensi, beserta daftar pertanyaan pemandu.
2. WHEN pengguna mengisi jawaban pertanyaan pemandu dan submit THE SYSTEM SHALL menyimpan jawaban ke database terkait `siswa_id`.

---

## Requirement 11 — Solution (Diagram Pencar Interaktif & Rekomendasi)

**User Story:** Sebagai siswa, saya ingin membuat dan mengeksplorasi diagram pencar interaktif dari data kelas, menyimpulkan pola hubungan, dan merumuskan rekomendasi solusi dibantu AI.

### Acceptance Criteria
1. WHEN halaman Solution dimuat THE SYSTEM SHALL merender diagram pencar interaktif berdasarkan seluruh data `survey_results` kelas (sumbu X = Skor Bullying, sumbu Y = Skor Anxiety).
2. WHEN diagram pencar dirender THE SYSTEM SHALL memungkinkan pengguna berinteraksi (hover/drag/explore titik data) untuk melihat detail.
3. WHEN pengguna diminta menyimpulkan pola hubungan THE SYSTEM SHALL menyediakan pilihan (positif/negatif/tidak ada) dan field teks untuk siswa dengan skor bullying yang perlu diperhatikan.
4. WHEN pengguna menuliskan rekomendasi dalam format terstruktur ("Karena diagram menunjukkan [pola]... kami merekomendasikan sekolah untuk [rekomendasi]... karena [alasan]") THE SYSTEM SHALL menyimpan input tersebut.
5. WHEN pengguna menekan tombol floating "AI" THE SYSTEM SHALL mengirimkan data agregat kelas dan draft rekomendasi siswa ke AI, lalu menampilkan feedback konstruktif AI terhadap rekomendasi tersebut.
6. WHEN pengguna menekan submit final pada halaman Solution THE SYSTEM SHALL menyimpan seluruh data solution (pola, siswa perlu diperhatikan, rekomendasi, ai_feedback) dan menavigasi ke halaman Hasil Tes.

---

## Requirement 12 — Hasil Tes

**User Story:** Sebagai siswa, saya ingin melihat kesimpulan akhir dan rekomendasi AI berdasarkan seluruh proses analisis data kelas.

### Acceptance Criteria
1. WHEN halaman Hasil Tes dimuat THE SYSTEM SHALL secara otomatis menghasilkan rekomendasi AI berdasarkan data agregat survei kelas (skor bullying, anxiety, dan korelasi statistik sederhana antar keduanya).
2. WHEN rekomendasi AI ditampilkan THE SYSTEM SHALL menyertakan angka statistik pendukung (misal: rata-rata skor, koefisien korelasi) agar rekomendasi grounded pada data asli, bukan asumsi.
3. WHEN pengguna menekan tombol floating "AI" THE SYSTEM SHALL membuka panel chat untuk menjelaskan detail lebih lanjut dari rekomendasi yang telah ditampilkan.

---

## Requirement 13 — Integrasi AI (Lintas Halaman)

**User Story:** Sebagai pengembang sistem, saya ingin satu mekanisme AI yang konsisten dan aman digunakan di tiga titik berbeda (Guiding Resource, Solution, Hasil Tes).

### Acceptance Criteria
1. WHEN aplikasi client memanggil fitur AI THE SYSTEM SHALL mengirim request ke backend/edge function, TIDAK PERNAH memanggil API AI langsung dari browser dengan API key terekspos.
2. WHEN backend menerima request AI THE SYSTEM SHALL menyisipkan system prompt yang berbeda sesuai konteks halaman (`guiding_resource`, `solution`, `hasil_tes`).
3. WHEN request AI terkait Solution atau Hasil Tes dikirim THE SYSTEM SHALL menyertakan data numerik agregat kelas (skor, korelasi) dalam prompt agar respons AI berbasis data aktual.
4. WHEN AI merespons THE SYSTEM SHALL menyimpan log interaksi (prompt & response) ke tabel `ai_interactions` untuk keperluan debug/demo.
5. IF permintaan ke API AI gagal (timeout/error) THEN THE SYSTEM SHALL menampilkan pesan error yang ramah pengguna tanpa membuat aplikasi crash.

---

## Requirement 14 — Manajemen Data & Reset Demo

**User Story:** Sebagai penyelenggara demo, saya ingin dapat mereset seluruh data kelas dengan mudah sebelum sesi demo baru dimulai.

### Acceptance Criteria
1. WHEN skrip reset dijalankan THE SYSTEM SHALL menghapus seluruh baris pada tabel `siswa`, `essential_question_answers`, `survey_results`, `guiding_question_answers`, `solutions`, dan `ai_interactions`.
2. WHEN localStorage browser dibersihkan secara manual oleh pengguna THE SYSTEM SHALL memperlakukan pengguna tersebut sebagai siswa baru pada sesi berikutnya.
