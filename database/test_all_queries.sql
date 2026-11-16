-- TEST ALL QUERIES - Run this to identify which query causes the error

-- Test 1: View query (most likely culprit)
SELECT '=== TEST 1: Query v_guru_classes ===' AS test;
SELECT * FROM v_guru_classes LIMIT 5;

-- Test 2: Function create_class_by_teacher
SELECT '=== TEST 2: Test create_class_by_teacher function ===' AS test;
-- Get a test teacher ID
DO $$
DECLARE
    test_guru_id UUID;
    test_result RECORD;
BEGIN
    -- Get first teacher
    SELECT id INTO test_guru_id FROM guru LIMIT 1;
    
    IF test_guru_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with guru_id: %', test_guru_id;
        
        -- Try to create a test class
        SELECT * INTO test_result FROM create_class_by_teacher(
            test_guru_id,
            'TEST CLASS - DELETE ME',
            '2024/2025'
        );
        
        RAISE NOTICE 'Created class: % (kode: %)', test_result.nama_kelas, test_result.kode_kelas;
        
        -- Clean up test class
        DELETE FROM kelas WHERE nama_kelas = 'TEST CLASS - DELETE ME';
        RAISE NOTICE 'Test class deleted';
    ELSE
        RAISE NOTICE 'No guru found in database';
    END IF;
END $$;

-- Test 3: Function link_teacher_to_class
SELECT '=== TEST 3: Test link_teacher_to_class function ===' AS test;
-- This will fail if no active kelas exists, which is OK

-- Test 4: Check if guru_kelas has ambiguous columns
SELECT '=== TEST 4: Check guru_kelas table structure ===' AS test;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'guru_kelas'
ORDER BY ordinal_position;

-- Test 5: Manual join to replicate view query
SELECT '=== TEST 5: Manual join (replicating view) ===' AS test;
SELECT 
    g.id AS guru_id,
    k.id AS kelas_id,
    k.kode_kelas,
    gk.role,
    COUNT(DISTINCT s.id) AS jumlah_siswa
FROM guru g
INNER JOIN guru_kelas gk ON g.id = gk.guru_id
INNER JOIN kelas k ON gk.kelas_id = k.id
LEFT JOIN siswa s ON s.kelas_id = k.id
GROUP BY g.id, k.id, k.kode_kelas, gk.id, gk.role
LIMIT 5;

SELECT '✅ All tests completed. Check output above for errors.' AS result;
