-- Dummy Data untuk Kelas "try&error" - Kode: XLTAE7
-- Run this SQL script in Supabase SQL Editor

-- 1. Create kelas "try&error"
-- Delete existing if any, then insert
DELETE FROM kelas WHERE kode_kelas = 'XLTAE7';

INSERT INTO kelas (id, kode_kelas, nama_kelas, nama_guru, tahun_ajaran, status, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'XLTAE7',
  'Kelas try&error',
  'Pak Budi Santoso',
  '2024/2025',
  'aktif',
  now(),
  now()
);

-- 2. Create siswa (15 students) dengan identitas lengkap
INSERT INTO siswa (id, nama, kelas_id, usia, jenis_kelamin, created_at) VALUES
-- Student 1: Andi (You can use this for testing)
('22222222-2222-2222-2222-222222222221', 'Andi Pratama', '11111111-1111-1111-1111-111111111111', 16, 'Laki-laki', now() - interval '5 days'),
-- Student 2-15
('22222222-2222-2222-2222-222222222222', 'Budi Setiawan', '11111111-1111-1111-1111-111111111111', 16, 'Laki-laki', now() - interval '5 days'),
('22222222-2222-2222-2222-222222222223', 'Citra Dewi', '11111111-1111-1111-1111-111111111111', 15, 'Perempuan', now() - interval '5 days'),
('22222222-2222-2222-2222-222222222224', 'Dani Irawan', '11111111-1111-1111-1111-111111111111', 16, 'Laki-laki', now() - interval '5 days'),
('22222222-2222-2222-2222-222222222225', 'Eka Putri', '11111111-1111-1111-1111-111111111111', 15, 'Perempuan', now() - interval '5 days'),
('22222222-2222-2222-2222-222222222226', 'Fajar Ramadhan', '11111111-1111-1111-1111-111111111111', 17, 'Laki-laki', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222227', 'Gita Sari', '11111111-1111-1111-1111-111111111111', 16, 'Perempuan', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222228', 'Hadi Wijaya', '11111111-1111-1111-1111-111111111111', 16, 'Laki-laki', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222229', 'Indah Permata', '11111111-1111-1111-1111-111111111111', 15, 'Perempuan', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222230', 'Joko Susilo', '11111111-1111-1111-1111-111111111111', 17, 'Laki-laki', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222231', 'Kartika Sari', '11111111-1111-1111-1111-111111111111', 16, 'Perempuan', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222232', 'Lukman Hakim', '11111111-1111-1111-1111-111111111111', 16, 'Laki-laki', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222233', 'Maya Angelina', '11111111-1111-1111-1111-111111111111', 15, 'Perempuan', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222234', 'Nina Safitri', '11111111-1111-1111-1111-111111111111', 16, 'Perempuan', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222235', 'Oscar Prasetyo', '11111111-1111-1111-1111-111111111111', 17, 'Laki-laki', now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- 3. Essential Question Answers (Big Idea / EQ)
-- Pertanyaan: "Apakah diagram pencar dapat membantu kita memahami hubungan antara dua hal dalam kehidupan sehari-hari?"
INSERT INTO essential_question_answers (siswa_id, jawaban, created_at) VALUES
('22222222-2222-2222-2222-222222222221', 'Menurut saya diagram pencar bisa membantu kita melihat pola hubungan antara dua variabel, misalnya waktu belajar dengan nilai ujian.', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222222', 'Ya, diagram pencar sangat membantu untuk melihat apakah ada korelasi positif, negatif, atau tidak ada hubungan sama sekali.', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222223', 'Diagram pencar bisa digunakan untuk menganalisis data bullying dan kecemasan siswa seperti yang kita pelajari.', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222224', 'Saya pikir diagram pencar berguna untuk visualisasi data sehingga mudah dipahami dibanding hanya melihat angka.', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222225', 'Dengan scatter plot kita bisa melihat outlier dan pola distribusi data dengan lebih jelas.', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222226', 'Diagram pencar membantu kita membuat keputusan berdasarkan data, bukan hanya feeling.', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222227', 'Saya setuju diagram pencar penting untuk statistika karena bisa menunjukkan tren.', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222228', 'Menurut saya scatter plot berguna tapi harus dipahami dengan benar agar tidak salah interpretasi.', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222229', 'Ya, diagram pencar membantu kita memahami hubungan kausal atau korelasional antara dua fenomena.', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222230', 'Diagram pencar bisa digunakan di berbagai bidang seperti ekonomi, kesehatan, dan pendidikan.', now() - interval '3 days')
ON CONFLICT DO NOTHING;

-- 4. Survey Results (Bullying & Anxiety Scores)
-- Skor Bullying: 0-88 (22 pertanyaan x 0-4), Terindikasi bullying jika ≥22
-- Skor Anxiety: 0-56 (14 kategori x 0-4)
INSERT INTO survey_results (siswa_id, skor_bullying, skor_anxiety, waktu_selesai) VALUES
('22222222-2222-2222-2222-222222222221', 28, 24, now() - interval '3 days 5 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222222', 15, 12, now() - interval '3 days 4 hours'), -- Tidak terindikasi
('22222222-2222-2222-2222-222222222223', 42, 35, now() - interval '3 days 3 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222224', 32, 28, now() - interval '3 days 2 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222225', 18, 15, now() - interval '3 days 1 hour'), -- Tidak terindikasi
('22222222-2222-2222-2222-222222222226', 45, 38, now() - interval '2 days 6 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222227', 22, 18, now() - interval '2 days 5 hours'), -- Terindikasi bullying (batas)
('22222222-2222-2222-2222-222222222228', 38, 32, now() - interval '2 days 4 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222229', 12, 10, now() - interval '2 days 3 hours'), -- Tidak terindikasi
('22222222-2222-2222-2222-222222222230', 35, 30, now() - interval '2 days 2 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222231', 50, 42, now() - interval '2 days 1 hour'), -- Terindikasi bullying (tertinggi)
('22222222-2222-2222-2222-222222222232', 25, 20, now() - interval '1 day 6 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222233', 30, 25, now() - interval '1 day 5 hours'), -- Terindikasi bullying
('22222222-2222-2222-2222-222222222234', 20, 16, now() - interval '1 day 4 hours'), -- Tidak terindikasi
('22222222-2222-2222-2222-222222222235', 40, 34, now() - interval '1 day 3 hours')  -- Terindikasi bullying
ON CONFLICT (siswa_id) DO UPDATE SET
  skor_bullying = EXCLUDED.skor_bullying,
  skor_anxiety = EXCLUDED.skor_anxiety,
  waktu_selesai = EXCLUDED.waktu_selesai;

-- 5. Survey Answers Raw (Bullying - Sample for first 3 students)
-- Skor: 0-4 (sesuai skala OBVQ-R: 0=Tidak pernah, 1=1-2 kali, 2=3-4 kali, 3=5-6 kali, 4=7 kali atau lebih)
INSERT INTO survey_answers_raw (siswa_id, tipe, no_pertanyaan, skor, created_at) VALUES
-- Andi (Student 1) - Bullying
('22222222-2222-2222-2222-222222222221', 'bullying', 1, 2, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 'bullying', 2, 1, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 'bullying', 3, 1, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 'bullying', 4, 2, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 'bullying', 5, 1, now() - interval '3 days 5 hours'),
-- ... (total 22 questions, averaging to skor_bullying = 28)

-- Budi (Student 2) - Bullying
('22222222-2222-2222-2222-222222222222', 'bullying', 1, 1, now() - interval '3 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 'bullying', 2, 0, now() - interval '3 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 'bullying', 3, 1, now() - interval '3 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 'bullying', 4, 1, now() - interval '3 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 'bullying', 5, 0, now() - interval '3 days 4 hours')
-- ... (total 22 questions, averaging to skor_bullying = 15)
ON CONFLICT DO NOTHING;

-- 6. Anxiety Answers Detail (OPTIONAL - skip if table not exist)
-- This is optional detailed data, main scores are in survey_results
-- Uncomment below if you want to populate detailed anxiety answers

/*
INSERT INTO anxiety_answers_detail (siswa_id, category_no, symptoms_checked, emoticon_score, created_at) VALUES
-- Andi (Student 1) - Anxiety
('22222222-2222-2222-2222-222222222221', 1, ARRAY['Merasa tegang atau gelisah', 'Mudah merasa takut'], 2, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 2, ARRAY['Sulit tidur atau tidur tidak nyenyak'], 2, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 3, ARRAY['Kesulitan berkonsentrasi'], 1, now() - interval '3 days 5 hours'),
('22222222-2222-2222-2222-222222222221', 4, ARRAY['Mudah marah atau tersinggung'], 2, now() - interval '3 days 5 hours'),
-- ... (total 14 categories, averaging to skor_anxiety = 24)

-- Budi (Student 2) - Anxiety
('22222222-2222-2222-2222-222222222222', 1, ARRAY['Merasa tegang atau gelisah'], 1, now() - interval '3 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 2, ARRAY['Sulit tidur atau tidur tidak nyenyak'], 1, now() - interval '3 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 3, ARRAY['Mudah lupa'], 1, now() - interval '3 days 4 hours')
-- ... (total 14 categories, averaging to skor_anxiety = 12)
ON CONFLICT DO NOTHING;
*/

-- 7. Guiding Question Answers (Sample - 3 pertanyaan statistika)
INSERT INTO guiding_question_answers (siswa_id, no_pertanyaan, jawaban, created_at) VALUES
-- Question 1: Apa variabel X dan Y dalam diagram pencar kita?
('22222222-2222-2222-2222-222222222221', 1, 'Variabel X adalah skor bullying dan variabel Y adalah skor kecemasan.', now() - interval '2 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 1, 'X: Pengalaman bullying, Y: Tingkat kecemasan siswa.', now() - interval '2 days 3 hours'),
('22222222-2222-2222-2222-222222222223', 1, 'Sumbu X menunjukkan skor bullying, sumbu Y menunjukkan skor anxiety.', now() - interval '2 days 2 hours'),

-- Question 2: Bagaimana pola hubungan yang terlihat dalam diagram pencar?
('22222222-2222-2222-2222-222222222221', 2, 'Terlihat pola positif, semakin tinggi skor bullying, semakin tinggi juga skor kecemasan.', now() - interval '2 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 2, 'Ada hubungan positif yang cukup kuat antara bullying dan anxiety.', now() - interval '2 days 3 hours'),
('22222222-2222-2222-2222-222222222223', 2, 'Pola menunjukkan korelasi positif, titik-titik cenderung naik dari kiri bawah ke kanan atas.', now() - interval '2 days 2 hours'),

-- Question 3: Apa kesimpulan yang bisa diambil dari data ini?
('22222222-2222-2222-2222-222222222221', 3, 'Kesimpulannya adalah pengalaman bullying berhubungan dengan tingkat kecemasan siswa.', now() - interval '2 days 4 hours'),
('22222222-2222-2222-2222-222222222222', 3, 'Siswa yang mengalami bullying lebih tinggi cenderung memiliki tingkat kecemasan yang lebih tinggi pula.', now() - interval '2 days 3 hours'),
('22222222-2222-2222-2222-222222222223', 3, 'Data menunjukkan pentingnya pencegahan bullying untuk menjaga kesehatan mental siswa.', now() - interval '2 days 2 hours')
ON CONFLICT DO NOTHING;

-- 8. Solutions (Diagram Pencar & Rekomendasi)
INSERT INTO solutions (siswa_id, pola_hubungan, siswa_perlu_perhatian, rekomendasi, ai_feedback, created_at) VALUES
-- Student 1: Andi
('22222222-2222-2222-2222-222222222221', 'positif', 'Kartika Sari (Skor Bullying: 50, Skor Anxiety: 42)', 
'Berdasarkan analisis diagram pencar, terdapat korelasi positif antara pengalaman bullying dan tingkat kecemasan siswa. Rekomendasi: 1) Program anti-bullying di sekolah, 2) Konseling untuk siswa dengan skor tinggi, 3) Pelatihan empati untuk seluruh siswa.', 
'Analisis kamu sudah bagus! Kamu berhasil mengidentifikasi pola hubungan positif. Untuk analisis lebih mendalam, coba perhatikan juga outlier dan distribusi data. Pertimbangkan faktor lain yang mungkin mempengaruhi hubungan ini.',
now() - interval '1 day 5 hours'),

-- Student 2: Budi
('22222222-2222-2222-2222-222222222222', 'positif', 'Kartika Sari (Skor Bullying: 50, Skor Anxiety: 42)',
'Diagram pencar menunjukkan tren positif yang jelas. Siswa dengan pengalaman bullying tinggi memiliki kecemasan tinggi. Rekomendasi: melibatkan orang tua dalam program pencegahan, membuat sistem pelaporan bullying yang aman, dan menyediakan support system di sekolah.',
'Bagus sekali! Rekomendasi kamu sangat komprehensif. Saran: tambahkan juga time-frame untuk implementasi program dan metrik untuk mengukur efektivitas.',
now() - interval '1 day 4 hours'),

-- Student 3: Citra
('22222222-2222-2222-2222-222222222223', 'positif', 'Kartika Sari (Skor Bullying: 50, Skor Anxiety: 42)',
'Korelasi positif menunjukkan bullying berdampak pada kesehatan mental. Rekomendasi: 1) Workshop kesehatan mental, 2) Peer support program, 3) Monitoring rutin kondisi siswa.',
'Analisis kamu tepat! Untuk melengkapi, coba pikirkan juga cara mengukur keberhasilan program yang kamu usulkan. Data apa yang perlu dikumpulkan untuk evaluasi?',
now() - interval '1 day 3 hours')
ON CONFLICT (siswa_id) DO UPDATE SET
  pola_hubungan = EXCLUDED.pola_hubungan,
  siswa_perlu_perhatian = EXCLUDED.siswa_perlu_perhatian,
  rekomendasi = EXCLUDED.rekomendasi,
  ai_feedback = EXCLUDED.ai_feedback,
  created_at = EXCLUDED.created_at;

-- 9. AI Interactions (Chat history sample)
INSERT INTO ai_interactions (siswa_id, halaman, prompt, response, created_at) VALUES
-- Andi - Guiding Resource
('22222222-2222-2222-2222-222222222221', 'guiding_resource', 
'Apa itu diagram pencar?', 
'Diagram pencar (scatter plot) adalah grafik yang menunjukkan hubungan antara dua variabel numerik. Setiap titik di diagram mewakili satu observasi dengan nilai pada sumbu X dan Y. Diagram ini berguna untuk melihat pola korelasi, trend, dan outlier dalam data.', 
now() - interval '3 days 2 hours'),

('22222222-2222-2222-2222-222222222221', 'guiding_resource', 
'Bagaimana cara membaca diagram pencar?', 
'Untuk membaca diagram pencar: 1) Lihat arah titik-titik (naik = korelasi positif, turun = negatif, acak = tidak ada korelasi), 2) Lihat kedekatan titik ke garis trend (makin dekat = korelasi kuat), 3) Identifikasi outlier (titik yang jauh dari pola umum). Dalam kasus kita, jika titik-titik naik dari kiri bawah ke kanan atas, artinya semakin tinggi bullying, semakin tinggi anxiety.', 
now() - interval '3 days 1 hour'),

-- Budi - Solution
('22222222-2222-2222-2222-222222222222', 'solution', 
'Mengapa siswa dengan bullying tinggi memiliki anxiety tinggi?', 
'Bullying dapat menyebabkan trauma psikologis yang memicu kecemasan. Siswa yang mengalami bullying sering merasa tidak aman, terisolasi, dan kehilangan kepercayaan diri. Ini semua adalah faktor yang berkontribusi pada tingkat kecemasan yang lebih tinggi. Data kita menunjukkan korelasi ini secara empiris.', 
now() - interval '1 day 4 hours'),

-- Citra - Hasil Tes
('22222222-2222-2222-2222-222222222223', 'hasil_tes', 
'Bagaimana cara menginterpretasi scatter plot dengan outlier?', 
'Outlier adalah titik yang berbeda signifikan dari pola umum. Dalam scatter plot, outlier bisa menunjukkan: 1) Kasus khusus yang perlu perhatian (misalnya siswa dengan bullying rendah tapi anxiety tinggi - mungkin ada faktor lain), 2) Error dalam pengumpulan data, 3) Fenomena unik yang perlu investigasi lebih lanjut. Jangan langsung membuang outlier, analisis dulu penyebabnya.', 
now() - interval '1 day 2 hours')
ON CONFLICT DO NOTHING;

-- Summary Statistics
SELECT 
  'Data Summary for Kelas XLTAE7' as info,
  (SELECT COUNT(*) FROM siswa WHERE kelas_id = '11111111-1111-1111-1111-111111111111') as total_students,
  (SELECT COUNT(*) FROM essential_question_answers WHERE siswa_id IN (SELECT id FROM siswa WHERE kelas_id = '11111111-1111-1111-1111-111111111111')) as eq_answers,
  (SELECT COUNT(*) FROM survey_results WHERE siswa_id IN (SELECT id FROM siswa WHERE kelas_id = '11111111-1111-1111-1111-111111111111')) as survey_completed,
  (SELECT COUNT(*) FROM solutions WHERE siswa_id IN (SELECT id FROM siswa WHERE kelas_id = '11111111-1111-1111-1111-111111111111')) as solutions_submitted,
  (SELECT ROUND(AVG(skor_bullying)) FROM survey_results WHERE siswa_id IN (SELECT id FROM siswa WHERE kelas_id = '11111111-1111-1111-1111-111111111111')) as avg_bullying_score,
  (SELECT ROUND(AVG(skor_anxiety)) FROM survey_results WHERE siswa_id IN (SELECT id FROM siswa WHERE kelas_id = '11111111-1111-1111-1111-111111111111')) as avg_anxiety_score;
