-- DEBUG: Check all triggers and constraints that might cause ambiguous error

-- 1. Check all triggers on kelas table
SELECT '=== TRIGGERS ON kelas TABLE ===' AS info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'kelas'
  AND event_object_schema = 'public';

-- 2. Check all triggers on guru_kelas table
SELECT '=== TRIGGERS ON guru_kelas TABLE ===' AS info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'guru_kelas'
  AND event_object_schema = 'public';

-- 3. Check foreign key constraints
SELECT '=== FOREIGN KEY CONSTRAINTS ===' AS info;
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('kelas', 'guru_kelas', 'siswa')
  AND tc.table_schema = 'public';

-- 4. List all functions that might be involved
SELECT '=== ALL FUNCTIONS RELATED TO KELAS ===' AS info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%kelas%' OR routine_name LIKE '%guru%')
ORDER BY routine_name;

-- 5. Check if there are any policies on these tables
SELECT '=== ROW LEVEL SECURITY POLICIES ===' AS info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('kelas', 'guru_kelas', 'guru', 'siswa')
  AND schemaname = 'public';
