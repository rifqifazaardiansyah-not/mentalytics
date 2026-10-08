# 🗄️ Export Data via Supabase Dashboard

## ✅ **Cara Paling Gampang & Lengkap!**

### 1. Buka Supabase Dashboard
```
https://supabase.com/dashboard
→ Pilih project Mentalytics
```

### 2. SQL Editor
Klik **SQL Editor** di sidebar kiri

### 3. Copy Query
Buka file `SUPABASE_QUERIES.sql`  
Pilih query yang kamu mau (ada 11 query)

### 4. Ganti Class ID
```sql
\set class_id 'YOUR_CLASS_ID'
```
Ganti `YOUR_CLASS_ID` dengan:
- Login ke app → Console → `localStorage.getItem('mentalytics_class_id')`
- Atau dari table `kelas` → copy UUID

### 5. Run Query
- Paste query ke SQL Editor
- Klik **RUN** atau `Ctrl+Enter`
- Tunggu hasil

### 6. Download
- Klik **Download CSV** di bawah hasil
- Atau copy → paste ke Excel/Sheets

---

## 📊 **Available Queries**

### **QUERY 1: DATA LENGKAP** ⭐ (Recommended)
```sql
SELECT s.nama, eq.jawaban, sr.skor_bullying, sr.skor_anxiety, 
       ed.correlation_score, sol.rekomendasi, ref.reflection_text, ...
FROM siswa s
LEFT JOIN ... (semua table)
WHERE s.kelas_id = 'xxx'
```
**Output:** 1 row per siswa dengan SEMUA data

---

### **QUERY 2: SISWA + BASIC INFO**
Daftar siswa + info kelas

### **QUERY 3: ESSENTIAL QUESTIONS**
Jawaban Essential Question per siswa

### **QUERY 4: SURVEY RESULTS (DETAIL)**
Skor + kategori + anxiety symptoms detail

### **QUERY 5: EKSPLORASI DIAGRAM**
Variables, correlation, points, regression line

### **QUERY 6: GUIDING QUESTIONS**
Semua jawaban guiding question per siswa

### **QUERY 7: SOLUTIONS**
Rekomendasi + action plan + checklist

### **QUERY 8: REFLECTIONS**
Reflection text per siswa

### **QUERY 9: SUMMARY STATISTICS** 📈
Completion rates, avg scores, max/min

### **QUERY 10: RAW SURVEY ANSWERS**
Detail jawaban per item survey

### **QUERY 11: DIAGRAM POINTS (EXPANDED)**
Individual data points dari diagram (JSON expanded)

---

## 🎯 **Quick Start (Copy-Paste)**

### Untuk Data Lengkap:
```sql
-- GANTI class_id di baris ini:
SELECT 
  s.nama AS student_name,
  eq.jawaban AS essential_question,
  sr.skor_bullying,
  sr.skor_anxiety,
  sr.kategori_bullying,
  sr.kategori_kecemasan,
  ed.x_axis_var,
  ed.y_axis_var,
  ed.correlation_score,
  ed.is_completed AS diagram_completed,
  sol.rekomendasi,
  ref.reflection_text
FROM siswa s
LEFT JOIN essential_question_answers eq ON s.id = eq.siswa_id
LEFT JOIN survey_results sr ON s.id = sr.siswa_id
LEFT JOIN eksplorasi_diagram_progress ed ON s.id = ed.siswa_id
LEFT JOIN solutions sol ON s.id = sol.siswa_id
LEFT JOIN reflections ref ON s.id = ref.siswa_id
WHERE s.kelas_id = '8106d000-5b2d-4ea3-b206-a04f7ba9adcf' -- ← GANTI INI
ORDER BY s.nama;
```

**Run → Download CSV → Done!** ✅

---

## 💡 **Tips**

### Export sebagai JSON:
Wrap query dengan `json_agg()`:
```sql
SELECT json_agg(t) FROM (
  -- query kamu disini
) t;
```

### Filter by completion:
Tambahkan WHERE condition:
```sql
WHERE s.kelas_id = 'xxx' 
  AND sr.skor_bullying IS NOT NULL  -- sudah isi survey
  AND ed.is_completed = true         -- sudah selesai diagram
```

### Custom columns:
Pilih column yang kamu mau aja:
```sql
SELECT 
  s.nama,
  sr.skor_bullying,
  sr.skor_anxiety
FROM siswa s
JOIN survey_results sr ON s.id = sr.siswa_id
WHERE s.kelas_id = 'xxx'
```

---

## 🔍 **Troubleshooting**

### "column does not exist"
- Check nama column di table editor
- Case sensitive!

### "relation does not exist"
- Check nama table
- Pastikan RLS policies allow read

### Empty results
- Check class_id benar
- Check siswa sudah submit data

### "permission denied"
- Login ke Supabase Dashboard
- Check RLS policies
- Atau run query dengan service_role key

---

## 📈 **Untuk Lomba**

**Recommended workflow:**

1. **Run QUERY 1** → Download CSV → Data lengkap
2. **Run QUERY 9** → Screenshot → Summary statistics
3. **Run QUERY 4** → Download CSV → Detail survey per siswa
4. **Run QUERY 5** → Download CSV → Correlation analysis

**Tools analysis:**
- Excel/Google Sheets: Pivot tables, charts
- Python: pandas, matplotlib, seaborn
- R: tidyverse, ggplot2
- SPSS/Stata: Statistical analysis

---

## ✅ **Advantages Supabase Query**

✅ **Lebih lengkap** - Dapet semua kolom  
✅ **Lebih fleksibel** - Custom query sesuai kebutuhan  
✅ **Lebih cepat** - Direct database access  
✅ **No code** - Copy-paste SQL aja  
✅ **CSV/JSON** - Export format apapun  

vs Script Browser:
- ❌ Bisa error kalau browser console
- ❌ Terbatas column yang diambil
- ❌ Perlu running app dulu

---

**Last Updated:** 2026-09-18  
**Recommended:** Query 1 untuk data lengkap + Query 9 untuk summary
