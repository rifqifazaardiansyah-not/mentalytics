-- ========================================
-- SUPABASE SQL QUERIES - Export Data Kelas
-- ========================================
-- Cara pakai:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy query di bawah
-- 3. GANTI '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' dengan Class ID kamu
-- 4. Run → Download CSV
-- ========================================

-- ========================================
-- QUERY 1: DATA LENGKAP (ALL IN ONE) ⭐
-- ========================================
-- Join semua table untuk dapet data lengkap per siswa

SELECT 
  s.id AS student_id,
  s.nama AS student_name,
  k.kode_kelas AS class_code,
  k.nama_kelas AS class_name,
  
  -- Essential Question
  eq.jawaban AS essential_question,
  eq.waktu_submit AS eq_submitted_at,
  
  -- Survey Results
  sr.skor_bullying,
  sr.skor_anxiety,
  sr.kategori_bullying,
  sr.kategori_kecemasan,
  sr.waktu_selesai AS survey_completed_at,
  
  -- Eksplorasi Diagram
  ed.x_axis_var,
  ed.y_axis_var,
  ed.x_scale,
  ed.y_scale,
  ed.correlation_score,
  ed.is_completed AS diagram_completed,
  ed.current_step AS diagram_step,
  
  -- Solution
  sol.rekomendasi,
  sol.langkah_aksi,
  sol.checklist,
  
  -- Reflection
  ref.reflection_text,
  ref.submitted_at AS reflection_submitted_at,
  
  -- Guiding Question (count)
  (SELECT COUNT(*) FROM guiding_question_answers WHERE siswa_id = s.id) AS guiding_question_count

FROM siswa s
LEFT JOIN kelas k ON s.kelas_id = k.id
LEFT JOIN essential_question_answers eq ON s.id = eq.siswa_id
LEFT JOIN survey_results sr ON s.id = sr.siswa_id
LEFT JOIN eksplorasi_diagram_progress ed ON s.id = ed.siswa_id
LEFT JOIN solutions sol ON s.id = sol.siswa_id
LEFT JOIN reflections ref ON s.id = ref.siswa_id

WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama;

-- Hasil: Download as CSV dari Supabase Dashboard


-- ========================================
-- QUERY 2: SISWA + BASIC INFO
-- ========================================
SELECT 
  s.id,
  s.nama,
  s.kelas_id,
  k.kode_kelas,
  s.created_at
FROM siswa s
LEFT JOIN kelas k ON s.kelas_id = k.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama;


-- ========================================
-- QUERY 3: ESSENTIAL QUESTIONS
-- ========================================
SELECT 
  s.nama AS student_name,
  eq.jawaban AS answer,
  eq.waktu_submit AS submitted_at
FROM essential_question_answers eq
JOIN siswa s ON eq.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama;


-- ========================================
-- QUERY 4: SURVEY RESULTS (DETAIL)
-- ========================================
SELECT 
  s.nama AS student_name,
  sr.skor_bullying,
  sr.skor_anxiety,
  sr.kategori_bullying,
  sr.kategori_kecemasan,
  sr.waktu_selesai AS completed_at,
  
  -- Anxiety details
  ad.gejala_fisik AS physical_symptoms,
  ad.gejala_kognitif AS cognitive_symptoms,
  ad.gejala_perilaku AS behavioral_symptoms
  
FROM survey_results sr
JOIN siswa s ON sr.siswa_id = s.id
LEFT JOIN anxiety_answers_detail ad ON sr.siswa_id = ad.siswa_id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY sr.skor_bullying DESC, sr.skor_anxiety DESC;


-- ========================================
-- QUERY 5: EKSPLORASI DIAGRAM
-- ========================================
SELECT 
  s.nama AS student_name,
  ed.x_axis_var,
  ed.y_axis_var,
  ed.x_scale,
  ed.y_scale,
  ed.correlation_score,
  ed.inputted_points,
  ed.regression_line,
  ed.is_completed,
  ed.current_step,
  ed.updated_at
