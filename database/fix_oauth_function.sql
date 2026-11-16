-- =====================================================
-- FIX: Ambiguous column reference in upsert_teacher_google_oauth
-- =====================================================
-- Run this AFTER update_guru_table_with_oauth.sql

-- Drop existing function
DROP FUNCTION IF EXISTS upsert_teacher_google_oauth(TEXT, TEXT, TEXT, TEXT);

-- Recreate with fixed ambiguous column reference
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
    v_username TEXT;
    v_existing_record RECORD;
    v_is_new BOOLEAN := FALSE;
BEGIN
    -- Check if user exists by google_id
    SELECT g.* INTO v_existing_record
    FROM guru g
    WHERE g.google_id = p_google_id;
    
    IF v_existing_record.id IS NOT NULL THEN
        -- User exists - update last info
        UPDATE guru 
        SET 
            nama = COALESCE(p_nama, nama),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            email = p_email,
            email_verified = TRUE,
            updated_at = NOW()
        WHERE google_id = p_google_id
        RETURNING guru.id, guru.nama, guru.email, guru.username, guru.google_id, guru.avatar_url 
        INTO v_guru_id, v_existing_record.nama, v_existing_record.email, v_username, v_existing_record.google_id, v_existing_record.avatar_url;
        
        v_is_new := FALSE;
    ELSE
        -- Check if email exists (user might have registered locally first)
        SELECT g.* INTO v_existing_record
        FROM guru g
        WHERE g.email = p_email AND g.auth_provider = 'local';
        
        IF v_existing_record.id IS NOT NULL THEN
            -- Link Google account to existing local account
            UPDATE guru 
            SET 
                google_id = p_google_id,
                auth_provider = 'google',
                avatar_url = COALESCE(p_avatar_url, avatar_url),
                email_verified = TRUE,
                updated_at = NOW()
            WHERE email = p_email AND auth_provider = 'local'
            RETURNING guru.id, guru.nama, guru.email, guru.username, guru.google_id, guru.avatar_url 
            INTO v_guru_id, v_existing_record.nama, v_existing_record.email, v_username, v_existing_record.google_id, v_existing_record.avatar_url;
            
            v_is_new := FALSE;
        ELSE
            -- Create new user
            -- Generate unique username from email
            v_username := LOWER(SPLIT_PART(p_email, '@', 1));
            
            -- FIX: Add table prefix to disambiguate column reference
            WHILE EXISTS (SELECT 1 FROM guru WHERE guru.username = v_username) LOOP
                v_username := v_username || floor(random() * 1000)::text;
            END LOOP;
            
            -- Insert new teacher
            INSERT INTO guru (
                nama,
                email,
                username,
                google_id,
                auth_provider,
                avatar_url,
                email_verified,
                password,
                sekolah
            ) VALUES (
                p_nama,
                p_email,
                v_username,
                p_google_id,
                'google',
                p_avatar_url,
                TRUE,
                NULL,
                'Belum diisi'
            )
            RETURNING guru.id, guru.nama, guru.email, guru.username, guru.google_id, guru.avatar_url 
            INTO v_guru_id, v_existing_record.nama, v_existing_record.email, v_username, v_existing_record.google_id, v_existing_record.avatar_url;
            
            v_is_new := TRUE;
        END IF;
    END IF;
    
    -- Return user data
    RETURN QUERY
    SELECT 
        v_guru_id,
        COALESCE(v_existing_record.nama, p_nama),
        COALESCE(v_existing_record.email, p_email),
        v_username,
        COALESCE(v_existing_record.google_id, p_google_id),
        COALESCE(v_existing_record.avatar_url, p_avatar_url),
        v_is_new;
END;
$$ LANGUAGE plpgsql;

-- Verify function was created successfully
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'upsert_teacher_google_oauth'
    ) THEN
        RAISE NOTICE '✅ Function upsert_teacher_google_oauth successfully recreated!';
    ELSE
        RAISE EXCEPTION '❌ Function creation failed!';
    END IF;
END $$;
