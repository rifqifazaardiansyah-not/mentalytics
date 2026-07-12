# Presentation View - Implementation

## Overview
Halaman baru yang menggabungkan hasil diagram pencar dengan rekomendasi dan langkah aksi untuk presentasi kelompok.

## Purpose
Menyediakan tampilan presentasi yang lengkap dan terorganisir untuk:
- Presentasi kelompok ke kelompok lain
- Menampilkan semua hasil kerja dalam satu halaman
- Memudahkan diskusi dan feedback

## Features

### 1. Diagram Pencar Display
- ✅ Diagram pencar hasil input siswa
- ✅ Regression line yang telah dibuat
- ✅ Grid lines untuk referensi
- ✅ Axis labels (X dan Y)
- ✅ Scale labels
- ✅ Responsive SVG

### 2. Correlation Info
- ✅ Jenis Korelasi (Positif/Negatif/Tidak Ada)
- ✅ Kekuatan Korelasi (Lemah/Sedang/Kuat/Sangat Kuat)
- ✅ Koefisien r dengan 3 desimal
- ✅ Visual card dengan gradient background

### 3. Rekomendasi Section
- ✅ Display rekomendasi yang ditulis siswa
- ✅ Formatted dengan whitespace-pre-wrap
- ✅ Fallback jika belum ada rekomendasi
- ✅ Button untuk kembali ke Solution page

### 4. Langkah Aksi Section
- ✅ Display langkah aksi konkret
- ✅ Formatted dengan whitespace-pre-wrap
- ✅ Fallback jika belum ada langkah aksi
- ✅ Button untuk kembali ke Solution page

### 5. Tips Presentasi
- ✅ 5 tips untuk presentasi efektif
- ✅ Visual card dengan gradient amber/orange
- ✅ Numbered list untuk struktur

## Data Sources

### Diagram Data (from localStorage)
```javascript
const diagramKey = `eksplorasi_diagram_progress_${siswaId}`
```

Fields:
- `variableX`: Variable for X-axis (e.g., "Bullying")
- `variableY`: Variable for Y-axis (e.g., "Kecemasan")
- `inputtedPoints`: Array of {x, y, no} points
- `regressionLine`: {point1: {x,y}, point2: {x,y}}
- `correlationScore`: Number (r value)
- `scaleX`: {min, max}
- `scaleY`: {min, max}

### Solution Data (from Supabase)
```javascript
await supabase
  .from('solutions')
  .select('*')
  .eq('siswa_id', siswaId)
  .single()
```

Fields:
- `rekomendasi`: Text of recommendation
- `langkah_aksi`: Text of action steps
- `checklist`: JSON string of assessment

## URL
`/kegiatan-belajar/the-challenge/presentation`

## Navigation Flow

### To Presentation Page
From Solution page → Click "Lihat Halaman Presentasi" button

### From Presentation Page
- Back button → Solution page
- "Tulis Rekomendasi" button (if empty) → Solution page
- "Tulis Langkah Aksi" button (if empty) → Solution page

## UI/UX Features

### Header
- Gradient background (primary to purple)
- Back button to Solution
- Icon: Users (group icon)
- Title: "Presentasi Kelompok"
- Subtitle with student name

### Color Scheme
- **Diagram section**: Blue (TrendingUp icon)
- **Rekomendasi section**: Primary/Purple (Lightbulb icon)
- **Langkah Aksi section**: Green (Target icon)
- **Tips section**: Amber/Orange gradient

### Animations
- Stagger animation dengan delay (0.1, 0.2, 0.3, 0.4)
- Smooth fade-in dari opacity 0 to 1
- Y-axis translation dari 20px to 0

### Responsive Design
- Max-width: 6xl (1280px)
- Padding: 4 (16px)
- SVG scales with container
- Grid untuk correlation info (1 col mobile, 3 cols desktop)

## Diagram Rendering

### SVG Configuration
```javascript
const width = 600
const height = 400
const padding = 60
```

### Scale Functions
```javascript
const scaleXFunc = (value) => {
  const range = data.scaleX.max - data.scaleX.min
  return padding + ((value - data.scaleX.min) / range) * (width - 2 * padding)
}

const scaleYFunc = (value) => {
  const range = data.scaleY.max - data.scaleY.min
  return height - padding - ((value - data.scaleY.min) / range) * (height - 2 * padding)
}
```

### Elements Rendered
1. Grid lines (11x11, opacity 0.2)
2. X and Y axes (black, 2px)
3. Arrow heads (polygons)
4. Axis labels (centered text)
5. Scale labels (min/max values)
6. Regression line (red, dashed, 3px)
7. Data points (blue circles, 6px radius, 2px stroke)

## Correlation Interpretation

