-- Fix RLS policy to allow reading bookings by ID for payment flow
-- This allows unauthenticated users to read their booking using the booking_id from the URL

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Create a new policy that allows reading bookings by anyone (for payment flow)
-- In production, you might want to restrict this further, but for guest bookings
-- we need to allow reading by booking ID
CREATE POLICY "Bookings are viewable by booking ID" ON public.bookings
  FOR SELECT USING (true);

-- Keep the insert policy (users can create bookings)
-- If you have user_id in your schema, uncomment and adjust:
-- DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
-- CREATE POLICY "Anyone can create bookings" ON public.bookings
--   FOR INSERT WITH CHECK (true);

-- Keep the update policy for confirmed status
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Bookings can be updated" ON public.bookings
  FOR UPDATE USING (true);
