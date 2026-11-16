-- =====================================================
-- FINAL FIX: OAuth function with proper column references
-- =====================================================

DROP FUNCTION IF EXISTS upsert_teacher_google_oauth(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION upsert_teacher_google_oauth(
    p_google_id TEXT,
    p_email TEXT,
    p_nama TEXT,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    nama TEXT,
    email TEXT,
    username TEXT,
    google_id TEXT,
    avatar_url TEXT,
    is_new_user BOOLEAN
) AS $$
DECLARE
    v_guru_id UUID;
    v_is_new BOOLEAN := FALSE;
    v_username TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- Check if user exists by google_id
    SELECT g.id INTO v_guru_id
    FROM guru g
    WHERE g.google_id = p_google_id;
    
    IF v_guru_id IS NOT NULL THEN
        -- User exists - just update info
        UPDATE guru g
        SET 
            nama = COALESCE(p_nama, g.nama),
            avatar_url = COALESCE(p_avatar_url, g.avatar_url),
            email = p_email,
            email_verified = TRUE,
            updated_at = NOW()
        WHERE g.google_id = p_google_id;
        
        v_is_new := FALSE;
    ELSE
        -- Check if email exists with local auth
        SELECT g.id INTO v_guru_id
        FROM guru g
        WHERE g.email = p_email AND g.auth_provider = 'local';
        
        IF v_guru_id IS NOT NULL THEN
            -- Link Google to existing local account
            UPDATE guru g
            SET 
                google_id = p_google_id,
                auth_provider = 'google',
                avatar_url = COALESCE(p_avatar_url, g.avatar_url),
                email_verified = TRUE,
                updated_at = NOW()
            WHERE g.id = v_guru_id;
            
            v_is_new := FALSE;
        ELSE
            -- Create new user
            -- Generate unique username
            v_username := LOWER(SPLIT_PART(p_email, '@', 1));
            
            -- Ensure uniqueness
            WHILE EXISTS (SELECT 1 FROM guru g WHERE g.username = v_username) LOOP
                v_counter := v_counter + 1;
                v_username := LOWER(SPLIT_PART(p_email, '@', 1)) || v_counter::text;
            END LOOP;
            
            -- Insert new teacher
            INSERT INTO guru (
                nama, email, username, google_id, auth_provider,
                avatar_url, email_verified, password, sekolah
            ) VALUES (
                p_nama, p_email, v_username, p_google_id, 'google',
                p_avatar_url, TRUE, NULL, 'Belum diisi'
            )
            RETURNING guru.id INTO v_guru_id;
            
            v_is_new := TRUE;
        END IF;
    END IF;
    
    -- Return final user data from database
    RETURN QUERY
    SELECT 
        g.id,
        g.nama,
        g.email,
        g.username,
        g.google_id,
        g.avatar_url,
        v_is_new
    FROM guru g
    WHERE g.id = v_guru_id;
END;
$$ LANGUAGE plpgsql;

-- Verify and test
DO $$
DECLARE
    test_result RECORD;
BEGIN
    RAISE NOTICE '✅ Function upsert_teacher_google_oauth created successfully!';
    RAISE NOTICE 'Testing with real Google data...';
    
    -- Test with your actual Google data
    SELECT * INTO test_result
    FROM upsert_teacher_google_oauth(
        '110564987459793416550',
        'vaezaa.54@gmail.com',
        'Vaeza',
        'https://lh3.googleusercontent.com/a/ACg8ocLF_UmXkj6cYD6nyfav8tWOOPFSAby40IEfA6WG8DmKPG0zEA=s96-c'
    );
    
    IF test_result.id IS NOT NULL THEN
        RAISE NOTICE '✅ Success! User: % | Username: % | New: %', 
            test_result.nama, test_result.username, test_result.is_new_user;
    ELSE
        RAISE EXCEPTION '❌ Function returned no data!';
    END IF;
END $$;