### Strength Calculation
```javascript
const absR = Math.abs(correlationScore)
if (absR <= 0.3) return 'Tidak Berkorelasi'
if (absR <= 0.5) return 'Lemah'
if (absR <= 0.7) return 'Sedang'
if (absR <= 0.9) return 'Kuat'
return 'Sangat Kuat'
```

### Direction
```javascript
if (Math.abs(r) <= 0.3) return 'Tidak Berkorelasi'
return r > 0 ? 'Korelasi Positif' : 'Korelasi Negatif'
```

## Tips for Presentation

1. **Diagram**: Jelaskan variabel yang dipilih dan mengapa
2. **Pola**: Tunjukkan korelasi yang ditemukan dan artinya
3. **Rekomendasi**: Jelaskan KENAPA pilih rekomendasi berdasarkan data
4. **Action**: Paparkan langkah konkret & realistis
5. **Q&A**: Siap menjawab pertanyaan

## Error Handling

### No Diagram Data
- Shows diagram with empty points
- Correlation info shows "Belum dianalisis"
- Still displays structure

### No Solution Data
- Shows empty state dengan message
- Provides button to go back to Solution page
- Does not break page layout

### Missing Student ID
- Redirects to /kelas with alert
- Prevents accessing with invalid state

## Testing Checklist

### Data Loading
- [ ] Diagram data loads from localStorage correctly
- [ ] Solution data loads from Supabase correctly
- [ ] Handles missing data gracefully
- [ ] Shows loading state while fetching

### Diagram Display
- [ ] All data points render correctly
- [ ] Regression line shows if exists
- [ ] Grid lines display properly
- [ ] Axis labels are correct
- [ ] Scale labels match data range
- [ ] SVG is responsive

### Content Display
- [ ] Rekomendasi displays with proper formatting
- [ ] Langkah aksi displays with proper formatting
- [ ] Empty states show appropriate messages
- [ ] Tips presentasi displays all 5 items

### Navigation
- [ ] Back button returns to Solution page
- [ ] Empty state buttons navigate to Solution page
- [ ] URL is correct (/kegiatan-belajar/the-challenge/presentation)

### Responsive
- [ ] Mobile view displays properly
- [ ] Desktop view displays properly
- [ ] SVG scales correctly
- [ ] Text is readable on all screen sizes

## Files Modified/Created

### Created
- `src/pages/belajar/PresentationView.jsx` - New presentation page

### Modified
- `src/router.jsx` - Added route for PresentationView
- `src/pages/belajar/Solution.jsx` - Updated button to navigate to presentation

## Integration Points

### With Eksplorasi Diagram Pencar
- Reads diagram data from same localStorage key
- Uses exact same structure
- No data transformation needed

### With Solution Page
- Reads solution data from same database table
- Uses same siswa_id for lookup
- Consistent data model

### With Router
- New route: `/kegiatan-belajar/the-challenge/presentation`
- Protected route (requires login)
- Part of The Challenge flow

## Use Cases

### Use Case 1: View Complete Results
```
Student completes:
1. Eksplorasi Diagram → Creates scatter plot
2. Solution → Writes recommendation & action
3. Clicks "Lihat Halaman Presentasi"
4. Sees complete presentation view
```

### Use Case 2: Prepare for Presentation
```
Before presentation:
1. Open presentation view
2. Review all content
3. Practice explaining diagram
4. Prepare to answer questions
```

### Use Case 3: During Presentation
```
During class:
1. Open presentation view on projector
2. Walk through each section
3. Point to diagram as explaining
4. Show recommendation & action
5. Get feedback from peers
```

### Use Case 4: Incomplete Work
```
If solution not complete:
1. Open presentation view
2. See diagram (already done)
3. See empty state for recommendation
4. Click button to go back
5. Complete recommendation
6. Return to presentation view
```

## Future Enhancements

### Phase 2: Export Features
- Export as PDF for printing
- Export as image for sharing
- Generate presentation slides

### Phase 3: Comparison View
- Compare with other groups
- See class average correlation
- Identify similarities/differences

### Phase 4: Interactive Elements
- Click points to see details
- Toggle regression line on/off
- Zoom in on diagram
- Annotation tools

### Phase 5: Feedback Integration
- Allow other groups to leave comments
- Rating system for recommendations
- Peer review workflow

## Notes

- All data is per-student (isolated by siswa_id)
- No group collaboration features (yet)
- Read-only view (cannot edit from presentation)
- Optimized for projector display
- Print-friendly styling

## Accessibility

- Semantic HTML structure
- Clear headings hierarchy (h1, h2, h3)
- Alt text would be needed for SVG (future)
- Sufficient color contrast
- Large clickable areas for buttons

## Performance

- Minimal data fetching (single Supabase query)
- localStorage read is fast
- SVG renders client-side
- No heavy computations
- Smooth animations with Framer Motion

---

**Status**: ✅ Implemented & Ready for Testing
**URL**: `/kegiatan-belajar/the-challenge/presentation`
