-- Add missing columns to users table if they don't exist
DO $$
BEGIN
    -- Check if profile_picture column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_picture TEXT;
    END IF;

    -- Check if first_name column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    END IF;

    -- Check if last_name column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    END IF;

    -- Check if phone_number column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
    END IF;

    -- Check if department column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'department'
    ) THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;
END
$$; 