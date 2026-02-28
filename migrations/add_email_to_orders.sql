-- Add email column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;

-- IMPORTANT: Do not backfill with a shared placeholder email.
-- Keep NULLs and handle missing email at the application layer.
