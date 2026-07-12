# 🤝 Contributing to Mentalytics

Terima kasih ingin berkontribusi ke Mentalytics! Dokumen ini menjelaskan workflow dan best practices untuk development.

---

## 🚀 Getting Started

### 1. Setup Development Environment

```bash
# Clone repository
git clone https://github.com/USERNAME/mentalytics.git
cd mentalytics

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local dan isi dengan API keys yang sebenarnya

# Run development server
npm run dev
```

Buka http://localhost:3000 untuk melihat aplikasi.

---

## 📁 Project Structure

```
mentalytics/
├── src/
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components (AppShell, NavDrawer)
│   │   ├── ai/          # AI Chat components
│   │   ├── milo/        # Milo character components
│   │   ├── survey/      # Survey-related components
│   │   ├── chart/       # Chart components
│   │   └── ui/          # Generic UI components
│   ├── pages/           # Page components (route handlers)
│   │   └── belajar/     # Learning flow pages
│   ├── context/         # React Context providers
│   ├── lib/             # Utility libraries (supabase, stats, gemini)
│   ├── data/            # Static data
│   └── router.jsx       # Route definitions
├── public/
│   └── assets/          # Static assets (images, icons)
├── supabase/
│   ├── migrations/      # Database schema migrations
│   └── functions/       # Supabase Edge Functions
└── documentation files
```

---

## 🔄 Development Workflow

### Branch Strategy

```bash
# Create new branch for feature
git checkout -b feature/nama-fitur

# Or for bug fix
git checkout -b fix/nama-bug

# Make changes and commit
git add .
git commit -m "feat: deskripsi perubahan"

# Push branch
git push origin feature/nama-fitur

# Create Pull Request di GitHub
```

### Commit Message Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: tambah AI chat panel di Hasil Tes page
fix: perbaiki scatter plot rendering di mobile
docs: update deployment guide
style: format code dengan prettier
refactor: simplify survey submission logic
```

---

## 🎨 Code Style

### React Components

```jsx
// Use functional components with hooks
import { useState, useEffect } from 'react';

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      {/* JSX */}
    </div>
  );
}
```

### Tailwind CSS

```jsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-primary-100 rounded-lg">
  <h2 className="text-xl font-semibold text-ink-900">Title</h2>
</div>

// Avoid inline styles, prefer Tailwind
// ❌ Bad:
<div style={{ padding: '16px', backgroundColor: '#d4edf6' }}>

// ✅ Good:
<div className="p-4 bg-primary-100">
```

### Design Tokens

Gunakan design tokens dari `design.md`:

```jsx
// Colors
className="bg-primary-100"    // Background lembut
className="bg-primary-500"    // Accent hijau utama
className="text-ink-900"      // Teks utama
className="text-ink-600"      // Teks sekunder
className="border-primary-300" // Border lembut

// Typography
className="font-poppins font-semibold text-2xl" // Heading
className="font-inter text-base"                // Body
```

---

## 🧪 Testing

### Manual Testing Checklist

Sebelum commit perubahan besar:

- [ ] Test di Chrome/Edge
- [ ] Test di Firefox
- [ ] Test di Safari (jika ada Mac)
- [ ] Test mobile view (DevTools responsive mode)
- [ ] Test form submissions
- [ ] Test navigation (no 404s)
- [ ] Check browser console (no errors)

### Build Testing

```bash
# Always test build before committing
npm run build
npm run preview

# Check http://localhost:4173
```

---

## 🗄️ Database Changes

### Adding New Migration

```sql
-- supabase/migrations/0008_nama_migration.sql

