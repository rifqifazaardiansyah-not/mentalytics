-- =====================================================
-- FIX v2: Simplify RETURNING logic in upsert_teacher_google_oauth
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
BEGIN
    -- Check if user exists by google_id
    SELECT guru.id INTO v_guru_id
    FROM guru
    WHERE guru.google_id = p_google_id;
    
    IF v_guru_id IS NOT NULL THEN
        -- User exists - just update info
        UPDATE guru 
        SET 
            nama = COALESCE(p_nama, nama),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            email = p_email,
            email_verified = TRUE,
            updated_at = NOW()
        WHERE guru.google_id = p_google_id;
        
        v_is_new := FALSE;
    ELSE
        -- Check if email exists with local auth
        SELECT guru.id INTO v_guru_id
        FROM guru
        WHERE guru.email = p_email AND guru.auth_provider = 'local';
        
        IF v_guru_id IS NOT NULL THEN
            -- Link Google to existing local account
            UPDATE guru 
            SET 
                google_id = p_google_id,
                auth_provider = 'google',
                avatar_url = COALESCE(p_avatar_url, avatar_url),
                email_verified = TRUE,
                updated_at = NOW()
            WHERE guru.id = v_guru_id;
            
            v_is_new := FALSE;
        ELSE
            -- Create new user
            DECLARE
                v_username TEXT;
                v_counter INTEGER := 0;
            BEGIN
                -- Generate unique username
                v_username := LOWER(SPLIT_PART(p_email, '@', 1));
                
                -- Ensure uniqueness
                WHILE EXISTS (SELECT 1 FROM guru WHERE guru.username = v_username) LOOP
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
            END;
        END IF;
    END IF;
    
    -- Return final user data from database
    RETURN QUERY
    SELECT 
        guru.id,
        guru.nama,
        guru.email,
        guru.username,
        guru.google_id,
        guru.avatar_url,
        v_is_new
    FROM guru
    WHERE guru.id = v_guru_id;
END;
$$ LANGUAGE plpgsql;

-- Test function
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test with sample data
    SELECT * INTO test_result
    FROM upsert_teacher_google_oauth(
        'test_google_id_123',
        'test@example.com',
        'Test User',
        'https://example.com/avatar.jpg'
    );
    
    IF test_result.id IS NOT NULL THEN
        RAISE NOTICE '✅ Function works! Created/Updated user: % (username: %)', test_result.nama, test_result.username;
        -- Clean up test data
        DELETE FROM guru WHERE google_id = 'test_google_id_123';
        RAISE NOTICE '✅ Function upsert_teacher_google_oauth v2 successfully created!';
    ELSE
        RAISE EXCEPTION '❌ Function failed to return data!';
    END IF;
END $$;
