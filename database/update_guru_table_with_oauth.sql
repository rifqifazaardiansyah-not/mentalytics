-- =====================================================
-- UPDATE GURU TABLE: Add Username & Google OAuth Support
-- =====================================================

-- Step 1: Add new columns to guru table
ALTER TABLE public.guru 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local' CHECK (auth_provider IN ('local', 'google')),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Step 2: Make password nullable (required for Google OAuth users)
ALTER TABLE public.guru 
ALTER COLUMN password DROP NOT NULL;

-- Step 3: Add constraint: Either password OR google_id must exist
ALTER TABLE public.guru
ADD CONSTRAINT check_auth_method 
CHECK (
  (auth_provider = 'local' AND password IS NOT NULL) OR
  (auth_provider = 'google' AND google_id IS NOT NULL)
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guru_username ON public.guru(username);
CREATE INDEX IF NOT EXISTS idx_guru_google_id ON public.guru(google_id);
CREATE INDEX IF NOT EXISTS idx_guru_auth_provider ON public.guru(auth_provider);

-- Step 5: Update existing data - Generate usernames from emails
UPDATE public.guru
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.guru.username IS 'Unique username for login (alternative to email)';
COMMENT ON COLUMN public.guru.google_id IS 'Google OAuth ID for Google Sign-In users';
COMMENT ON COLUMN public.guru.auth_provider IS 'Authentication provider: local (username/password) or google (OAuth)';
COMMENT ON COLUMN public.guru.avatar_url IS 'Profile picture URL (from Google or uploaded)';
COMMENT ON COLUMN public.guru.email_verified IS 'Whether email has been verified (auto-true for Google)';

-- Step 7: Function to handle Google OAuth login/registration
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
        RETURNING guru.id, guru.nama, guru.email, guru.username, guru.google_id, guru.avatar_url INTO v_guru_id, p_nama, p_email, v_username, p_google_id, p_avatar_url;
        
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
            RETURNING guru.id, guru.nama, guru.email, guru.username, guru.google_id, guru.avatar_url INTO v_guru_id, p_nama, p_email, v_username, p_google_id, p_avatar_url;
            
            v_is_new := FALSE;
        ELSE
            -- Create new user
            -- Generate unique username from email
            v_username := LOWER(SPLIT_PART(p_email, '@', 1));
            
            -- Ensure username is unique
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
                password, -- NULL for Google users
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
                'Belum diisi' -- Default value, can be updated later
            )
            RETURNING guru.id, guru.nama, guru.email, guru.username, guru.google_id, guru.avatar_url INTO v_guru_id, p_nama, p_email, v_username, p_google_id, p_avatar_url;
            
            v_is_new := TRUE;
        END IF;
    END IF;
    
    -- Return user data
    RETURN QUERY
    SELECT 
        v_guru_id,
        p_nama,
        p_email,
        v_username,
        p_google_id,
        p_avatar_url,
        v_is_new;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Update login function to support both username and email
CREATE OR REPLACE FUNCTION login_teacher(
    p_identifier TEXT, -- Can be username OR email
    p_password TEXT
)
RETURNS TABLE (
    id UUID,
    nama TEXT,
    email TEXT,
    username TEXT,
    sekolah TEXT,
    nip TEXT
) AS $$
BEGIN
    -- Try to find user by username or email
    RETURN QUERY
    SELECT 
        g.id,
        g.nama,
        g.email,
        g.username,
        g.sekolah,
        g.nip
    FROM guru g
    WHERE 
        (g.username = p_identifier OR g.email = p_identifier)
        AND g.password = p_password
        AND g.auth_provider = 'local'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Comments for new functions
COMMENT ON FUNCTION upsert_teacher_google_oauth IS 'Handle Google OAuth login - creates new user or updates existing one';
COMMENT ON FUNCTION login_teacher IS 'Login with username OR email plus password (for local auth only)';

-- Step 10: Update sample data with usernames
UPDATE guru 
SET username = 'budi.santoso'
WHERE email = 'budi.santoso@sman1.sch.id' AND username IS NULL;

UPDATE guru 
SET username = 'siti.rahayu'
WHERE email = 'siti.rahayu@sman1.sch.id' AND username IS NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Guru table successfully updated with OAuth support!';
    RAISE NOTICE '✅ New columns: username, google_id, auth_provider, avatar_url, email_verified';
    RAISE NOTICE '✅ Functions created: upsert_teacher_google_oauth(), login_teacher()';
END $$;