-- Add your SQL here
CREATE TABLE new_table (
  id uuid primary key default uuid_generate_v4(),
  -- columns
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "public_all_new_table" 
  ON new_table 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
```

**Testing Migration:**
1. Apply migration di Supabase Dashboard (SQL Editor)
2. Test CRUD operations dari aplikasi
3. Verify RLS policies bekerja
4. Commit migration file

---

## 🤖 AI Context Updates

### Updating Gemini AI Prompts

File: `src/lib/geminiService.js`

```javascript
// Add new context
const NEW_CONTEXT = `
Kamu adalah AI Coach di Mentalytics yang...

ATURAN:
1. ...
2. ...

CONTOH INTERAKSI:
User: ...
AI: ...
`;

// Export context
export const CONTEXTS = {
  guiding_resource: GUIDING_RESOURCE_CONTEXT,
  solution: SOLUTION_CONTEXT,
  hasil_tes: HASIL_TES_CONTEXT,
  new_context: NEW_CONTEXT, // Add here
};
```

**Testing AI Context:**
1. Update context di `geminiService.js`
2. Test chat dengan berbagai input
3. Verify AI responses sesuai guidelines
4. Check database logging (`ai_interactions` table)

---

## 📱 Adding New Pages

### Page Creation Checklist

1. **Create page component:**
   ```jsx
   // src/pages/NewPage.jsx
   export default function NewPage() {
     return (
       <div className="container mx-auto p-6">
         <h1 className="text-3xl font-bold">New Page</h1>
       </div>
     );
   }
   ```

2. **Add route:**
   ```jsx
   // src/router.jsx
   import NewPage from './pages/NewPage';
   
   // In routes array:
   {
     path: '/new-page',
     element: <NewPage />,
   }
   ```

3. **Add navigation (if needed):**
   ```jsx
   // src/components/layout/NavDrawer.jsx
   <NavLink to="/new-page">New Page</NavLink>
   ```

4. **Test:**
   - Navigate to page
   - Refresh page (no 404)
   - Check mobile responsive
   - Verify navigation works

---

## 🔐 Security Best Practices

### Environment Variables

```jsx
// ✅ Good: Use env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// ❌ Bad: Hardcode sensitive data
const supabaseUrl = 'https://...';
```

### API Calls

```jsx
// ✅ Good: Use Supabase client
const { data, error } = await supabase
  .from('table')
  .select('*');

// ❌ Bad: Direct SQL (SQL injection risk)
const query = `SELECT * FROM table WHERE id = ${userId}`;
```

### Input Validation

```jsx
// ✅ Good: Validate user input
const handleSubmit = (e) => {
  e.preventDefault();
  const text = e.target.text.value.trim();
  if (!text || text.length > 500) {
    alert('Input tidak valid');
    return;
  }
  // Process...
};
```

---

## 🐛 Debugging

### Common Issues

**1. Component Not Rendering:**
```jsx
// Check:
- Import statement correct?
- Component exported?
- Route defined?
- No syntax errors? (check console)
```

**2. Supabase Connection Failed:**
```jsx
// Check:
- Environment variables set?
- Supabase project not paused?
- RLS policies correct?
- Network tab in DevTools for error details
```

**3. AI Not Responding:**
```jsx
// Check:
- VITE_GEMINI_API_KEY set?
- API quota not exceeded?
- Console errors?
- Network tab for API call status
```

### Debugging Tools

```jsx
// Console logging (remove before commit)
console.log('Debug:', variable);

// React DevTools (install browser extension)
// - Inspect component props/state
// - View component tree

// Network Tab (F12 → Network)
// - Check API calls
// - Inspect request/response
// - Check status codes
```

---

## 📚 Documentation Updates

When making changes, update relevant documentation:

- **New feature:** Update `README.md` and `design.md`
- **API changes:** Update `design.md` (section 6: Konsep AI)
- **Database changes:** Add migration + update `design.md` (section 5)
- **Deployment changes:** Update deployment docs
- **Bug fixes:** Add note in commit message

---

## 🚀 Deployment

### Preview Deployment (Automatic)

Setiap branch otomatis mendapat preview URL dari Vercel:

```bash
git push origin feature/my-feature
# Vercel builds and provides preview URL in PR
```

### Production Deployment

Production deployment hanya dari `main` branch:

```bash
# Merge PR ke main di GitHub
# Vercel automatically deploys to production

# Or manually:
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
```

---

## ✅ Pull Request Checklist

Sebelum submit PR:

- [ ] Code tested locally (dev + build + preview)
- [ ] No console errors or warnings
- [ ] Follows code style guidelines
- [ ] Environment variables documented (if added new)
- [ ] Database migrations added (if schema changed)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention
- [ ] No merge conflicts with main
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (if UI changes)

---

## 🆘 Getting Help

- **Documentation:** Check `DEPLOYMENT_GUIDE.md`, `design.md`, `README.md`
- **Supabase Issues:** https://supabase.com/docs
- **React/Vite Issues:** https://vitejs.dev/guide/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Stack Overflow:** Tag dengan `react`, `supabase`, `vite`

---

## 📞 Contact

Untuk pertanyaan atau diskusi:
- Create issue di GitHub
- Discussion board di GitHub
- Team communication channel

---

**Thank you for contributing to Mentalytics! 🎉**

*Building better mental health awareness through technology.*
