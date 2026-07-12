# Halaman Hasil Tes - Documentation

## Overview
Halaman Hasil Tes menampilkan hasil asesmen individual siswa berdasarkan survei bullying dan kecemasan yang telah diisi. Halaman ini menggunakan AI untuk memberikan rekomendasi personal yang disesuaikan dengan kategori hasil asesmen.

## Fitur Utama

### 1. **Tampilan Hasil Individual**
   - **Skor Bullying**: 0-200 (40 pertanyaan)
   - **Skor Kecemasan**: 0-100 (20 pertanyaan)
   - Visual card dengan warna yang disesuaikan kategori
   - Progress bar untuk visualisasi skor
   - Kategori jelas berdasarkan pedoman penskoran

### 2. **Pedoman Penskoran**

#### **Bullying:**
| Skor | Kategori |
|------|----------|
| ≥ 22 | Terindikasi sebagai korban bullying |
| < 22 | Tidak terindikasi sebagai korban bullying |

#### **Anxiety (Kecemasan):**
| Skor | Kategori |
|------|----------|
| < 14 | Tidak terdapat kecemasan |
| 14-20 | Kecemasan ringan |
| 21-27 | Kecemasan sedang |
| 28-41 | Kecemasan berat |
| 42-56 | Kecemasan panik |

### 3. **Color Coding System**

#### Bullying:
- 🟢 **Green** (< 22): Tidak terindikasi
- 🔴 **Red** (≥ 22): Terindikasi korban bullying

#### Anxiety:
- 🟢 **Green** (< 14): Tidak ada kecemasan
- 🟡 **Yellow** (14-20): Kecemasan ringan
- 🟠 **Orange** (21-27): Kecemasan sedang
- 🔴 **Red** (28-56): Kecemasan berat/panik

### 4. **AI-Generated Recommendations**

#### Proses Automatic Generation:
1. **Load Data**: Ambil hasil survey dari database
2. **Generate Prompt**: Buat prompt dengan skor & kategori
3. **Stream Response**: AI memberikan rekomendasi secara streaming
4. **Save to DB**: Simpan interaksi ke tabel `ai_interactions`

#### Format Rekomendasi AI:
- Penjelasan hasil dalam bahasa mudah dipahami
- Validasi perasaan siswa
- Rekomendasi praktis yang bisa dilakukan
- Arahan kapan harus mencari bantuan profesional
- Tone: Supportive, non-judgmental, empowering

### 5. **AI Context: HASIL_TES**

#### Karakteristik Context:
- **Role**: Personal Counselor (Konselor Pribadi)
- **Approach**: Inform → Reassure → Guide → Empower → Support
- **Language**: Sederhana, tidak menggunakan jargon psikologi
- **Tone**: Warm, supportive, non-judgmental

#### Batasan Ketat:
- ❌ **TIDAK** melakukan diagnosis klinis
- ❌ **TIDAK** mengubah hasil interpretasi instrumen
- ❌ **TIDAK** memberikan saran medis/terapi profesional
- ❌ **TIDAK** membuat siswa merasa hopeless
- ✅ **HANYA** jelaskan hasil, validasi perasaan, berikan langkah praktis

#### Strategi Berdasarkan Kategori:

**Bullying Tidak Terindikasi:**
- Tone: Appreciative & Preventive
- Focus: Pertahankan positif, jadi ally untuk teman

**Bullying Terindikasi:**
- Tone: Validating & Supportive
- Focus: Validasi perasaan, bukan salah siswa, arahkan ke bantuan
- Rekomendasi: Bicara dengan dewasa, dokumentasi, cari support

**Anxiety Tidak Ada:**
- Tone: Positive & Encouraging
- Focus: Pertahankan pola hidup sehat

**Anxiety Ringan:**
- Tone: Normalizing & Actionable
- Focus: Teknik sederhana (breathing, journaling, olahraga)

**Anxiety Sedang:**
- Tone: Validating & Guiding
- Focus: Mindfulness, identifikasi trigger, pertimbangkan guru BK

**Anxiety Berat/Panik:**
- Tone: Caring & Directive
- Focus: **SEGERA** ke profesional (orang tua, BK, konselor)
- Arahan crisis hotline: 119 ext 8

### 6. **Crisis Handling**

Jika siswa menunjukkan:
- Self-harm intention
- Suicidal thoughts
- Severe distress
- Panic attack

AI akan:
1. Arahkan ke bantuan profesional **SEGERA**
2. Berikan nomor hotline crisis (119 ext 8)
3. **STOP** conversation
4. Validasi keberanian untuk meminta tolong

### 7. **Floating AI Button**

- **Context**: `hasil_tes`
- **Fungsi**: Konsultasi lebih lanjut dengan Milo
- **Use Case**:
  - Siswa ingin bertanya lebih detail tentang hasil
  - Siswa butuh validasi perasaan
  - Siswa butuh klarifikasi rekomendasi
  - Siswa ingin diskusi langkah-langkah praktis

### 8. **Additional Support Information**

#### Crisis Hotline:
- **Nomor**: 119 ext 8
- **Kapan**: Situasi darurat (self-harm, suicidal thoughts)

#### Guru BK / Konselor:
- **Lokasi**: Ruang BK sekolah
- **Kapan**: Kecemasan sedang-berat, bullying terindikasi

## Technical Implementation

