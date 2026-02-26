-- Add email column to orders table
ALTER TABLE orders ADD COLUMN email TEXT;

-- Update existing orders to have a placeholder email if needed
UPDATE orders SET email = 'non-renseigné@ballouagriconnect.com' WHERE email IS NULL;