FROM eksplorasi_diagram_progress ed
JOIN siswa s ON ed.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama;


-- ========================================
-- QUERY 6: GUIDING QUESTIONS
-- ========================================
SELECT 
  s.nama AS student_name,
  gq.pertanyaan AS question,
  gq.jawaban AS answer,
  gq.waktu_submit AS submitted_at
FROM guiding_question_answers gq
JOIN siswa s ON gq.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama, gq.waktu_submit;


-- ========================================
-- QUERY 7: SOLUTIONS
-- ========================================
SELECT 
  s.nama AS student_name,
  sol.rekomendasi,
  sol.langkah_aksi,
  sol.checklist,
  sol.created_at,
  sol.updated_at
FROM solutions sol
JOIN siswa s ON sol.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama;


-- ========================================
-- QUERY 8: REFLECTIONS
-- ========================================
SELECT 
  s.nama AS student_name,
  ref.reflection_text,
  ref.submitted_at,
  ref.created_at
FROM reflections ref
JOIN siswa s ON ref.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama;


-- ========================================
-- QUERY 9: SUMMARY STATISTICS
-- ========================================
SELECT 
  COUNT(DISTINCT s.id) AS total_students,
  
  -- Completion counts
  COUNT(DISTINCT eq.siswa_id) AS completed_essential_q,
  COUNT(DISTINCT sr.siswa_id) AS completed_survey,
  COUNT(DISTINCT CASE WHEN ed.is_completed THEN ed.siswa_id END) AS completed_diagram,
  COUNT(DISTINCT sol.siswa_id) AS completed_solution,
  COUNT(DISTINCT ref.siswa_id) AS completed_reflection,
  
  -- Average scores
  ROUND(AVG(sr.skor_bullying), 2) AS avg_bullying,
  ROUND(AVG(sr.skor_anxiety), 2) AS avg_anxiety,
  ROUND(AVG(ed.correlation_score), 3) AS avg_correlation,
  
  -- Max/Min scores
  MAX(sr.skor_bullying) AS max_bullying,
  MIN(sr.skor_bullying) AS min_bullying,
  MAX(sr.skor_anxiety) AS max_anxiety,
  MIN(sr.skor_anxiety) AS min_anxiety

FROM siswa s
LEFT JOIN essential_question_answers eq ON s.id = eq.siswa_id
LEFT JOIN survey_results sr ON s.id = sr.siswa_id
LEFT JOIN eksplorasi_diagram_progress ed ON s.id = ed.siswa_id
LEFT JOIN solutions sol ON s.id = sol.siswa_id
LEFT JOIN reflections ref ON s.id = ref.siswa_id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!;


-- ========================================
-- QUERY 10: RAW SURVEY ANSWERS (DETAIL)
-- ========================================
-- Untuk analisis item per item survey
SELECT 
  s.nama AS student_name,
  raw.survey_type,
  raw.answers,
  raw.waktu_selesai
FROM survey_answers_raw raw
JOIN siswa s ON raw.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
ORDER BY s.nama, raw.survey_type;


-- ========================================
-- QUERY 11: DIAGRAM POINTS (EXPANDED)
-- ========================================
-- Extract individual data points from JSON
SELECT 
  s.nama AS student_name,
  ed.x_axis_var,
  ed.y_axis_var,
  ed.correlation_score,
  jsonb_array_elements(ed.inputted_points::jsonb) AS data_point
FROM eksplorasi_diagram_progress ed
JOIN siswa s ON ed.siswa_id = s.id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI!
  AND ed.inputted_points IS NOT NULL
ORDER BY s.nama;


-- ========================================
-- TIPS EXPORT:
-- ========================================
-- 1. Run query di SQL Editor
-- 2. Klik "Download CSV" di hasil query
-- 3. Atau copy hasil → paste ke Excel/Sheets
-- 4. Untuk JSON: wrap query dengan json_agg()
--    SELECT json_agg(t) FROM (...) t;
-- ========================================
