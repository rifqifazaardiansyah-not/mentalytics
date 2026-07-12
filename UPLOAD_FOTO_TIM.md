# 📸 Panduan Upload Foto Tim

## Lokasi Upload
Semua foto diupload ke folder: **`public/assets/team/`**

## Nama File yang Dibutuhkan

### 1. Dosen Pembimbing (Highlight Special)
```
advisor.jpg
```
**Nama**: Dr. Nuriana Rachmani Dewi (Nino Adhi), M.Pd.  
**Ukuran**: 800x800px (square)  
**Catatan**: Akan ditampilkan lebih besar dan prominent di halaman About Us

### 2. Anggota Tim
```
najwa.jpg    → Najwa Qoirun Nisa (Pendidikan Matematika)
rifqi.jpg    → Rifqi Faza Ardiansyah (Sistem Informasi)
nada.jpg     → Nada Syifa Salsabila (Pendidikan Biologi)
dewi.jpg     → Dewi Amalia Khasani (Pendidikan Biologi)
```
**Ukuran**: 600x600px (square)

## Format File: JPG/JPEG (Disarankan)

**Kenapa JPG/JPEG?**
- ✅ Ukuran file lebih kecil (loading cepat)
- ✅ Kualitas sudah sangat bagus untuk foto profil
- ✅ Kompatibel di semua browser
- ✅ Mudah di-compress tanpa kehilangan kualitas signifikan

**Spesifikasi:**
- Format: JPG atau JPEG
- Resolusi: 600-800px x 600-800px
- Max file size: 500KB per foto
- Compression: 80-90%

## Quick Steps

1. **Edit Foto**:
   - Crop ke square (1:1 ratio)
   - Resize ke 800x800px (dosen) atau 600x600px (tim)
   - Background netral/blur lebih bagus
   - Save as JPG dengan quality 85-90%

2. **Rename**:
   - Sesuai nama file di atas
   - Lowercase semua
   - Contoh: `advisor.jpg`, `najwa.jpg`

3. **Upload**:
   - Copy file ke `public/assets/team/`
   - Refresh browser di halaman About Us

## Tools Online Gratis

- **Resize**: https://www.iloveimg.com/resize-image
- **Remove Background**: https://www.remove.bg/
- **Compress JPG**: https://squoosh.app/

## Preview di Browser

Setelah upload, buka: **http://localhost:3001/about**

Foto akan tampil:
- Dosen: Lingkaran besar dengan border putih & shadow (highlight)
- Tim: Grid 4 kolom dengan hover effect

---

**Lihat panduan lengkap**: `public/assets/team/README.md`