### Data Flow:
```
1. Load siswa_id dari localStorage
   ↓
2. Fetch survey_results dari Supabase (filter by siswa_id)
   ↓
3. Calculate kategori berdasarkan pedoman
   ↓
4. Generate AI recommendation (automatic)
   ↓
5. Display hasil + rekomendasi + floating AI
```

### Database Tables Used:
- **survey_results**: Ambil skor individual
- **ai_interactions**: Simpan rekomendasi AI

### AI Integration:
```javascript
// Create chat session
const chat = createHasilTesChat()

// Generate recommendation
const prompt = `Halo Milo! Ini hasil asesmen saya:
- Skor Bullying: ${skor}/200 (${kategori})
- Skor Kecemasan: ${skor}/100 (${kategori})

Bisakah kamu jelaskan hasil ini dan berikan rekomendasi personal?`

// Stream response
for await (const chunk of streamGeminiResponse(chat, prompt, 'hasil_tes')) {
  // Update UI dengan streaming text
}
```

## UI Components

### Result Cards:
- **Design**: Responsive 2-column grid (1 column on mobile)
- **Content**: Icon, skor, progress bar, kategori, pedoman
- **Styling**: Adaptive colors based on category

### AI Recommendation Section:
- **Design**: Gradient background (purple-primary)
- **Content**: Sparkles icon, streaming text, disclaimer
- **Loading State**: Spinner + loading text

### Support Info:
- **Design**: 2-column grid (1 column on mobile)
- **Content**: Crisis hotline, BK contact

## User Experience

### Loading States:
1. **Initial Load**: Spinner center screen
2. **AI Generation**: Inline spinner + loading text
3. **Streaming**: Text appears gradually

### Error Handling:
- Survey not found → Show error + back button
- AI generation failed → Show fallback message + suggest floating AI
- Network error → Show error message

### Navigation:
- **Selesai button**: Navigate back to The Challenge
- **Floating AI button**: Opens AI chat panel (context: hasil_tes)

## Key Features for Education Research

### 1. **No Medical Diagnosis**
   - AI tidak melakukan diagnosis
   - Hanya interpretasi berdasarkan pedoman instrumen
   - Clear disclaimer di UI

### 2. **Adaptive Recommendations**
   - AI menyesuaikan bahasa & tone berdasarkan kategori
   - Tidak generik, personal untuk setiap siswa
   - Fokus pada actionable steps

### 3. **Safe & Supportive**
   - Validasi perasaan siswa
   - Tidak membuat siswa merasa hopeless
   - Clear guidance kapan mencari bantuan profesional

### 4. **Educational Value**
   - Siswa belajar self-awareness
   - Siswa paham kapan perlu bantuan
   - Siswa dapat langkah konkret untuk self-help

## Files Modified/Created

### Created:
- `e:\LIDM\MENTALYTICS\src\pages\belajar\HasilTes.jsx` (full implementation)

### Modified:
- `e:\LIDM\MENTALYTICS\src\lib\geminiService.js`:
  - Added `HASIL_TES_CONTEXT` (~1000 lines)
  - Added `createHasilTesChat()` function
  - Updated context selection in `streamGeminiResponse()` and `sendGeminiMessage()`
  - Exported `createHasilTesChat` in default export

## Testing Checklist

- [ ] Load hasil tes dengan skor berbeda-beda
- [ ] Verify kategori sesuai pedoman penskoran
- [ ] Check color coding sesuai kategori
- [ ] Test AI recommendation generation
- [ ] Verify streaming text works properly
- [ ] Test floating AI button dengan context hasil_tes
- [ ] Check responsive design di mobile
- [ ] Verify data saved to ai_interactions table
- [ ] Test error handling (no survey data)
- [ ] Check navigation buttons work
- [ ] Verify disclaimer & support info displayed
- [ ] Test dengan berbagai kombinasi skor (low/med/high)

## Example Scenarios

### Scenario 1: Low Risk
- Bullying: 15 (Tidak terindikasi)
- Anxiety: 10 (Tidak ada kecemasan)
- Expected: Green cards, positive tone, preventive recommendations

### Scenario 2: Medium Risk
- Bullying: 25 (Terindikasi)
- Anxiety: 22 (Kecemasan sedang)
- Expected: Red/Orange cards, validating tone, directive recommendations

### Scenario 3: High Risk
- Bullying: 30 (Terindikasi)
- Anxiety: 45 (Kecemasan panik)
- Expected: Red cards, caring tone, immediate professional help guidance

## Future Enhancements

1. **Export Report**: Download hasil tes sebagai PDF
2. **Progress Tracking**: Compare dengan tes sebelumnya (jika retake)
3. **Parent View**: Kirim hasil ke orang tua (dengan consent)
4. **Counselor Dashboard**: Guru BK dapat lihat hasil siswa
5. **Peer Comparison**: Anonymized comparison dengan rata-rata kelas
6. **Action Plan Tracker**: Follow-up untuk rekomendasi yang sudah dilakukan

## Notes

- Halaman ini adalah **endpoint terakhir** dalam flow Challenge-Based Learning
- AI recommendations di-generate **automatic** saat halaman load (tidak perlu manual trigger)
- Floating AI button untuk **konsultasi tambahan** jika siswa butuh
- Pedoman penskoran **tidak boleh diubah** oleh AI - hardcoded sesuai instrumen psikologi
- Focus pada **self-awareness** dan **actionable steps**, bukan diagnosis
