-- Add qr_code column to bookings table
-- This column stores the QR code as a data URL (base64 encoded image)
-- The QR code contains all booking details in JSON format

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.bookings.qr_code IS 'Base64 encoded QR code data URL containing booking details in JSON format';
